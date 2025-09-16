"use client";

import {
  ArrowRight,
  Bot,
  Brain,
  Building,
  CheckCircle,
  Clock,
  Code,
  Mic,
  MicOff,
  Pause,
  Play,
  Send,
  Square,
  Target,
  Timer,
  User,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DashboardLayout from "@/components/organisms/dashboard-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
  questionType?: "technical" | "behavioral" | "coding" | "system-design";
  isFollowUp?: boolean;
}

interface InterviewSession {
  messages: Message[];
  currentQuestionCount: number;
  totalQuestions: number;
  startTime: Date;
  isComplete: boolean;
  isPaused: boolean;
  isDemoMode: boolean;
  hasPersonalizedIntro: boolean;
}

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);

  const [config] = useState(() => {
    // Always return default values during SSR
    return {
      position: "Frontend Engineer",
      seniority: "mid",
      companyProfile: "faang",
      specificCompany: "",
      interviewMode: "timed",
      interviewType: "technical",
      duration: "30",
      isDemoMode: false,
    };
  });

  // Update config based on search params after hydration
  const [actualConfig, setActualConfig] = useState(config);

  useEffect(() => {
    setIsHydrated(true);
    setActualConfig({
      position: searchParams.get("position") || "Frontend Engineer",
      seniority: searchParams.get("seniority") || "mid",
      companyProfile: searchParams.get("companyProfile") || "faang",
      specificCompany: searchParams.get("specificCompany") || "",
      interviewMode: searchParams.get("interviewMode") || "timed",
      interviewType: searchParams.get("interviewType") || "technical",
      duration: searchParams.get("duration") || "30",
      isDemoMode: searchParams.get("demo") === "true",
    });
  }, [searchParams]);

  // Interview state
  const [session, setSession] = useState<InterviewSession>(() => ({
    messages: [],
    currentQuestionCount: 0,
    totalQuestions: 8, // Default value, will be updated after hydration
    startTime: new Date(),
    isComplete: false,
    isPaused: false,
    isDemoMode: false,
    hasPersonalizedIntro: false,
  }));

  // Update session when actualConfig changes
  useEffect(() => {
    if (isHydrated) {
      setSession(prev => ({
        ...prev,
        totalQuestions: actualConfig.isDemoMode
          ? 3
          : actualConfig.interviewMode === "behavioral"
            ? 6
            : 8,
        isDemoMode: actualConfig.isDemoMode,
      }));
    }
  }, [isHydrated, actualConfig]);

  const [currentMessage, setCurrentMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(Number.POSITIVE_INFINITY);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update time remaining when actualConfig changes
  useEffect(() => {
    if (isHydrated) {
      const newTimeRemaining = actualConfig.interviewMode === "untimed" 
        ? Number.POSITIVE_INFINITY 
        : Number.parseInt(actualConfig.duration, 10) * 60;
      setTimeRemaining(newTimeRemaining);
    }
  }, [isHydrated, actualConfig]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // biome-ignore lint/suspicious/noExplicitAny: Speech Recognition API requires any type
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        // biome-ignore lint/suspicious/noExplicitAny: Browser API requires any type
        (window as any).SpeechRecognition ||
        // biome-ignore lint/suspicious/noExplicitAny: Browser API requires any type
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          console.log("Speech recognition started");
        };

        // biome-ignore lint/suspicious/noExplicitAny: Speech Recognition event types not available
        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            }
          }
          if (transcript) {
            setCurrentMessage(transcript);
          }
        };

        // biome-ignore lint/suspicious/noExplicitAny: Speech Recognition error event types not available
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // AI Response function using Mistral API
  const getAIResponse = async (
    userMessage: string,
    questionCount: number,
    isFollowUp = false,
  ): Promise<Message> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: session.messages,
          interviewConfig: actualConfig,
          questionCount,
          isFollowUp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: data.message,
          timestamp: new Date(),
          questionType: data.questionType as
            | "technical"
            | "behavioral"
            | "coding"
            | "system-design",
          isFollowUp,
        };
      } else {
        throw new Error(data.error || "Failed to get AI response");
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      return {
        id: `ai-error-${Date.now()}`,
        type: "ai",
        content:
          "I apologize, but I'm experiencing technical difficulties. Could you please try again or rephrase your response?",
        timestamp: new Date(),
        questionType: actualConfig.interviewType as
          | "technical"
          | "behavioral"
          | "coding"
          | "system-design",
        isFollowUp,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  // Timer effect
  useEffect(() => {
    if (
      !isInterviewStarted ||
      session.isComplete ||
      session.isPaused ||
      actualConfig.interviewMode === "untimed"
    )
      return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setSession((prev) => ({ ...prev, isComplete: true }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isInterviewStarted,
    session.isComplete,
    session.isPaused,
    actualConfig.interviewMode,
  ]);

  // Format time display
  const formatTime = (seconds: number) => {
    if (seconds === Number.POSITIVE_INFINITY) return "∞";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Pause/Resume interview
  const pauseInterview = () => {
    setSession((prev) => ({ ...prev, isPaused: true }));
  };

  const resumeInterview = () => {
    setSession((prev) => ({ ...prev, isPaused: false }));
  };

  // Stop interview early
  const stopInterview = () => {
    setSession((prev) => ({ ...prev, isComplete: true }));

    // Save progress
    const sessionData = {
      ...session,
      isComplete: true,
      endedEarly: true,
      endTime: new Date(),
    };

    localStorage.setItem("interviewSession", JSON.stringify(sessionData));
    localStorage.setItem("interviewConfig", JSON.stringify(actualConfig));
  };

  // Start interview
  const startInterview = async () => {
    setIsInterviewStarted(true);

    // First message - simple welcome
    const firstWelcomeMessage: Message = {
      id: "welcome-1",
      type: "ai",
      content: actualConfig.isDemoMode
        ? "Hi! Welcome to the Grant Guide interview demo. This is a casual practice session where you can get familiar with our AI interview system. No pressure here - just think of this as talking to the system to see how it works!"
        : "Hi! Welcome to your interview session. I'm excited to chat with you today!",
      timestamp: new Date(),
    };

    setSession((prev) => ({
      ...prev,
      messages: [firstWelcomeMessage],
      startTime: new Date(),
    }));

    // Second message with personalization (after a delay)
    setTimeout(async () => {
      const personalizedIntro = actualConfig.isDemoMode
        ? `I'm Alex, your demo guide! We'll go through just 2-3 casual questions to show you how our interview system works. Feel free to experiment with voice input, ask questions, or just explore the interface. This won't be recorded or scored.`
        : `I'm Sarah, your AI interviewer today. I'll be conducting your ${actualConfig.interviewType} interview for the ${actualConfig.position} position at a ${actualConfig.seniority} level.${actualConfig.interviewMode !== "untimed" ? ` We have ${actualConfig.duration} minutes together.` : ""} You can pause or stop the interview at any time using the controls above. Ready to begin?`;

      const personalizedMessage: Message = {
        id: "welcome-2",
        type: "ai",
        content:
          personalizedIntro +
          (actualConfig.specificCompany
            ? ` This interview is tailored for ${actualConfig.specificCompany.charAt(0).toUpperCase() + actualConfig.specificCompany.slice(1)}-style questions.`
            : ""),
        timestamp: new Date(),
      };

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, personalizedMessage],
        hasPersonalizedIntro: true,
      }));

      // Add first question after another delay
      setTimeout(async () => {
        const firstQuestion = await getAIResponse("", 0);
        setSession((prev) => ({
          ...prev,
          messages: [...prev.messages, firstQuestion],
          currentQuestionCount: 1,
        }));
      }, 1500);
    }, 2000);
  };

  // Send message
  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: currentMessage.trim(),
      timestamp: new Date(),
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    setCurrentMessage("");
    setIsTyping(true);

    try {
      // Decide whether to ask follow-up or new question
      const shouldFollowUp =
        Math.random() > 0.6 &&
        session.currentQuestionCount < session.totalQuestions;

      let aiResponse: Message;

      if (session.currentQuestionCount >= session.totalQuestions) {
        aiResponse = {
          id: `ai-complete-${Date.now()}`,
          type: "ai",
          content: session.isDemoMode
            ? "Great job exploring the demo! You've seen how our AI interview system works - it's conversational, supportive, and designed to help you showcase your best self. When you're ready for a full interview, just head back to the configure page. Thanks for trying it out!"
            : "Excellent work! That concludes our interview session. You've demonstrated strong knowledge and problem-solving skills. I'll now analyze your responses and prepare detailed feedback. Thank you for your time!",
          timestamp: new Date(),
        };

        // Save interview data for analysis (skip for demo mode)
        if (!session.isDemoMode) {
          const updatedSession = {
            ...session,
            messages: [...session.messages, userMessage, aiResponse],
            isComplete: true,
          };
          localStorage.setItem(
            "interviewSession",
            JSON.stringify(updatedSession),
          );
          localStorage.setItem("interviewConfig", JSON.stringify(config));
        }

        setSession((prev) => ({ ...prev, isComplete: true }));
      } else {
        aiResponse = await getAIResponse(
          currentMessage,
          session.currentQuestionCount,
          shouldFollowUp,
        );

        if (!shouldFollowUp) {
          setSession((prev) => ({
            ...prev,
            currentQuestionCount: prev.currentQuestionCount + 1,
          }));
        }
      }

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, aiResponse],
      }));
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  // Voice recording functions using Speech Recognition
  const startRecording = () => {
    if (recognitionRef.current && !isListening) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isInterviewStarted) {
    return (
      <div className="min-h-screen  dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {actualConfig.isDemoMode ? "Try the Demo!" : "Ready to Start?"}
            </CardTitle>
            <CardDescription className="text-lg">
              {actualConfig.isDemoMode ? (
                "Experience our AI interview system with a quick, no-pressure demo"
              ) : (
                <>
                  Your AI-powered {actualConfig.interviewType} interview for{" "}
                  <span className="font-semibold">{actualConfig.position}</span>
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!actualConfig.isDemoMode && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {actualConfig.interviewMode === "untimed"
                      ? "Untimed"
                      : `${actualConfig.duration} minutes`}
                  </Badge>
                  <Badge variant="outline" className="w-full justify-center">
                    <Target className="h-3 w-3 mr-1" />
                    {actualConfig.seniority} Level
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    <Code className="h-3 w-3 mr-1" />
                    {config.interviewType}
                  </Badge>
                  {config.specificCompany && (
                    <Badge variant="outline" className="w-full justify-center">
                      <Building className="h-3 w-3 mr-1" />
                      {config.specificCompany}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {config.isDemoMode && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <Badge variant="outline" className="mb-3">
                  Demo Mode
                </Badge>
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  What to Expect:
                </h3>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Just 2-3 casual practice questions</li>
                  <li>• No scoring or recording</li>
                  <li>• Try voice input and chat features</li>
                  <li>• Get comfortable with the interface</li>
                </ul>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {config.isDemoMode ? "Demo Tips:" : "Interview Tips:"}
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {config.isDemoMode ? (
                  <>
                    <li>• Relax and explore - this is just practice!</li>
                    <li>• Try the voice recording feature</li>
                    <li>• Ask questions to see how the AI responds</li>
                    <li>• Check out the pause/stop controls</li>
                  </>
                ) : (
                  <>
                    <li>
                      • Think out loud to show your problem-solving process
                    </li>
                    <li>• Ask clarifying questions when needed</li>
                    <li>• Use specific examples from your experience</li>
                    <li>• Take your time to understand each question fully</li>
                  </>
                )}
              </ul>
            </div>

            <Button
              onClick={startInterview}
              variant="default"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              {config.isDemoMode ? "Start Demo" : "Start Interview"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create navbar actions for interview controls
  const navbarActions = (
    <>
      {actualConfig.interviewMode !== "untimed" && !session.isDemoMode && (
        <div className="flex items-center space-x-2">
          <Timer className="h-4 w-4" />
          <span
            className={`font-mono font-bold text-sm ${
              timeRemaining < 300
                ? "text-red-500"
                : timeRemaining < 600
                  ? "text-yellow-500"
                  : "text-green-500"
            }`}
          >
            {formatTime(timeRemaining)}
          </span>
          {session.isPaused && (
            <Badge variant="secondary" className="text-xs">
              Paused
            </Badge>
          )}
        </div>
      )}

      {session.isDemoMode && (
        <Badge variant="outline" className="text-xs">
          Demo Mode
        </Badge>
      )}

      <div className="flex items-center space-x-2">
        <Progress
          value={
            (session.currentQuestionCount / session.totalQuestions) * 100
          }
          className="w-24"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {session.currentQuestionCount}/{session.totalQuestions}
        </span>
      </div>

      {/* Interview Controls */}
      <div className="flex items-center space-x-2">
        {!session.isComplete && (
          <>
            {session.isPaused ? (
              <Button
                onClick={resumeInterview}
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700"
              >
                <Play className="h-3 w-3 mr-1" />
                Resume
              </Button>
            ) : (
              <Button
                onClick={pauseInterview}
                variant="outline"
                size="sm"
                className="text-yellow-600 hover:text-yellow-700"
              >
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </Button>
            )}
            <Button
              onClick={stopInterview}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Square className="h-3 w-3 mr-1" />
              Stop
            </Button>
          </>
        )}
      </div>
    </>
  );

  // Create navbar children for interview info
  const navbarChildren = (
    <div className="flex items-center space-x-4 lg:hidden">
      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
        <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h1 className="text-lg font-bold">AI Interview Session</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {actualConfig.position} • {actualConfig.seniority} level
        </p>
      </div>
    </div>
  );

  return (
    <DashboardLayout 
      title="AI Interview Session"
      navbarActions={navbarActions}
      navbarChildren={navbarChildren}
    >

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-120px)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {session.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                } items-start space-x-3`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.type === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg p-4 ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 shadow-sm border"
                  }`}
                >
                  {message.type === "ai" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-code:bg-gray-100 dark:prose-code:bg-gray-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  )}
                  {message.questionType && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {message.questionType}
                      {message.isFollowUp && " • Follow-up"}
                    </Badge>
                  )}
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white dark:bg-gray-800 shadow-sm border rounded-lg p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!session.isComplete && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4">
            {session.isPaused && (
              <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-center">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Interview is paused. Click Resume to continue.
                </p>
              </div>
            )}
            <div className="flex space-x-3">
              <div className="flex-1">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    session.isPaused
                      ? "Interview paused..."
                      : "Type your response here..."
                  }
                  className="min-h-[60px] resize-none"
                  disabled={isLoading || session.isPaused}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={sendMessage}
                  disabled={
                    !currentMessage.trim() || isLoading || session.isPaused
                  }
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant="outline"
                  size="sm"
                  className={isRecording ? "text-red-500" : ""}
                  disabled={session.isPaused}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Interview Complete */}
        {session.isComplete && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              {session.isDemoMode ? "Demo Complete!" : "Interview Complete!"}
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              {session.isDemoMode
                ? "Thanks for trying the demo! Ready for the real thing? Configure your interview settings and let's get started."
                : "Great job! Your interview responses are being analyzed."}
            </p>
            <div className="flex gap-3 justify-center">
              {session.isDemoMode ? (
                <>
                  <Button
                    onClick={() => {
                      window.location.href = "/configure";
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Real Interview
                  </Button>
                  <Button
                    onClick={() => {
                      window.location.href = "/dashboard";
                    }}
                    variant="outline"
                  >
                    Back to Dashboard
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    window.location.href = "/results";
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View Results
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
