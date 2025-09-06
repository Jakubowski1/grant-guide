"use client";

import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle,
  Clock,
  Code,
  MessageSquare,
  Mic,
  MicOff,
  Play,
  Send,
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
import { Input } from "@/components/ui/input";
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
  const [timeRemaining, setTimeRemaining] = useState(() => {
    if (config.interviewMode === "untimed") return Number.POSITIVE_INFINITY;
    return Number.parseInt(config.duration, 10) * 60;
  });
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const getAIResponse = (
    _userMessage: string,
    questionCount: number,
  ): Message => {
    const { interviewMode, interviewType, specificCompany, position } = config;

    // Different question sets based on interview mode
    const responses: Record<string, Record<string, string[]>> = {
      timed: {
        technical: [
          `Great! Let's dive into some technical concepts for ${position}. Can you explain the difference between let, const, and var in JavaScript? You have limited time, so focus on the key differences.`,
          `Quick follow-up - how would you optimize the performance of a React application? Give me your top 3 techniques.`,
          `Time check - explain asynchronous JavaScript. How do Promises differ from async/await?`,
        ],
        behavioral: [
          `Tell me about a time when you had to work under tight deadlines. How did you prioritize your tasks?`,
          `Describe a challenging project you completed. What made it difficult and how did you overcome obstacles?`,
          `How do you handle feedback and criticism from team members or supervisors?`,
        ],
        coding: [
          `Coding challenge time! Write a function that finds the longest palindromic substring. Walk through your approach quickly.`,
          `Next challenge: implement a function to detect if a linked list has a cycle. Focus on efficiency.`,
          `Final coding question: find two numbers in an array that add up to a target. Optimize for time complexity.`,
        ],
        "system-design": [
          `System design question: How would you design a URL shortening service? Give me the high-level architecture in 5 minutes.`,
          `Follow-up: How would you scale this to handle millions of requests? Focus on the key bottlenecks.`,
          `Last question: Design a real-time chat system. What are the main components?`,
        ],
      },
      untimed: {
        technical: [
          `Let's explore technical concepts in depth. Can you explain the difference between let, const, and var in JavaScript? Take your time to cover all aspects including hoisting, scope, and use cases.`,
          `Excellent explanation! Now, let's discuss React performance optimization. What are all the techniques you know, and when would you use each one?`,
          `Great insights! Let's dive deep into asynchronous JavaScript. Compare Promises, async/await, and callbacks. What are the pros and cons of each approach?`,
        ],
        behavioral: [
          `Let's discuss your experience in detail. Tell me about a time when you had to work with a difficult team member. Walk me through the entire situation, your thought process, and the outcome.`,
          `That shows great interpersonal skills. Now, describe the most challenging project you've worked on. I want to understand the technical challenges, team dynamics, and how you approached problem-solving.`,
          `Impressive problem-solving approach. How do you typically handle competing priorities and tight deadlines? Give me specific examples and strategies.`,
        ],
        coding: [
          `Let's work through a coding problem together. Write a function that finds the longest palindromic substring in a given string. Explain your thought process, consider edge cases, and optimize your solution.`,
          `Great approach! Now let's tackle linked lists. Implement a function to detect if a linked list has a cycle. Walk me through different approaches and their trade-offs.`,
          `Excellent! Here's another challenge: Given an array of integers, find two numbers that add up to a specific target. Consider multiple solutions and their complexities.`,
        ],
        "system-design": [
          `Let's design a system together. How would you design a URL shortening service like bit.ly? Start with requirements gathering, then move to high-level design, and we'll dive into details.`,
          `Excellent foundation! Now let's discuss scaling. How would you handle millions of users? Consider database sharding, caching strategies, and load balancing.`,
          `Great system thinking! Let's design a real-time chat application. Consider the architecture, data flow, message delivery, and scalability challenges.`,
        ],
      },
      behavioral: {
        behavioral: [
          `Let's focus on your leadership experience. Tell me about a time when you had to lead a team through a difficult situation.`,
          `Describe a situation where you had to make a decision with incomplete information. How did you approach it?`,
          `Tell me about a time when you disagreed with your manager or team lead. How did you handle it?`,
          `Describe a project where you had to learn a new technology quickly. What was your approach?`,
          `Tell me about a time when you had to give constructive feedback to a colleague.`,
          `Describe a situation where you failed or made a significant mistake. What did you learn?`,
        ],
      },
      whiteboard: {
        coding: [
          `Let's start with a classic algorithm problem. Implement a function to reverse a linked list. Write the code step by step and explain your approach.`,
          `Great! Now let's try a tree problem. Write a function to find the maximum depth of a binary tree. Consider both recursive and iterative approaches.`,
          `Excellent! Here's a dynamic programming challenge: implement the fibonacci sequence with memoization. Optimize for both time and space complexity.`,
          `Perfect! Let's do one more: implement a function to validate if a binary tree is a valid binary search tree. Walk through your logic carefully.`,
        ],
        "system-design": [
          `Let's design on the whiteboard. How would you architect a social media feed system? Start with the basic components and data flow.`,
          `Good start! Now let's add complexity. How would you handle real-time updates and notifications in this system?`,
          `Excellent thinking! Let's design a distributed cache system. What are the key components and how do they interact?`,
        ],
      },
    };

    const modeResponses = responses[interviewMode] || responses.timed;
    const typeResponses =
      modeResponses[interviewType] || responses.timed.technical;
    const responseIndex = questionCount % typeResponses.length;

    let content = typeResponses[responseIndex];

    if (specificCompany) {
      const companyContext: Record<string, string> = {
        google:
          "Keep in mind Google's focus on algorithmic thinking and scalability.",
        meta: "Consider Meta's emphasis on user engagement and large-scale systems.",
        apple: "Think about Apple's attention to detail and user experience.",
        amazon:
          "Remember Amazon's leadership principles and customer obsession.",
        netflix:
          "Consider Netflix's culture of high performance and innovation.",
        microsoft:
          "Think about Microsoft's collaborative approach and technical depth.",
        tesla: "Consider Tesla's focus on innovation and rapid iteration.",
        spotify:
          "Think about Spotify's agile methodology and user-centric design.",
        uber: "Consider Uber's real-time systems and global scale challenges.",
        airbnb:
          "Think about Airbnb's focus on belonging and community building.",
      };

      const context = companyContext[specificCompany];
      if (context) {
        content += ` ${context}`;
      }
    }

    return {
      id: `ai-${Date.now()}`,
      type: "ai",
      content,
      timestamp: new Date(),
      questionType: interviewType as
        | "technical"
        | "behavioral"
        | "coding"
        | "system-design",
      isFollowUp: questionCount > 0,
    };
  };

  const getFollowUpResponse = (_userMessage: string): Message => {
    const { interviewMode } = config;

    const followUps = {
      timed: [
        "Good point! Can you quickly elaborate on the key benefits?",
        "Interesting approach! What's the main trade-off here?",
        "That makes sense. Any potential issues with this solution?",
        "Quick follow-up: how would this perform at scale?",
      ],
      untimed: [
        "That's a thoughtful approach! Can you dive deeper into the implementation details? What specific challenges might you encounter?",
        "Excellent reasoning! Let's explore the edge cases. How would you handle error scenarios and what validation would you implement?",
        "I like your thinking! How would this solution evolve if the requirements changed? What would make it more maintainable?",
        "Great explanation! Can you walk me through a concrete example? How would this work with real data?",
        "Solid approach! What are the performance implications? How would you optimize this for production use?",
      ],
      behavioral: [
        "That's a great example! What would you do differently if you faced a similar situation again?",
        "Interesting approach! How did the other team members react to your decision?",
        "Good insight! What did you learn about yourself from this experience?",
        "That shows good judgment! How do you typically prepare for such challenging situations?",
      ],
      whiteboard: [
        "Good start! Can you trace through your algorithm with a specific example?",
        "Nice approach! What's the time and space complexity of your solution?",
        "Excellent! Are there any edge cases we should consider?",
        "Great implementation! How would you test this function?",
      ],
    };

    const modeFollowUps =
      followUps[interviewMode as keyof typeof followUps] || followUps.timed;
    const randomFollowUp =
      modeFollowUps[Math.floor(Math.random() * modeFollowUps.length)];

    return {
      id: `ai-followup-${Date.now()}`,
      type: "ai",
      content: randomFollowUp,
      timestamp: new Date(),
      isFollowUp: true,
    };
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
  const startInterview = () => {
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
    setTimeout(() => {
      const firstQuestion = getAIResponse("", 0);
      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, firstQuestion],
        currentQuestionCount: 1,
      }));
    }, 2000);
  };

  // Send message
  const sendMessage = () => {
    if (!currentMessage.trim()) return;

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

    // Simulate AI thinking and response
    setTimeout(
      () => {
        setIsTyping(false);

        let aiResponse: Message;

        // Decide whether to ask follow-up or new question
        const shouldFollowUp =
          Math.random() > 0.6 &&
          session.currentQuestionCount < session.totalQuestions;

        if (shouldFollowUp) {
          aiResponse = getFollowUpResponse(currentMessage);
        } else {
          if (session.currentQuestionCount >= session.totalQuestions) {
            aiResponse = {
              id: `ai-complete-${Date.now()}`,
              type: "ai",
              content:
                "Excellent work! That concludes our interview session. You've demonstrated strong technical knowledge and problem-solving skills. I'll now analyze your responses and prepare detailed feedback. Thank you for your time!",
              timestamp: new Date(),
            };
            setSession((prev) => ({ ...prev, isComplete: true }));
          } else {
            aiResponse = getAIResponse(
              currentMessage,
              session.currentQuestionCount,
            );
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
      },
      1500 + Math.random() * 1000,
    ); // Random delay between 1.5-2.5 seconds
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        console.log("Audio recorded:", audioBlob);
        // Could convert to text and add to current message
      };
    }
  };

  if (!isInterviewStarted) {
    const modeIcons = {
      timed: Timer,
      untimed: Brain,
      behavioral: MessageSquare,
      whiteboard: Code,
    };

    const ModeIcon =
      modeIcons[config.interviewMode as keyof typeof modeIcons] || Brain;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-border bg-card">
          <CardHeader className="text-center">
            <ModeIcon className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl">Ready to Start?</CardTitle>
            <CardDescription className="text-lg">
              Your {config.interviewMode} {config.interviewType} interview
              session is configured and ready to begin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Configuration</h3>
                <div className="space-y-1">
                  <Badge variant="secondary">{config.position}</Badge>
                  <Badge variant="secondary">{config.seniority} level</Badge>
                  {config.specificCompany ? (
                    <Badge variant="secondary">{config.specificCompany}</Badge>
                  ) : config.companyProfile ? (
                    <Badge variant="secondary">
                      {config.companyProfile} style
                    </Badge>
                  ) : null}
                  <Badge variant="secondary">{config.interviewType}</Badge>
                  <Badge variant="secondary">{config.interviewMode} mode</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Session Details</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    Duration:{" "}
                    {config.interviewMode === "untimed"
                      ? "Unlimited"
                      : `${config.duration} minutes`}
                  </p>
                  <p>
                    Format:{" "}
                    {config.interviewMode === "whiteboard"
                      ? "Interactive Coding"
                      : "Conversational AI"}
                  </p>
                  <p>Questions: ~{session.totalQuestions} questions</p>
                  <p>
                    Follow-ups:{" "}
                    {config.interviewMode === "timed" ? "Quick" : "Detailed"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">
                {config.interviewMode.charAt(0).toUpperCase() +
                  config.interviewMode.slice(1)}{" "}
                Interview Tips
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {config.interviewMode === "timed" && (
                  <>
                    <li>• Be concise but complete in your answers</li>
                    <li>• Manage your time effectively across questions</li>
                    <li>• Focus on key points and main concepts</li>
                    <li>• Practice quick problem-solving</li>
                  </>
                )}
                {config.interviewMode === "untimed" && (
                  <>
                    <li>
                      • Take your time to think through problems thoroughly
                    </li>
                    <li>• Explore multiple approaches and solutions</li>
                    <li>• Ask clarifying questions when needed</li>
                    <li>• Provide detailed explanations and examples</li>
                  </>
                )}
                {config.interviewMode === "behavioral" && (
                  <>
                    <li>
                      • Use the STAR method (Situation, Task, Action, Result)
                    </li>
                    <li>• Provide specific examples from your experience</li>
                    <li>• Focus on your role and contributions</li>
                    <li>• Reflect on lessons learned and growth</li>
                  </>
                )}
                {config.interviewMode === "whiteboard" && (
                  <>
                    <li>• Think out loud and explain your approach</li>
                    <li>• Start with brute force, then optimize</li>
                    <li>• Consider edge cases and error handling</li>
                    <li>• Discuss time and space complexity</li>
                  </>
                )}
              </ul>
            </div>

            <div className="text-center">
              <Button
                onClick={startInterview}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Play className="h-5 w-5 mr-2" />
                Start{" "}
                {config.interviewMode.charAt(0).toUpperCase() +
                  config.interviewMode.slice(1)}{" "}
                Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-border bg-card">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl">Interview Complete!</CardTitle>
            <CardDescription className="text-lg">
              Excellent work! Your responses are being analyzed by our AI
              system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {session.currentQuestionCount}
                </p>
                <p className="text-sm text-muted-foreground">
                  Questions Discussed
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {Math.floor(
                    (Date.now() - session.startTime.getTime()) / 60000,
                  )}
                  m
                </p>
                <p className="text-sm text-muted-foreground">
                  Session Duration
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {session.messages.filter((m) => m.type === "user").length}
                </p>
                <p className="text-sm text-muted-foreground">Your Responses</p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your detailed feedback and analysis will be available shortly.
                You'll receive insights on technical accuracy, communication
                skills, and areas for improvement.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => {
                    window.location.href = "/results";
                  }}
                >
                  View Results
                </Button>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    window.location.href = "/configure";
                  }}
                >
                  Start New Interview
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress =
    (session.currentQuestionCount / session.totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">AI Interview Session</h1>
                <p className="text-sm text-muted-foreground">
                  {config.position} - {config.interviewType} (
                  {config.interviewMode} mode)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {config.interviewMode !== "untimed" && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-mono text-lg">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              <Badge variant="secondary">
                Question {session.currentQuestionCount} of{" "}
                {session.totalQuestions}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="container mx-auto px-4 py-4">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 container mx-auto px-4 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto">
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "ai" && (
                  <Avatar className="w-8 h-8 bg-primary/20">
                    <AvatarFallback>
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-card border border-border"
                  }`}
                >
                  {message.questionType && !message.isFollowUp && (
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {message.questionType.replace("-", " ")}
                    </Badge>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.type === "user" && (
                  <Avatar className="w-8 h-8 bg-muted">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 bg-primary/20">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  {config.interviewMode === "whiteboard" ? (
                    <Textarea
                      placeholder="Write your code or explanation here... (Press Ctrl+Enter to send)"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="bg-input border-border min-h-[100px] font-mono"
                      disabled={isTyping}
                    />
                  ) : (
                    <Input
                      placeholder="Type your response here... (Press Enter to send)"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-input border-border"
                      disabled={isTyping}
                    />
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className="bg-transparent"
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {config.interviewMode === "whiteboard" && (
                <p className="text-xs text-muted-foreground mt-2">
                  Use Ctrl+Enter to send your code. Format your code with proper
                  indentation.
                </p>
              )}

              {isRecording && (
                <div className="flex items-center gap-2 text-sm text-primary mt-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Recording audio response...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
