"use client";

import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Code,
  Download,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/atoms/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalysisResult {
  questionId: string;
  question: string;
  userAnswer: string;
  scores: {
    technical: number;
    completeness: number;
    examples: number;
    problemSolving: number;
    communication: number;
    overall: number;
  };
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  modelAnswer: string;
  suggestions: string[];
  resources: Array<{
    title: string;
    url: string;
    type: "article" | "video" | "course";
  }>;
}

export default function ResultsPage() {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set(),
  );

  // Mock analysis results - would come from AI analysis
  const analysisResults: AnalysisResult[] = [
    {
      questionId: "1",
      question:
        "Explain the difference between let, const, and var in JavaScript. When would you use each?",
      userAnswer:
        "let and const are block-scoped while var is function-scoped. const cannot be reassigned after declaration, let can be reassigned. I use const for values that won't change, let for variables that will change, and avoid var in modern JavaScript.",
      scores: {
        technical: 85,
        completeness: 80,
        examples: 60,
        problemSolving: 75,
        communication: 90,
        overall: 78,
      },
      strengths: [
        "Clear understanding of scoping",
        "Good explanation of const vs let",
        "Modern best practices",
      ],
      weaknesses: [
        "Missing hoisting explanation",
        "No concrete examples provided",
        "Temporal dead zone not mentioned",
      ],
      feedback:
        "Good foundational understanding! You correctly identified the key differences in scoping and reassignment. To strengthen your answer, include specific examples and mention hoisting behavior and the temporal dead zone.",
      modelAnswer:
        "var is function-scoped and hoisted (initialized as undefined), let and const are block-scoped with temporal dead zone. const prevents reassignment but allows mutation of objects/arrays. Example: use const for configuration objects, let for loop counters, avoid var due to hoisting issues.",
      suggestions: [
        "Practice explaining hoisting with concrete examples",
        "Study temporal dead zone behavior",
        "Create examples showing block vs function scoping",
      ],
      resources: [
        {
          title: "JavaScript Hoisting Explained",
          url: "https://developer.mozilla.org/en-US/docs/Glossary/Hoisting",
          type: "article",
        },
        {
          title: "Let vs Const vs Var",
          url: "https://www.youtube.com/watch?v=sjyJBL5fkp8",
          type: "video",
        },
      ],
    },
    {
      questionId: "2",
      question:
        "How would you optimize the performance of a React application? Describe specific techniques.",
      userAnswer:
        "I would use React.memo to prevent unnecessary re-renders, implement code splitting with lazy loading, optimize images, use useMemo and useCallback hooks for expensive calculations, and implement virtual scrolling for large lists.",
      scores: {
        technical: 92,
        completeness: 85,
        examples: 85,
        problemSolving: 90,
        communication: 88,
        overall: 88,
      },
      strengths: [
        "Comprehensive coverage of optimization techniques",
        "Mentioned both rendering and loading optimizations",
        "Good understanding of React hooks",
      ],
      weaknesses: [
        "Could mention bundle analysis",
        "Missing server-side optimizations",
        "No mention of profiling tools",
      ],
      feedback:
        "Excellent answer with strong technical depth! You covered the major optimization strategies well. Consider adding bundle analysis, profiling tools, and server-side optimizations to make it even more comprehensive.",
      modelAnswer:
        "Key optimizations: React.memo/PureComponent for re-render prevention, code splitting with React.lazy(), useMemo/useCallback for expensive operations, image optimization, bundle analysis with webpack-bundle-analyzer, React DevTools Profiler for performance monitoring, server-side rendering, and proper key props for lists.",
      suggestions: [
        "Learn to use React DevTools Profiler",
        "Practice bundle analysis techniques",
        "Study server-side rendering benefits",
      ],
      resources: [
        {
          title: "React Performance Optimization",
          url: "https://react.dev/learn/render-and-commit",
          type: "article",
        },
        {
          title: "Advanced React Performance",
          url: "https://kentcdodds.com/blog/optimize-react-re-renders",
          type: "course",
        },
      ],
    },
  ];

  const overallStats = {
    totalQuestions: analysisResults.length,
    averageScore: Math.round(
      analysisResults.reduce((acc, result) => acc + result.scores.overall, 0) /
        analysisResults.length,
    ),
    technicalAverage: Math.round(
      analysisResults.reduce(
        (acc, result) => acc + result.scores.technical,
        0,
      ) / analysisResults.length,
    ),
    communicationAverage: Math.round(
      analysisResults.reduce(
        (acc, result) => acc + result.scores.communication,
        0,
      ) / analysisResults.length,
    ),
    completionRate: 100,
  };

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-chart-2";
    if (score >= 80) return "text-chart-3";
    if (score >= 70) return "text-chart-4";
    return "text-destructive";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-chart-2/20 text-chart-2";
    if (score >= 80) return "bg-chart-3/20 text-chart-3";
    if (score >= 70) return "bg-chart-4/20 text-chart-4";
    return "bg-destructive/20 text-destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                InterviewAI
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/configure">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Interview Analysis Complete</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Detailed feedback and insights from your AI-powered interview
            session
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="border-primary/20 bg-primary/5 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <Target className="h-6 w-6" />
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${getScoreColor(overallStats.averageScore)}`}
                >
                  {overallStats.averageScore}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${getScoreColor(overallStats.technicalAverage)}`}
                >
                  {overallStats.technicalAverage}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Technical Skills
                </p>
              </div>
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${getScoreColor(overallStats.communicationAverage)}`}
                >
                  {overallStats.communicationAverage}%
                </div>
                <p className="text-sm text-muted-foreground">Communication</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {overallStats.completionRate}%
                </div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex gap-4 justify-center">
              <Button variant="outline" className="bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Link href="/configure">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Practice Again
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="detailed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="summary">Summary & Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Action Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="detailed" className="space-y-6">
            {analysisResults.map((result) => (
              <Card key={result.questionId} className="border-border bg-card">
                <Collapsible
                  open={expandedQuestions.has(result.questionId)}
                  onOpenChange={() => toggleQuestion(result.questionId)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Code className="h-5 w-5 text-primary" />
                          <div className="text-left">
                            <CardTitle className="text-lg">
                              Question {result.questionId}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {result.question}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getScoreBadgeColor(
                              result.scores.overall,
                            )}
                          >
                            {result.scores.overall}%
                          </Badge>
                          {expandedQuestions.has(result.questionId) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-6">
                        {/* Score Breakdown */}
                        <div>
                          <h4 className="font-semibold mb-4">
                            Score Breakdown
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {Object.entries(result.scores)
                              .filter(([key]) => key !== "overall")
                              .map(([category, score]) => (
                                <div key={category} className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="capitalize">
                                      {category.replace(/([A-Z])/g, " $1")}
                                    </span>
                                    <span className={getScoreColor(score)}>
                                      {score}%
                                    </span>
                                  </div>
                                  <Progress value={score} className="h-2" />
                                </div>
                              ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Your Answer */}
                        <div>
                          <h4 className="font-semibold mb-2">Your Answer</h4>
                          <div className="p-4 rounded-lg bg-muted/20 border border-border">
                            <p className="text-sm leading-relaxed">
                              {result.userAnswer}
                            </p>
                          </div>
                        </div>

                        {/* Feedback */}
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            AI Feedback
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {result.feedback}
                          </p>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2 text-chart-2">
                              <CheckCircle className="h-4 w-4" />
                              Strengths
                            </h4>
                            <ul className="space-y-2">
                              {result.strengths.map((strength) => (
                                <li
                                  key={strength}
                                  className="text-sm flex items-start gap-2"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-chart-2 mt-2 flex-shrink-0" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2 text-chart-4">
                              <AlertTriangle className="h-4 w-4" />
                              Areas for Improvement
                            </h4>
                            <ul className="space-y-2">
                              {result.weaknesses.map((weakness) => (
                                <li
                                  key={weakness}
                                  className="text-sm flex items-start gap-2"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-chart-4 mt-2 flex-shrink-0" />
                                  {weakness}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Model Answer */}
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            Model Answer
                          </h4>
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-sm leading-relaxed">
                              {result.modelAnswer}
                            </p>
                          </div>
                        </div>

                        {/* Suggestions & Resources */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-primary" />
                              Practice Suggestions
                            </h4>
                            <ul className="space-y-2">
                              {result.suggestions.map((suggestion) => (
                                <li
                                  key={suggestion}
                                  className="text-sm flex items-start gap-2"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-primary" />
                              Recommended Resources
                            </h4>
                            <div className="space-y-2">
                              {result.resources.map((resource) => (
                                <a
                                  key={resource.title}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block p-2 rounded border border-border hover:bg-accent/50 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                      {resource.title}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {resource.type}
                                    </Badge>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-chart-2" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-chart-2 mt-0.5" />
                      <span className="text-sm">
                        Strong technical foundation in JavaScript fundamentals
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-chart-2 mt-0.5" />
                      <span className="text-sm">
                        Excellent communication and explanation skills
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-chart-2 mt-0.5" />
                      <span className="text-sm">
                        Good understanding of React performance optimization
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-chart-4" />
                    Focus Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-chart-4 mt-0.5" />
                      <span className="text-sm">
                        Include more concrete examples in technical explanations
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-chart-4 mt-0.5" />
                      <span className="text-sm">
                        Deepen knowledge of JavaScript hoisting and temporal
                        dead zone
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-chart-4 mt-0.5" />
                      <span className="text-sm">
                        Learn profiling tools and bundle analysis techniques
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Personalized Action Plan
                </CardTitle>
                <CardDescription>
                  Prioritized recommendations based on your performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-chart-4">
                      High Priority (Next 1-2 weeks)
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-chart-4 mt-2" />
                        <span className="text-sm">
                          Practice explaining JavaScript concepts with concrete
                          code examples
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-chart-4 mt-2" />
                        <span className="text-sm">
                          Study hoisting behavior and temporal dead zone in
                          depth
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-chart-3">
                      Medium Priority (Next 2-4 weeks)
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-chart-3 mt-2" />
                        <span className="text-sm">
                          Learn React DevTools Profiler and performance
                          monitoring
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-chart-3 mt-2" />
                        <span className="text-sm">
                          Practice bundle analysis and optimization techniques
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-chart-2">
                      Long Term (Next 1-2 months)
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-chart-2 mt-2" />
                        <span className="text-sm">
                          Explore server-side rendering and advanced React
                          patterns
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-chart-2 mt-2" />
                        <span className="text-sm">
                          Build projects demonstrating performance optimization
                          skills
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
