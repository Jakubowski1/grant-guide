"use client";

import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  FilterX,
  HelpCircle,
  History,
  Home,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Tag,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import practiceData, {
  type Category,
  type Company,
  type DocumentationLink,
  type Language,
  type Question,
} from "@/data/practice-data";
import { useAuth } from "@/providers/auth-provider";

interface ExtendedQuestion extends Question {
  categoryName: string;
  categoryId: string;
}

export default function PracticePage() {
  const { user, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Get all unique tags for the tag filter
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    practiceData.categories.forEach((category: Category) => {
      category.questions.forEach((question: Question) => {
        question.tags.forEach((tag: string) => {
          tagSet.add(tag);
        });
      });
    });
    return Array.from(tagSet).sort();
  }, []);

  // Filter questions based on search and filters - moved before conditional returns
  const filteredQuestions = useMemo(() => {
    const allQuestions: ExtendedQuestion[] = [];

    // Flatten all questions from all categories
    practiceData.categories.forEach((category: Category) => {
      category.questions.forEach((question: Question) => {
        allQuestions.push({
          ...question,
          categoryName: category.name,
          categoryId: category.id,
        });
      });
    });

    // Apply filters
    return allQuestions.filter((question: ExtendedQuestion) => {
      const matchesSearch =
        searchQuery === "" ||
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.tags.some((tag: string) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(question.categoryId);
      const matchesDifficulty =
        selectedDifficulties.length === 0 ||
        selectedDifficulties.includes(question.difficulty);
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag: string) => question.tags.includes(tag));
      const matchesCompany =
        selectedCompanies.length === 0 ||
        (question.company && selectedCompanies.includes(question.company));
      const matchesLanguage =
        selectedLanguages.length === 0 ||
        (question.language && selectedLanguages.includes(question.language));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDifficulty &&
        matchesTags &&
        matchesCompany &&
        matchesLanguage
      );
    });
  }, [
    searchQuery,
    selectedCategories,
    selectedDifficulties,
    selectedTags,
    selectedCompanies,
    selectedLanguages,
  ]);
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "expert":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Helper functions for multi-select filters
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty],
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleCompany = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company],
    );
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language],
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedDifficulties([]);
    setSelectedTags([]);
    setSelectedCompanies([]);
    setSelectedLanguages([]);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedDifficulties.length > 0 ||
    selectedTags.length > 0 ||
    selectedCompanies.length > 0 ||
    selectedLanguages.length > 0 ||
    searchQuery !== "";

  // Get company info helper
  const getCompanyInfo = (companyId: string): Company | undefined => {
    return practiceData.companies.find((c: Company) => c.id === companyId);
  };

  // Get language info helper
  const getLanguageInfo = (languageId: string): Language | undefined => {
    return practiceData.languages.find((l: Language) => l.id === languageId);
  };

  // Conditional returns after all hooks
  if (loading) {
    return <LoadingPage />;
  }

  // Redirect to auth if not authenticated
  if (!user) {
    window.location.href = "/auth";
    return <LoadingPage />;
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
            className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
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
                  Practice Library
                </h1>
              </div>
              <div className="flex items-center space-x-4">
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

        {/* Content */}
        <div className="p-6">
          {/* Header and Statistics */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Questions
                      </p>
                      <p className="text-2xl font-bold">
                        {practiceData.metadata.totalQuestions}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Categories
                      </p>
                      <p className="text-2xl font-bold">
                        {practiceData.metadata.totalCategories}
                      </p>
                    </div>
                    <Tag className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Filtered Results
                      </p>
                      <p className="text-2xl font-bold">
                        {filteredQuestions.length}
                      </p>
                    </div>
                    <Filter className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="text-sm font-medium">
                        {practiceData.metadata.lastUpdated}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search questions, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Start Filters */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  Quick Start
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Popular filter combinations to get you started
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDifficulties(["beginner"]);
                      setSelectedCategories([]);
                      setSelectedTags([]);
                      setSelectedLanguages([]);
                      setSelectedCompanies([]);
                    }}
                    className="h-12 flex flex-col items-center gap-1 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950 transition-colors bg-transparent"
                  >
                    <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-medium text-center leading-tight">
                      Beginner Friendly
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategories(["technical"]);
                      setSelectedDifficulties([]);
                      setSelectedTags([]);
                      setSelectedLanguages([]);
                      setSelectedCompanies([]);
                    }}
                    className="h-12 flex flex-col items-center gap-1 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950 transition-colors bg-transparent"
                  >
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-medium text-center leading-tight">
                      Coding Challenges
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategories(["system-design"]);
                      setSelectedDifficulties([]);
                      setSelectedTags([]);
                      setSelectedLanguages([]);
                      setSelectedCompanies([]);
                    }}
                    className="h-12 flex flex-col items-center gap-1 hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-950 transition-colors bg-transparent"
                  >
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                    <span className="text-xs font-medium text-center leading-tight">
                      System Design
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCompanies([
                        "google",
                        "meta",
                        "amazon",
                        "apple",
                        "microsoft",
                      ]);
                      setSelectedCategories([]);
                      setSelectedDifficulties([]);
                      setSelectedTags([]);
                      setSelectedLanguages([]);
                    }}
                    className="h-12 flex flex-col items-center gap-1 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950 transition-colors bg-transparent"
                  >
                    <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                    <span className="text-xs font-medium text-center leading-tight">
                      FAANG Companies
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <Card className="shadow-sm border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        Active Filters (
                        {selectedCategories.length +
                          selectedDifficulties.length +
                          selectedTags.length +
                          selectedCompanies.length +
                          selectedLanguages.length}
                        )
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-blue-100 dark:hover:bg-blue-900"
                    >
                      <FilterX className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((categoryId) => {
                      const category = practiceData.categories.find(
                        (c: Category) => c.id === categoryId,
                      );
                      return (
                        <Badge
                          key={categoryId}
                          variant="secondary"
                          className="bg-white border-blue-200 text-blue-800 dark:bg-slate-800 dark:border-blue-600 dark:text-blue-200"
                        >
                          {category?.name}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => toggleCategory(categoryId)}
                          />
                        </Badge>
                      );
                    })}
                    {selectedDifficulties.map((difficulty) => (
                      <Badge
                        key={difficulty}
                        variant="secondary"
                        className="bg-white border-blue-200 text-blue-800 dark:bg-slate-800 dark:border-blue-600 dark:text-blue-200 capitalize"
                      >
                        {difficulty}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => toggleDifficulty(difficulty)}
                        />
                      </Badge>
                    ))}
                    {selectedLanguages.map((languageId) => {
                      const language = getLanguageInfo(languageId);
                      return (
                        <Badge
                          key={languageId}
                          variant="secondary"
                          className="bg-white border-blue-200 text-blue-800 dark:bg-slate-800 dark:border-blue-600 dark:text-blue-200 flex items-center"
                        >
                          <div
                            className="h-2 w-2 mr-1 rounded-full"
                            style={{
                              backgroundColor: language?.color || "#6b7280",
                            }}
                          />
                          {language?.name || languageId}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => toggleLanguage(languageId)}
                          />
                        </Badge>
                      );
                    })}
                    {selectedCompanies.map((companyId) => {
                      const company = getCompanyInfo(companyId);
                      return (
                        <Badge
                          key={companyId}
                          variant="secondary"
                          className="bg-white border-blue-200 text-blue-800 dark:bg-slate-800 dark:border-blue-600 dark:text-blue-200 flex items-center"
                        >
                          {company && (
                            <Image
                              src={company.logo}
                              alt={company.name}
                              width={12}
                              height={12}
                              className="h-3 w-3 mr-1 rounded"
                            />
                          )}
                          {company?.name || companyId}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => toggleCompany(companyId)}
                          />
                        </Badge>
                      );
                    })}
                    {selectedTags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-white border-blue-200 text-blue-800 dark:bg-slate-800 dark:border-blue-600 dark:text-blue-200"
                      >
                        {tag.replace(/-/g, " ")}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        />
                      </Badge>
                    ))}
                    {selectedTags.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="bg-white border-blue-200 text-blue-800 dark:bg-slate-800 dark:border-blue-600 dark:text-blue-200"
                      >
                        +{selectedTags.length - 3} more tags
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Advanced Filters */}
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Card className="shadow-sm cursor-pointer hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            Advanced Filters
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Customize your search criteria
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700">
                            {selectedCategories.length +
                              selectedDifficulties.length +
                              selectedTags.length +
                              selectedCompanies.length +
                              selectedLanguages.length}{" "}
                            active
                          </Badge>
                        )}
                        {filtersOpen ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Categories Card */}
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                        Categories
                        {selectedCategories.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {selectedCategories.length}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {practiceData.categories.map((category: Category) => (
                        <Button
                          key={category.id}
                          variant={
                            selectedCategories.includes(category.id)
                              ? "default"
                              : "ghost"
                          }
                          size="sm"
                          onClick={() => toggleCategory(category.id)}
                          className={`w-full justify-start h-10 transition-all duration-200 ${
                            selectedCategories.includes(category.id)
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm hover:from-blue-600 hover:to-cyan-600"
                              : "hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-700 dark:hover:text-blue-300"
                          }`}
                        >
                          <span className="truncate">{category.name}</span>
                          {selectedCategories.includes(category.id) && (
                            <X className="h-3 w-3 ml-auto flex-shrink-0" />
                          )}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Difficulty Card */}
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
                        Difficulty Level
                        {selectedDifficulties.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                          >
                            {selectedDifficulties.length}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {[
                        {
                          id: "beginner",
                          color: "from-emerald-500 to-green-500",
                          label: "Beginner",
                        },
                        {
                          id: "intermediate",
                          color: "from-amber-500 to-yellow-500",
                          label: "Intermediate",
                        },
                        {
                          id: "advanced",
                          color: "from-orange-500 to-red-500",
                          label: "Advanced",
                        },
                        {
                          id: "expert",
                          color: "from-red-500 to-pink-500",
                          label: "Expert",
                        },
                      ].map((difficulty) => (
                        <Button
                          key={difficulty.id}
                          variant={
                            selectedDifficulties.includes(difficulty.id)
                              ? "default"
                              : "ghost"
                          }
                          size="sm"
                          onClick={() => toggleDifficulty(difficulty.id)}
                          className={`w-full justify-start h-10 transition-all duration-200 ${
                            selectedDifficulties.includes(difficulty.id)
                              ? `bg-gradient-to-r ${difficulty.color} text-white shadow-sm`
                              : "hover:bg-slate-50 dark:hover:bg-slate-900"
                          }`}
                        >
                          <div
                            className={`h-3 w-3 rounded-full mr-2 bg-gradient-to-r ${difficulty.color}`}
                          ></div>
                          <span className="truncate">{difficulty.label}</span>
                          {selectedDifficulties.includes(difficulty.id) && (
                            <X className="h-3 w-3 ml-auto flex-shrink-0" />
                          )}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Programming Languages Card */}
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                        Languages
                        {selectedLanguages.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          >
                            {selectedLanguages.length}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {practiceData.languages.map((language: Language) => (
                          <Button
                            key={language.id}
                            variant={
                              selectedLanguages.includes(language.id)
                                ? "default"
                                : "ghost"
                            }
                            size="sm"
                            onClick={() => toggleLanguage(language.id)}
                            className={`w-full justify-start h-10 transition-all duration-200 ${
                              selectedLanguages.includes(language.id)
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm hover:from-purple-600 hover:to-pink-600"
                                : "hover:bg-purple-50 dark:hover:bg-purple-950 hover:text-purple-700 dark:hover:text-purple-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className="h-3 w-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: language.color }}
                              />
                              <span className="truncate">{language.name}</span>
                            </div>
                            {selectedLanguages.includes(language.id) && (
                              <X className="h-3 w-3 ml-auto flex-shrink-0" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Companies Card */}
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                        Companies
                        {selectedCompanies.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          >
                            {selectedCompanies.length}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="max-h-64 overflow-y-auto space-y-1">
                        {practiceData.companies.map((company: Company) => (
                          <Button
                            key={company.id}
                            variant={
                              selectedCompanies.includes(company.id)
                                ? "default"
                                : "ghost"
                            }
                            size="sm"
                            onClick={() => toggleCompany(company.id)}
                            className={`w-full justify-start h-12 transition-all duration-200 ${
                              selectedCompanies.includes(company.id)
                                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm hover:from-orange-600 hover:to-red-600"
                                : "hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-700 dark:hover:text-orange-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Image
                                src={company.logo}
                                alt={company.name}
                                width={16}
                                height={16}
                                className="h-4 w-4 rounded flex-shrink-0"
                              />
                              <div className="min-w-0 text-left">
                                <div className="truncate font-medium text-sm">
                                  {company.name}
                                </div>
                                <div className="text-[10px] opacity-70 truncate">
                                  {company.industry}
                                </div>
                              </div>
                            </div>
                            {selectedCompanies.includes(company.id) && (
                              <X className="h-3 w-3 ml-auto flex-shrink-0" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Topics & Tags Card */}
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        Topics & Tags
                        {selectedTags.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                          >
                            {selectedTags.length}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="max-h-64 overflow-y-auto">
                        <div className="flex flex-wrap gap-1">
                          {allTags.map((tag) => (
                            <Button
                              key={tag}
                              variant={
                                selectedTags.includes(tag)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => toggleTag(tag)}
                              className={`h-8 text-xs px-2 transition-all duration-200 ${
                                selectedTags.includes(tag)
                                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm hover:from-indigo-600 hover:to-purple-600 border-transparent"
                                  : "hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                              }`}
                            >
                              <span className="truncate max-w-[120px]">
                                {tag.replace(/-/g, " ")}
                              </span>
                              {selectedTags.includes(tag) && (
                                <X className="h-2 w-2 ml-1 flex-shrink-0" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Active filters:
                  </span>
                  {selectedCategories.map((categoryId) => {
                    const category = practiceData.categories.find(
                      (c: Category) => c.id === categoryId,
                    );
                    return (
                      <Badge
                        key={categoryId}
                        variant="secondary"
                        className="text-xs"
                      >
                        {category?.name}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => toggleCategory(categoryId)}
                        />
                      </Badge>
                    );
                  })}
                  {selectedDifficulties.map((difficulty) => (
                    <Badge
                      key={difficulty}
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {difficulty}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => toggleDifficulty(difficulty)}
                      />
                    </Badge>
                  ))}
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag.replace("-", " ")}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      />
                    </Badge>
                  ))}
                  {selectedCompanies.map((companyId) => {
                    const company = getCompanyInfo(companyId);
                    return (
                      <Badge
                        key={companyId}
                        variant="secondary"
                        className="text-xs flex items-center"
                      >
                        {company && (
                          <Image
                            src={company.logo}
                            alt={company.name}
                            width={12}
                            height={12}
                            className="h-3 w-3 mr-1 rounded"
                          />
                        )}
                        {company?.name || companyId}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => toggleCompany(companyId)}
                        />
                      </Badge>
                    );
                  })}
                  {selectedLanguages.map((languageId) => {
                    const language = getLanguageInfo(languageId);
                    return (
                      <Badge
                        key={languageId}
                        variant="secondary"
                        className="text-xs flex items-center"
                      >
                        <div
                          className="h-2 w-2 mr-1 rounded-full"
                          style={{
                            backgroundColor: language?.color || "#6b7280",
                          }}
                        />
                        {language?.name || languageId}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => toggleLanguage(languageId)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {filteredQuestions.length} Question
                {filteredQuestions.length !== 1 ? "s" : ""} Found
              </h2>
              {hasActiveFilters && (
                <p className="text-sm text-muted-foreground">
                  Filtered from {practiceData.metadata.totalQuestions} total
                  questions
                </p>
              )}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {filteredQuestions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No questions found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters to find practice
                    questions.
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearAllFilters}>
                      <FilterX className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredQuestions.map((question: ExtendedQuestion) => (
                <Card
                  key={question.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            {question.title}
                          </CardTitle>
                          {question.company && (
                            <div className="flex items-center gap-2">
                              {(() => {
                                const company = getCompanyInfo(
                                  question.company,
                                );
                                return company ? (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
                                    <Image
                                      src={company.logo}
                                      alt={company.name}
                                      width={16}
                                      height={16}
                                      className="h-4 w-4 rounded"
                                    />
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {company.name}
                                    </span>
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          )}
                          {question.language && (
                            <div className="flex items-center gap-2">
                              {(() => {
                                const language = getLanguageInfo(
                                  question.language,
                                );
                                return language ? (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
                                    <div
                                      className="h-3 w-3 rounded-full"
                                      style={{
                                        backgroundColor: language.color,
                                      }}
                                    />
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {language.name}
                                    </span>
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          )}
                        </div>
                        <CardDescription className="text-sm text-muted-foreground mb-3">
                          {question.categoryName}
                        </CardDescription>
                      </div>
                      <Badge
                        className={getDifficultyColor(question.difficulty)}
                      >
                        {question.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground mb-4">{question.question}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {question.tags.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Documentation Links */}
                    {question.documentationLinks &&
                      question.documentationLinks.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">
                            Documentation & Resources:
                          </h4>
                          <div className="space-y-2">
                            {question.documentationLinks.map(
                              (link: DocumentationLink) => (
                                <div
                                  key={link.title}
                                  className="flex items-start space-x-2"
                                >
                                  <ExternalLink className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <div>
                                    <Link
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline font-medium text-sm"
                                    >
                                      {link.title}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
                                      {link.description}
                                    </p>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
