"use client";

import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Clock,
  Code,
  HelpCircle,
  History,
  Home,
  LogOut,
  Menu,
  Plus,
  Settings,
  Target,
  TrendingUp,
  User,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import LoadingPage from "@/components/atoms/loading-page";
import Logo from "@/components/atoms/logo-grant-guide";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
  const { user, userData, signOut } = useAuth();
  const { loading: authLoading } = useAuthGuard();
  const [timeRange, setTimeRange] = useState("30d");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Import the dashboard data hook
  const dashboardData = useDashboardData();

  // Show loading while checking auth state or loading dashboard data
  if (authLoading || dashboardData.loading) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  // Show error if dashboard data failed to load
  if (dashboardData.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-muted-foreground mb-4">{dashboardData.error}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
  };

  // Use real data from the dashboard hook
  const { recentSessions, stats, skills } = dashboardData;

  // Convert session data for display
  const displaySessions = recentSessions.slice(0, 5).map((session, index) => ({
    id: index + 1,
    position: session.config?.position || "Interview Session",
    score: session.scores?.overall || 0,
    date: session.createdAt
      ? new Date(session.createdAt.toDate()).toLocaleDateString()
      : "Unknown",
    duration: `${session.totalDuration || 0} min`,
    type: session.config?.interviewType || "general",
    improvement: "+0%", // TODO: Calculate improvement from historical data
  }));

  // Performance over time data from real sessions
  const performanceData = recentSessions
    .filter((session) => session.status === "completed" && session.scores)
    .slice(-7) // Last 7 sessions
    .map((session, index) => ({
      date: session.createdAt
        ? new Date(session.createdAt.toDate()).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : `Session ${index + 1}`,
      overall: session.scores?.overall || 0,
      technical: session.scores?.technical || 0,
      communication: session.scores?.communication || 0,
      problemSolving: session.scores?.problemSolving || 0,
    }));

  // Fallback data if no sessions exist yet
  const fallbackPerformanceData = [
    {
      date: "Start Here",
      overall: 50,
      technical: 50,
      communication: 50,
      problemSolving: 50,
    },
  ];

  // Skills breakdown data from real database
  const skillsData = skills.slice(0, 6).map((skill, index) => ({
    skill: skill.name,
    score: skill.currentLevel * 10, // Convert 1-10 scale to percentage
    sessions: skill.practiceCount || 0,
    color: ["#68d391", "#4fd1c7", "#63b3ed", "#f6ad55", "#fc8181", "#d69e2e"][
      index % 6
    ],
  }));

  // Question types distribution
  const questionTypesData = [
    { name: "Technical", value: 45, color: "#68d391" },
    { name: "Bullet", value: 25, color: "#4fd1c7" },
    { name: "Coding", value: 20, color: "#63b3ed" },
    { name: "System Design", value: 10, color: "#f6ad55" },
  ];

  // Weekly activity data
  const weeklyActivityData = [
    { day: "Mon", sessions: 2, avgScore: 82 },
    { day: "Tue", sessions: 1, avgScore: 78 },
    { day: "Wed", sessions: 3, avgScore: 85 },
    { day: "Thu", sessions: 2, avgScore: 80 },
    { day: "Fri", sessions: 1, avgScore: 88 },
    { day: "Sat", sessions: 2, avgScore: 84 },
    { day: "Sun", sessions: 1, avgScore: 79 },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
          <Logo size="md" />

          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            href="/configure"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Interview</span>
          </Link>

          <Link
            href="/history"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <History className="h-5 w-5" />
            <span>Interview History</span>
          </Link>

          <Link
            href="/practice"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <BookOpen className="h-5 w-5" />
            <span>Practice Library</span>
          </Link>

          <div className="pt-4 border-t border-sidebar-border">
            <Link
              href="/profile"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>

            <Link
              href="/support"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Help & Support</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden border-0 p-0 w-full h-full"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSidebarOpen(false);
            }
          }}
          aria-label="Close sidebar"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Navigation */}
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-foreground hover:bg-accent"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-foreground lg:block hidden">
                  Analytics Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-fit bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 3 months</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <ThemeToggle />
                <Link href="/configure">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    New Interview
                    <Plus className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="px-4 py-8">
          {/* Header */}
          <div className="mb-8 lg:hidden">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back,{" "}
              {userData?.displayName || user?.displayName || "User"}!
            </h1>
            <p className="text-xl text-muted-foreground">
              Track your interview preparation progress and insights
            </p>
          </div>
          <div className="mb-8 hidden lg:block">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back,{" "}
              {userData?.displayName || user?.displayName || "User"}!
            </h1>
            <p className="text-xl text-muted-foreground">
              Track your interview preparation progress and insights
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Sessions
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {stats.totalSessions}
                    </p>
                    <p className="text-xs text-chart-2">+3 this week</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Average Score
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {stats.averageScore}%
                    </p>
                    <p className="text-xs text-chart-2">
                      +{stats.improvementRate}% improvement
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Practice Time
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {Math.floor(stats.totalTime / 60)}h
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalTime % 60}m total
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Streak
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {stats.streakDays}
                    </p>
                    <p className="text-xs text-muted-foreground">days</p>
                  </div>
                  <Award className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Performance Trend */}
                <Card className="lg:col-span-2 border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Performance Trend
                    </CardTitle>
                    <CardDescription>
                      Your interview scores over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={
                          performanceData.length > 0
                            ? performanceData
                            : fallbackPerformanceData
                        }
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="overall"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Recent Sessions */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Recent Sessions
                    </CardTitle>
                    <CardDescription>Latest interview practice</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {displaySessions.slice(0, 4).map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                              {session.type === "technical" && (
                                <Code className="h-4 w-4 text-primary" />
                              )}
                              {session.type === "bullet" && (
                                <Target className="h-4 w-4 text-primary" />
                              )}
                              {session.type === "coding" && (
                                <Brain className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {session.position}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {session.date}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="secondary"
                              className={`${
                                session.score >= 90
                                  ? "bg-chart-2/20 text-chart-2"
                                  : session.score >= 80
                                    ? "bg-chart-3/20 text-chart-3"
                                    : "bg-chart-4/20 text-chart-4"
                              }`}
                            >
                              {session.score}%
                            </Badge>
                            <p className="text-xs text-chart-2 mt-1">
                              {session.improvement}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Multi-line Performance Chart */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Performance by Category</CardTitle>
                    <CardDescription>
                      Track improvement across different skill areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={
                          performanceData.length > 0
                            ? performanceData
                            : fallbackPerformanceData
                        }
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="technical"
                          stroke="#68d391"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="communication"
                          stroke="#4fd1c7"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="problemSolving"
                          stroke="#63b3ed"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Question Types Distribution */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Question Types</CardTitle>
                    <CardDescription>
                      Distribution of practice questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={questionTypesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {questionTypesData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {questionTypesData.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <div className="grid gap-6">
                {/* Skills Breakdown */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Skills Performance</CardTitle>
                    <CardDescription>
                      Detailed breakdown of your performance by skill area
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {skillsData.map((skill) => (
                        <div key={skill.skill} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: skill.color }}
                              />
                              <span className="font-medium">{skill.skill}</span>
                              <Badge variant="secondary" className="text-xs">
                                {skill.sessions} sessions
                              </Badge>
                            </div>
                            <span className="text-sm font-medium">
                              {skill.score}%
                            </span>
                          </div>
                          <Progress value={skill.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Radar would go here in a real implementation */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Skill Recommendations</CardTitle>
                    <CardDescription>
                      Areas to focus on for maximum improvement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-chart-4/20 bg-chart-4/5">
                        <h4 className="font-semibold text-chart-4 mb-2">
                          Priority: System Design
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Your lowest scoring area. Focus on scalability
                          patterns and distributed systems concepts.
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border border-chart-3/20 bg-chart-3/5">
                        <h4 className="font-semibold text-chart-3 mb-2">
                          Improve: Algorithms
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Practice more dynamic programming and graph algorithms
                          to boost your coding interview performance.
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border border-chart-2/20 bg-chart-2/5">
                        <h4 className="font-semibold text-chart-2 mb-2">
                          Strength: Communication
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Excellent communication skills! Use this strength to
                          explain technical concepts clearly.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Weekly Activity */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Weekly Activity
                    </CardTitle>
                    <CardDescription>
                      Your practice sessions throughout the week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyActivityData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="day"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="sessions"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Activity Insights */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Activity Insights</CardTitle>
                    <CardDescription>
                      Patterns and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Practice Patterns</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                          <span className="text-sm">Most active day</span>
                          <Badge variant="secondary">Wednesday</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                          <span className="text-sm">Best performance day</span>
                          <Badge variant="secondary">Friday</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                          <span className="text-sm">
                            Average session length
                          </span>
                          <Badge variant="secondary">35 min</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                          <p className="text-sm">
                            <Zap className="h-4 w-4 inline mr-1 text-primary" />
                            Try practicing on Tuesday to maintain consistency
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                          <p className="text-sm">
                            <Target className="h-4 w-4 inline mr-1 text-primary" />
                            Your Friday sessions show best results - consider
                            longer sessions that day
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
