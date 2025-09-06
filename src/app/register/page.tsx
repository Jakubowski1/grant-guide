"use client";

import { Eye, EyeOff, Github } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/atoms/loading-page";
import Logo from "@/components/atoms/logo-with-text";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useGuestGuard } from "@/hooks/useAuthGuard";
import { registerWithEmailAndPassword, signInWithGitHub } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { loading: authLoading } = useGuestGuard();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    experience: "",
    howDidYouHear: "",
  });

  const totalSteps = 5;
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show loading while checking auth state
  if (authLoading) {
    return <LoadingPage />;
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Basic validation
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.experience ||
        !formData.role ||
        !formData.howDidYouHear
      ) {
        throw new Error("Please fill in all fields");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Register user with Firebase
      const { user, error } = await registerWithEmailAndPassword(
        formData.email,
        formData.password,
        formData.name,
        {
          role: formData.role,
          experience: formData.experience,
          howDidYouHear: formData.howDidYouHear,
        },
      );

      if (error) {
        setError(error);
        return;
      }

      if (user) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { user, error } = await signInWithGitHub();

      if (error) {
        setError(error);
        return;
      }

      if (user) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("GitHub login failed:", error);
      setError("GitHub login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.email;
      case 2:
        return (
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword
        );
      case 3:
        return formData.role;
      case 4:
        return formData.experience;
      case 5:
        return formData.howDidYouHear;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Let's start with basics";
      case 2:
        return "Secure your account";
      case 3:
        return "What's your target role?";
      case 4:
        return "Your experience level";
      case 5:
        return "How did you find us?";
      default:
        return "Create Account";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Tell us your name and email to get started";
      case 2:
        return "Create a strong password for your account";
      case 3:
        return "Select the role you're preparing for";
      case 4:
        return "Help us personalize your experience";
      case 5:
        return "We'd love to know how you discovered us";
      default:
        return "Start your AI-powered interview preparation journey";
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="bg-input border-border"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="bg-input border-border"
                disabled={isLoading}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min. 6 characters)"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                  minLength={6}
                  className="bg-input border-border pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  required
                  className="bg-input border-border pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {formData.password &&
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              {isMobile ? (
                <Select
                  onValueChange={(value) => handleInputChange("role", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select your target role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend Engineer</SelectItem>
                    <SelectItem value="backend">Backend Engineer</SelectItem>
                    <SelectItem value="fullstack">
                      Full Stack Engineer
                    </SelectItem>
                    <SelectItem value="devops">DevOps Engineer</SelectItem>
                    <SelectItem value="mobile">Mobile Developer</SelectItem>
                    <SelectItem value="data">Data Engineer</SelectItem>
                    <SelectItem value="product">Product Manager</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "frontend", label: "Frontend Engineer" },
                    { value: "backend", label: "Backend Engineer" },
                    { value: "fullstack", label: "Full Stack Engineer" },
                    { value: "devops", label: "DevOps Engineer" },
                    { value: "mobile", label: "Mobile Developer" },
                    { value: "data", label: "Data Engineer" },
                    { value: "product", label: "Product Manager" },
                    { value: "design", label: "UI/UX Designer" },
                  ].map((role) => (
                    <Card
                      key={role.value}
                      className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-md ${
                        formData.role === role.value
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleInputChange("role", role.value)}
                    >
                      <CardContent className="text-center">
                        <p
                          className={`text-sm font-medium ${
                            formData.role === role.value
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {role.label}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              {isMobile ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("experience", value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">
                          Entry Level (0-1 years)
                        </SelectItem>
                        <SelectItem value="junior">
                          Junior (1-3 years)
                        </SelectItem>
                        <SelectItem value="mid">
                          Mid-level (3-5 years)
                        </SelectItem>
                        <SelectItem value="senior">
                          Senior (5+ years)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "entry", label: "Entry Level (0-1 years)" },
                    { value: "junior", label: "Junior (1-3 years)" },
                    { value: "mid", label: "Mid-level (3-5 years)" },
                    { value: "senior", label: "Senior (5+ years)" },
                  ].map((experience) => (
                    <Card
                      key={experience.value}
                      className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-md ${
                        formData.experience === experience.value
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() =>
                        handleInputChange("experience", experience.value)
                      }
                    >
                      <CardContent className="text-center">
                        <p
                          className={`text-sm font-medium ${
                            formData.experience === experience.value
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {experience.label}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              {isMobile ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="howDidYouHear">
                      How did you hear about us?
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("howDidYouHear", value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select how you found us" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google Search</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="friend">Friend/Colleague</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="blog">Blog/Article</SelectItem>
                        <SelectItem value="podcast">Podcast</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "google", label: "Google Search" },
                    { value: "social", label: "Social Media" },
                    { value: "friend", label: "Friend/Colleague" },
                    { value: "linkedin", label: "LinkedIn" },
                    { value: "github", label: "GitHub" },
                    { value: "blog", label: "Blog/Article" },
                    { value: "podcast", label: "Podcast" },
                    { value: "other", label: "Other" },
                  ].map((howDidYouHear) => (
                    <Card
                      key={howDidYouHear.value}
                      className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-md ${
                        formData.howDidYouHear === howDidYouHear.value
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() =>
                        handleInputChange("howDidYouHear", howDidYouHear.value)
                      }
                    >
                      <CardContent className="text-center">
                        <p
                          className={`text-sm font-medium ${
                            formData.howDidYouHear === howDidYouHear.value
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {howDidYouHear.label}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
        {/* Registration Form - First Half */}
        <div className="w-full">
          <Card className="border-border bg-card w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex space-x-2">
                  {[...Array(totalSteps)].map((_, index) => (
                    <div
                      key={`step-${index + 1}`}
                      className={`h-2 w-8 rounded-full transition-colors ${
                        index + 1 <= currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
              <CardDescription>{getStepDescription()}</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${(currentStep - 1) * 100}%)`,
                  }}
                >
                  {[...Array(totalSteps)].map((_, index) => (
                    <div
                      key={`content-${index + 1}`}
                      className="w-full flex-shrink-0 px-1"
                    >
                      {currentStep === index + 1 && renderStepContent()}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isLoading}
                  className="bg-transparent border-border hover:bg-accent"
                >
                  Previous
                </Button>

                {currentStep === totalSteps ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceedToNextStep() || isLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceedToNextStep() || isLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Next
                  </Button>
                )}
              </div>

              {currentStep === 1 && (
                <>
                  <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or sign up with
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent border-border hover:bg-accent"
                      disabled={isLoading}
                    >
                      <svg
                        className="h-4 w-4 mr-2"
                        viewBox="0 0 24 24"
                        role="img"
                        aria-label="Google Logo"
                      >
                        <title>Google Logo</title>
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign up with Google
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent border-border hover:bg-accent"
                      onClick={handleGithubLogin}
                      disabled={isLoading}
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Sign up with GitHub
                    </Button>
                  </div>
                </>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline ">
                    Log In
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logo and Welcome Section - Second Half */}
        <div className="flex flex-col items-center justify-center space-y-8">
          <Logo size="md" />
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Welcome to Grant Guide</h1>
            <p className="text-lg text-muted-foreground">
              Your AI-powered interview preparation platform
            </p>
          </div>
        </div>
      </div>

      {/* Back to Home Button - Bottom Center */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
