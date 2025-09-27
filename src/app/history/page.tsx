"use client";

import {
  BookOpen,
  Calendar,
  Clock,
  Code,
  Eye,
  Filter,
  HelpCircle,
  History,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Target,
  Trophy,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Logo from "@/components/atoms/logo-grant-guide";
import { ThemeToggle } from "@/components/atoms/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatabaseService } from "@/lib/database";
import { useAuth } from "@/providers/auth-provider";
import type { InterviewSession } from "@/types/firestore";

export default function InterviewHistoryPage() {
  const { user, signOut } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<InterviewSession[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  const loadSessions = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const userSessions = await DatabaseService.getUserSessions(user.uid, 50);
      setSessions(userSessions);
      setFilteredSessions(userSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load interview sessions
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Filter and sort sessions
  useEffect(() => {
    let filtered = sessions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (session) =>
          session.config.position
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          session.config.interviewType
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          session.config.specificCompany
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(
        (session) => session.config.interviewType === filterType,
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.createdAt.toDate()).getTime() -
            new Date(a.createdAt.toDate()).getTime()
          );
        case "score":
          return (b.scores?.overall || 0) - (a.scores?.overall || 0);
        case "duration":
          return b.totalDuration - a.totalDuration;
        default:
          return 0;
      }
    });

    setFilteredSessions(filtered);
  }, [sessions, searchTerm, filterType, sortBy]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100 dark:bg-green-900/20";
    if (score >= 80) return "text-green-500 bg-green-50 dark:bg-green-900/10";
    if (score >= 70)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
    if (score >= 60)
      return "text-orange-500 bg-orange-50 dark:bg-orange-900/10";
    return "text-red-500 bg-red-50 dark:bg-red-900/10";
  };

  const getInterviewIcon = (type: string) => {
    switch (type) {
      case "technical":
        return <Code className="h-4 w-4" />;
      case "bullet":
        return <Target className="h-4 w-4" />;
      case "system-design":
        return <Target className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const formatDate = (timestamp: { toDate: () => Date }) => {
    return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateStats = () => {
    if (sessions.length === 0)
      return { avgScore: 0, totalSessions: 0, totalTime: 0 };

    const avgScore =
      sessions.reduce(
        (sum, session) => sum + (session.scores?.overall || 0),
        0,
      ) / sessions.length;
    const totalSessions = sessions.length;
    const totalTime = sessions.reduce(
      (sum, session) => sum + session.totalDuration,
      0,
    );

    return { avgScore: Math.round(avgScore), totalSessions, totalTime };
  };

  const stats = calculateStats();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading interview history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSidebarOpen(false);
          }}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <Logo />
              <span className="font-bold text-lg">Grant Guide</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/configure"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Configure Interview</span>
            </Link>
            <Link
              href="/interview"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Start Interview</span>
            </Link>
            <Link
              href="/history"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <History className="h-4 w-4" />
              <span>Interview History</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <Link
              href="/docs"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Documentation</span>
            </Link>
            <Link
              href="/help"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help & Support</span>
            </Link>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.displayName || user?.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top navbar */}
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Link href="/dashboard" className="hover:text-foreground">
                  Dashboard
                </Link>
                <span>/</span>
                <span className="text-foreground">Interview History</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Interview History
              </h1>
              <p className="text-muted-foreground">
                Track your progress and review past interviews
              </p>
            </div>

            {/* Stats Overview */}
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgScore}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalSessions}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(stats.totalTime / 60)}h
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by position, company, or interview type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Interview Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="bullet">Bullet</SelectItem>
                      <SelectItem value="system-design">
                        System Design
                      </SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="score">Score</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Sessions List */}
            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No interviews found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {sessions.length === 0
                        ? "Start your first interview to see your history here."
                        : "Try adjusting your search or filter criteria."}
                    </p>
                    <Link href="/configure">
                      <Button>Start First Interview</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                filteredSessions.map((session) => (
                  <Card
                    key={session.sessionId}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            {getInterviewIcon(session.config.interviewType)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {session.config.position} Interview
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(session.createdAt)}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {session.totalDuration} min
                              </span>
                              {session.config.specificCompany && (
                                <Badge variant="secondary">
                                  {session.config.specificCompany}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div
                              className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(session.scores?.overall || 0)}`}
                            >
                              {session.scores?.overall || 0}%
                            </div>
                            <div className="text-xs text-gray-500 mt-1 capitalize">
                              {session.config.interviewType}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Difficulty:</span>
                            <span className="ml-2 font-medium capitalize">
                              {session.config.seniority}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <Badge
                              variant={
                                session.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                              className="ml-2"
                            >
                              {session.status}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-500">Questions:</span>
                            <span className="ml-2 font-medium">
                              {session.questions?.length || 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Mode:</span>
                            <span className="ml-2 font-medium capitalize">
                              {session.config.interviewMode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
