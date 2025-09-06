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
  Play,
  Send,
  Target,
  Timer,
  User,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
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
}

export default function InterviewPage() {
  const [config] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return {
        position: params.get("position") || "Frontend Engineer",
        seniority: params.get("seniority") || "mid",
        companyProfile: params.get("companyProfile") || "",
        specificCompany: params.get("specificCompany") || "",
        interviewMode: params.get("interviewMode") || "timed",
        interviewType: params.get("interviewType") || "technical",
        duration: params.get("duration") || "30",
      };
    }
    return {
      position: "Frontend Engineer",
      seniority: "mid",
      companyProfile: "faang",
      specificCompany: "",
      interviewMode: "timed",
      interviewType: "technical",
      duration: "30",
    };
  });

  // Interview state
  const [session, setSession] = useState<InterviewSession>({
    messages: [],
    currentQuestionCount: 0,
    totalQuestions: config.interviewMode === "behavioral" ? 6 : 8,
    startTime: new Date(),
    isComplete: false,
  });

  const [currentMessage, setCurrentMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(() => {
    if (config.interviewMode === "untimed") return Number.POSITIVE_INFINITY;
    return Number.parseInt(config.duration, 10) * 60;
  });
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
          interviewConfig: config,
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
        questionType: config.interviewType as
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
      config.interviewMode === "untimed"
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
  }, [isInterviewStarted, session.isComplete, config.interviewMode]);

  // Format time display
  const formatTime = (seconds: number) => {
    if (seconds === Number.POSITIVE_INFINITY) return "∞";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Start interview
  const startInterview = async () => {
    setIsInterviewStarted(true);

    const welcomeMessages = {
      timed: `Hello! I'm your AI interviewer for today's timed ${config.interviewType} interview session. You have ${config.duration} minutes to complete this interview. I'll be asking you questions about ${config.position} topics at a ${config.seniority} level. Please be concise but thorough in your responses. Ready to begin?`,
      untimed: `Hello! Welcome to your practice ${config.interviewType} interview session. Take your time to think through each question - there's no time pressure here. I'll be asking you questions about ${config.position} topics at a ${config.seniority} level. Feel free to ask for clarification and think out loud. Ready to start?`,
      behavioral: `Hi! I'm here to conduct your behavioral interview. We'll focus on your past experiences, decision-making process, and how you handle various workplace situations. I'll be looking for specific examples from your career as a ${config.position}. Take your time to provide detailed, thoughtful responses. Shall we begin?`,
      whiteboard: `Welcome to your coding interview session! We'll be working through algorithm and system design problems together. Please explain your thought process as you work through each problem, consider edge cases, and optimize your solutions. Think of this as a collaborative problem-solving session. Ready to code?`,
    };

    const welcomeMessage: Message = {
      id: "welcome",
      type: "ai",
      content:
        welcomeMessages[config.interviewMode as keyof typeof welcomeMessages] +
        (config.specificCompany
          ? ` This interview is tailored for ${config.specificCompany.charAt(0).toUpperCase() + config.specificCompany.slice(1)}-style questions.`
          : ""),
      timestamp: new Date(),
    };

    setSession((prev) => ({
      ...prev,
      messages: [welcomeMessage],
      startTime: new Date(),
    }));

    // Add first question after a delay
    setTimeout(async () => {
      const firstQuestion = await getAIResponse("", 0);
      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, firstQuestion],
        currentQuestionCount: 1,
      }));
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
          content:
            "Excellent work! That concludes our interview session. You've demonstrated strong knowledge and problem-solving skills. I'll now analyze your responses and prepare detailed feedback. Thank you for your time!",
          timestamp: new Date(),
        };

        // Save interview data for analysis
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Ready to Start?
            </CardTitle>
            <CardDescription className="text-lg">
              Your AI-powered {config.interviewType} interview for{" "}
              <span className="font-semibold">{config.position}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {config.interviewMode === "untimed"
                    ? "Untimed"
                    : `${config.duration} minutes`}
                </Badge>
                <Badge variant="outline" className="w-full justify-center">
                  <Target className="h-3 w-3 mr-1" />
                  {config.seniority} Level
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

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Interview Tips:
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Think out loud to show your problem-solving process</li>
                <li>• Ask clarifying questions when needed</li>
                <li>• Use specific examples from your experience</li>
                <li>• Take your time to understand each question fully</li>
              </ul>
            </div>

            <Button
              onClick={startInterview}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Interview Session</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {config.position} • {config.seniority} level
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {config.interviewMode !== "untimed" && (
                <div className="flex items-center space-x-2">
                  <Timer className="h-4 w-4" />
                  <span
                    className={`font-mono font-bold ${
                      timeRemaining < 300
                        ? "text-red-500"
                        : timeRemaining < 600
                          ? "text-yellow-500"
                          : "text-green-500"
                    }`}
                  >
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Progress
                  value={
                    (session.currentQuestionCount / session.totalQuestions) *
                    100
                  }
                  className="w-24"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {session.currentQuestionCount}/{session.totalQuestions}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
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
            <div className="flex space-x-3">
              <div className="flex-1">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your response here..."
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isLoading}
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
              Interview Complete!
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Great job! Your interview responses are being analyzed.
            </p>
            <Button
              onClick={() => {
                window.location.href = "/results";
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              View Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
