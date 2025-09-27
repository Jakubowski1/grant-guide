"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Briefcase,
  Building,
  ChevronRight,
  Cloud,
  Code,
  Database,
  HelpCircle,
  History,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  PenTool,
  Plus,
  Search,
  Server,
  Settings,
  Smartphone,
  Target,
  Timer,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  SiAirbnb,
  SiAmazon,
  SiApple,
  SiGoogle,
  SiMeta,
  SiNetflix,
  SiSpotify,
  SiTesla,
  SiUber,
} from "react-icons/si";
import { FaApple, FaGoogle, FaMicrosoft, FaUber } from "react-icons/fa";
import LoadingPage from "@/components/atoms/loading-page";
import Logo from "@/components/atoms/logo-grant-guide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuth } from "@/providers/auth-provider";

interface InterviewConfig {
  position: string;
  seniority: string;
  companyProfile: string;
  specificCompany: string;
  interviewMode: string;
  interviewType: string;
  duration: string;
}

interface ConfigStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: ConfigStep[] = [
  {
    id: "position",
    title: "Position",
    description: "Select your target role",
    icon: Code,
  },
  {
    id: "experience",
    title: "Experience",
    description: "Choose your level",
    icon: Target,
  },
  {
    id: "company",
    title: "Company",
    description: "Pick your target",
    icon: Building,
  },
  {
    id: "type",
    title: "Interview Type",
    description: "Select interview focus",
    icon: Briefcase,
  },
  {
    id: "mode",
    title: "Mode & Settings",
    description: "Configure preferences",
    icon: Timer,
  },
];

export default function ConfigurePage() {
  const { user, signOut } = useAuth();
  const { loading: authLoading } = useAuthGuard();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [config, setConfig] = useState<InterviewConfig>({
    position: "",
    seniority: "",
    companyProfile: "",
    specificCompany: "",
    interviewMode: "",
    interviewType: "",
    duration: "30",
  });

  // Show loading while checking auth state
  if (authLoading) {
    return <LoadingPage message="Setting up your interview configuration..." />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const positions = [
    {
      value: "frontend",
      label: "Frontend Engineer",
      icon: Code,
      description: "React, Vue, Angular, JavaScript",
    },
    {
      value: "backend",
      label: "Backend Engineer",
      icon: Server,
      description: "APIs, Databases, System Design",
    },
    {
      value: "fullstack",
      label: "Full Stack Engineer",
      icon: Brain,
      description: "Frontend + Backend Development",
    },
    {
      value: "devops",
      label: "DevOps Engineer",
      icon: Cloud,
      description: "CI/CD, Infrastructure, Monitoring",
    },
    {
      value: "mobile",
      label: "Mobile Developer",
      icon: Smartphone,
      description: "iOS, Android, React Native",
    },
    {
      value: "data",
      label: "Data Engineer",
      icon: Database,
      description: "ETL, Analytics, Big Data",
    },
  ];

  const seniorityLevels = [
    {
      value: "junior",
      label: "Junior",
      description: "0-2 years experience",
      color: "bg-chart-2",
    },
    {
      value: "mid",
      label: "Mid-level",
      description: "2-5 years experience",
      color: "bg-chart-3",
    },
    {
      value: "senior",
      label: "Senior",
      description: "5+ years experience",
      color: "bg-chart-4",
    },
  ];

  const companyProfiles = [
    {
      value: "generic",
      label: "Generic Tech Company",
      description: "Standard technical questions",
      icon: Building,
    },
    {
      value: "faang",
      label: "FAANG-style",
      description: "Algorithm-heavy, system design focus",
      icon: Target,
    },
    {
      value: "startup",
      label: "Startup Environment",
      description: "Practical, fast-paced questions",
      icon: Zap,
    },
  ];

  const specificCompanies = [
    {
      value: "google",
      label: "Google",
      description: "Algorithm focus, system design",
      icon: FaGoogle,
      color: "text-blue-500",
    },
    {
      value: "meta",
      label: "Meta",
      description: "Product thinking, scalability",
      icon: SiMeta,
      color: "text-blue-600",
    },
    {
      value: "apple",
      label: "Apple",
      description: "Design patterns, performance",
      icon: SiApple,
      color: "text-muted-foreground",
    },
    {
      value: "amazon",
      label: "Amazon",
      description: "Leadership principles, scale",
      icon: SiAmazon,
      color: "text-orange-500",
    },
    {
      value: "netflix",
      label: "Netflix",
      description: "High performance, culture fit",
      icon: SiNetflix,
      color: "text-red-600",
    },
    {
      value: "microsoft",
      label: "Microsoft",
      description: "Collaboration, technical depth",
      icon: FaMicrosoft,
      color: "text-blue-500",
    },
  ];

  const interviewModes = [
    {
      value: "timed",
      label: "Timed Interview",
      description: "Realistic time pressure",
      icon: Timer,
    },
    {
      value: "untimed",
      label: "Practice Mode",
      description: "Take your time to think",
      icon: Brain,
    },
  ];

  const interviewTypes = [
    {
      value: "technical",
      label: "Technical Interview",
      description: "Coding and system design",
      icon: Code,
    },
    {
      value: "behavioral",
      label: "Behavioral Interview",
      description: "Experience and soft skills",
      icon: Users,
    },
    {
      value: "system-design",
      label: "System Design",
      description: "Architecture and scalability",
      icon: Building,
    },
    {
      value: "mixed",
      label: "Mixed Interview",
      description: "Combination of all types",
      icon: Target,
    },
  ];

  const handleStartInterview = () => {
    if (
      config.position &&
      config.seniority &&
      (config.companyProfile || config.specificCompany) &&
      config.interviewMode &&
      config.interviewType
    ) {
      const urlParams = new URLSearchParams();
      Object.entries(config).forEach(([key, value]) => {
        if (value) {
          urlParams.append(key, value);
        }
      });
      window.location.href = `/interview?${urlParams.toString()}`;
    }
  };

  const isConfigComplete =
    config.position &&
    config.seniority &&
    (config.companyProfile || config.specificCompany) &&
    config.interviewMode &&
    config.interviewType;

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return config.position !== "";
      case 1:
        return config.seniority !== "";
      case 2:
        return config.companyProfile !== "" || config.specificCompany !== "";
      case 3:
        return config.interviewType !== "";
      case 4:
        return config.interviewMode !== "";
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepProgress = () => {
    return ((currentStep + 1) / STEPS.length) * 100;
  };

  function renderPositionStep() {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {positions.map((position) => {
          const Icon = position.icon;
          return (
            <Card
              key={position.value}
              className={`cursor-pointer transition-all hover:bg-accent/50 h-full ${
                config.position === position.value
                  ? "ring-2 ring-primary bg-primary/10"
                  : "border-border"
              }`}
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  position: position.value,
                }))
              }
            >
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{position.label}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {position.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  function renderExperienceStep() {
    return (
      <RadioGroup
        value={config.seniority}
        onValueChange={(value) =>
          setConfig((prev) => ({ ...prev, seniority: value }))
        }
        className="grid md:grid-cols-3 gap-4"
      >
        {seniorityLevels.map((level) => (
          <div key={level.value} className="h-full">
            <RadioGroupItem
              value={level.value}
              id={level.value}
              className="sr-only"
            />
            <Label
              htmlFor={level.value}
              className={`flex flex-col p-6 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 h-full min-h-[120px] ${
                config.seniority === level.value
                  ? "ring-2 ring-primary bg-primary/10 border-primary"
                  : "border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${level.color}`} />
                <span className="font-semibold">{level.label}</span>
              </div>
              <span className="text-sm text-muted-foreground flex-1">
                {level.description}
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  }

  function renderCompanyStep() {
    return (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3">Company Type</h4>
          <div className="grid md:grid-cols-3 gap-4">
            {companyProfiles.map((profile) => {
              const Icon = profile.icon;
              return (
                <Card
                  key={profile.value}
                  className={`cursor-pointer transition-all hover:bg-accent/50 h-full ${
                    config.companyProfile === profile.value
                      ? "ring-2 ring-primary bg-primary/10"
                      : "border-border"
                  }`}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      companyProfile: profile.value,
                      specificCompany: "",
                    }))
                  }
                >
                  <CardContent className="p-4 h-full flex flex-col min-h-[100px]">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{profile.label}</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          {profile.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-3">Or Choose Specific Company</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
            {specificCompanies.map((company) => {
              const CompanyIcon = company.icon;
              return (
                <Card
                  key={company.value}
                  className={`cursor-pointer transition-all hover:bg-accent/50 hover:scale-105 h-full ${
                    config.specificCompany === company.value
                      ? "ring-2 ring-primary bg-primary/10"
                      : "border-border"
                  }`}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      specificCompany: company.value,
                      companyProfile: "",
                    }))
                  }
                >
                  <CardContent className="p-4 text-center h-full flex flex-col justify-center min-h-[120px]">
                    <div className="flex flex-col items-center gap-3 flex-1 justify-center">
                      <CompanyIcon className={`h-8 w-8 ${company.color}`} />
                      <div>
                        <h3 className="font-semibold text-sm">
                          {company.label}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {company.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderInterviewTypeStep() {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {interviewTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card
              key={type.value}
              className={`cursor-pointer transition-all hover:bg-accent/50 h-full ${
                config.interviewType === type.value
                  ? "ring-2 ring-primary bg-primary/10"
                  : "border-border"
              }`}
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  interviewType: type.value,
                }))
              }
            >
              <CardContent className="p-4 h-full flex flex-col min-h-[100px]">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{type.label}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {type.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  function renderModeStep() {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {interviewModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card
                key={mode.value}
                className={`cursor-pointer transition-all hover:bg-accent/50 h-full ${
                  config.interviewMode === mode.value
                    ? "ring-2 ring-primary bg-primary/10"
                    : "border-border"
                }`}
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    interviewMode: mode.value,
                  }))
                }
              >
                <CardContent className="p-4 h-full flex flex-col min-h-[100px]">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{mode.label}</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {mode.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {config.interviewMode === "timed" && (
          <div className="animate-in slide-in-from-top-4 fade-in duration-300">
            <Separator className="mb-4" />
            <div className="space-y-2">
              <Label htmlFor="duration">Interview Duration</Label>
              <Select
                value={config.duration}
                onValueChange={(value) =>
                  setConfig((prev) => ({ ...prev, duration: value }))
                }
              >
                <SelectTrigger className="w-full bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderStepContent() {
    switch (currentStep) {
      case 0:
        return renderPositionStep();
      case 1:
        return renderExperienceStep();
      case 2:
        return renderCompanyStep();
      case 3:
        return renderInterviewTypeStep();
      case 4:
        return renderModeStep();
      default:
        return null;
    }
  }

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
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            href="/configure"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
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
              href="/help"
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
                  Configure Interview
                </h1>
              </div>
            </div>
          </div>
        </nav>

        {/* Configuration Content */}
        <div className="p-6 max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Step {currentStep + 1} of {STEPS.length}</h2>
              <span className="text-sm text-muted-foreground">{Math.round(getStepProgress())}% complete</span>
            </div>
            <Progress value={getStepProgress()} className="w-full" />
            
            {/* Step Navigation Breadcrumb */}
            <div className="flex items-center mt-4 space-x-2 overflow-x-auto pb-2">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <StepIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Configuration Card */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const StepIcon = STEPS[currentStep].icon;
                  return <StepIcon className="h-5 w-5 text-primary" />;
                })()}
                {STEPS[currentStep].title}
              </CardTitle>
              <CardDescription>
                {STEPS[currentStep].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px] relative overflow-hidden">
              <div 
                key={currentStep}
                className="animate-in slide-in-from-right-4 fade-in duration-300"
              >
                {renderStepContent()}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              {currentStep === STEPS.length - 1 ? (
                <Button
                  onClick={handleStartInterview}
                  disabled={!isConfigComplete}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                >
                  Start Interview
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Configuration Summary */}
          {isConfigComplete && (
            <Card className="border-primary/20 bg-primary/5 mt-6">
              <CardHeader>
                <CardTitle className="text-primary">Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {positions.find((p) => p.value === config.position)?.label}
                  </Badge>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {seniorityLevels.find((s) => s.value === config.seniority)?.label}
                  </Badge>
                  {config.specificCompany ? (
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {specificCompanies.find((c) => c.value === config.specificCompany)?.label}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {companyProfiles.find((c) => c.value === config.companyProfile)?.label}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {interviewTypes.find((t) => t.value === config.interviewType)?.label}
                  </Badge>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {interviewModes.find((m) => m.value === config.interviewMode)?.label}
                  </Badge>
                  {config.interviewMode === "timed" && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {config.duration} minutes
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}