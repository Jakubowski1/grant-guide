"use client";

import {
  ArrowRight,
  Brain,
  Briefcase,
  Building,
  Cloud,
  Code,
  Database,
  MessageSquare,
  PenTool,
  Search,
  Server,
  Smartphone,
  Target,
  Timer,
  Users,
  Zap,
} from "lucide-react";
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
import { FaMicrosoft } from "react-icons/fa";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface InterviewConfig {
  position: string;
  seniority: string;
  companyProfile: string;
  specificCompany: string;
  interviewMode: string;
  interviewType: string;
  duration: string;
}

export default function ConfigurePage() {
  const [config, setConfig] = useState<InterviewConfig>({
    position: "",
    seniority: "",
    companyProfile: "",
    specificCompany: "",
    interviewMode: "",
    interviewType: "",
    duration: "30",
  });

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
      icon: SiGoogle,
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
    {
      value: "tesla",
      label: "Tesla",
      description: "Innovation, problem solving",
      icon: SiTesla,
      color: "text-red-500",
    },
    {
      value: "spotify",
      label: "Spotify",
      description: "Agile, user experience",
      icon: SiSpotify,
      color: "text-green-500",
    },
    {
      value: "uber",
      label: "Uber",
      description: "Scale, real-time systems",
      icon: SiUber,
      color: "text-foreground",
    },
    {
      value: "airbnb",
      label: "Airbnb",
      description: "Belonging, technical excellence",
      icon: SiAirbnb,
      color: "text-pink-500",
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
    {
      value: "behavioral",
      label: "Behavioral Focus",
      description: "Soft skills and experience",
      icon: MessageSquare,
    },
    {
      value: "whiteboard",
      label: "Coding Challenge",
      description: "Live coding problems",
      icon: PenTool,
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
      value: "case-study",
      label: "Case Study",
      description: "Problem-solving approach",
      icon: Search,
    },
    {
      value: "cultural-fit",
      label: "Cultural Fit",
      description: "Values and team dynamics",
      icon: Briefcase,
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
      // Create a clean config object for URL params
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Configure Your Interview</h1>
          <p className="text-xl text-muted-foreground">
            Customize your practice session for the most relevant experience
          </p>
        </div>

        <div className="space-y-8">
          {/* Position Selection */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Target Position
              </CardTitle>
              <CardDescription>
                Select the role you're preparing for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {positions.map((position) => {
                  const Icon = position.icon;
                  return (
                    <Card
                      key={position.value}
                      className={`cursor-pointer transition-all hover:bg-accent/50 ${
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
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className="h-6 w-6 text-primary mt-1" />
                          <div>
                            <h3 className="font-semibold">{position.label}</h3>
                            <p className="text-sm text-muted-foreground">
                              {position.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Seniority Level */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Experience Level
              </CardTitle>
              <CardDescription>
                Choose your current experience level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={config.seniority}
                onValueChange={(value) =>
                  setConfig((prev) => ({ ...prev, seniority: value }))
                }
                className="grid md:grid-cols-3 gap-4"
              >
                {seniorityLevels.map((level) => (
                  <div key={level.value}>
                    <RadioGroupItem
                      value={level.value}
                      id={level.value}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={level.value}
                      className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${
                        config.seniority === level.value
                          ? "ring-2 ring-primary bg-primary/10 border-primary"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-3 h-3 rounded-full ${level.color}`}
                        />
                        <span className="font-semibold">{level.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {level.description}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Company Selection */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Company Target
              </CardTitle>
              <CardDescription>
                Choose a specific company or company type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Profile */}
              <div>
                <h4 className="font-semibold mb-3">Company Type</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {companyProfiles.map((profile) => {
                    const Icon = profile.icon;
                    return (
                      <Card
                        key={profile.value}
                        className={`cursor-pointer transition-all hover:bg-accent/50 ${
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
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Icon className="h-6 w-6 text-primary mt-1" />
                            <div>
                              <h3 className="font-semibold">{profile.label}</h3>
                              <p className="text-sm text-muted-foreground">
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

              {/* Specific Company */}
              <div>
                <h4 className="font-semibold mb-3">
                  Or Choose Specific Company
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {specificCompanies.map((company) => {
                    const CompanyIcon = company.icon;
                    return (
                      <Card
                        key={company.value}
                        className={`cursor-pointer transition-all hover:bg-accent/50 hover:scale-105 ${
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
                        <CardContent className="p-4 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <CompanyIcon
                              className={`h-8 w-8 ${company.color}`}
                            />
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
            </CardContent>
          </Card>

          {/* Interview Type */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Interview Type
              </CardTitle>
              <CardDescription>
                Select the type of interview you want to practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interviewTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-all hover:bg-accent/50 ${
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
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className="h-6 w-6 text-primary mt-1" />
                          <div>
                            <h3 className="font-semibold">{type.label}</h3>
                            <p className="text-sm text-muted-foreground">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Interview Mode */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                Interview Mode
              </CardTitle>
              <CardDescription>Choose how you want to practice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {interviewModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <Card
                      key={mode.value}
                      className={`cursor-pointer transition-all hover:bg-accent/50 ${
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
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className="h-6 w-6 text-primary mt-1" />
                          <div>
                            <h3 className="font-semibold">{mode.label}</h3>
                            <p className="text-sm text-muted-foreground">
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
                <div className="mt-6">
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
            </CardContent>
          </Card>

          {/* Configuration Summary */}
          {isConfigComplete && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary">
                  Configuration Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge
                    variant="secondary"
                    className="bg-primary/20 text-primary"
                  >
                    {positions.find((p) => p.value === config.position)?.label}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-primary/20 text-primary"
                  >
                    {
                      seniorityLevels.find((s) => s.value === config.seniority)
                        ?.label
                    }
                  </Badge>
                  {config.specificCompany ? (
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary"
                    >
                      {
                        specificCompanies.find(
                          (c) => c.value === config.specificCompany,
                        )?.label
                      }
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary"
                    >
                      {
                        companyProfiles.find(
                          (c) => c.value === config.companyProfile,
                        )?.label
                      }
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className="bg-primary/20 text-primary"
                  >
                    {
                      interviewTypes.find(
                        (t) => t.value === config.interviewType,
                      )?.label
                    }
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-primary/20 text-primary"
                  >
                    {
                      interviewModes.find(
                        (m) => m.value === config.interviewMode,
                      )?.label
                    }
                  </Badge>
                  {config.interviewMode === "timed" && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary"
                    >
                      {config.duration} minutes
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleStartInterview}
                    size="lg"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Start Interview Session
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <Button
                    onClick={() => {
                      window.location.href = "/interview?demo=true";
                    }}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Try Demo First
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
