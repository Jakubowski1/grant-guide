"use client";

import {
  BookOpen,
  Cookie,
  HelpCircle,
  History,
  Home,
  LogOut,
  Menu,
  Plus,
  Save,
  Settings as SettingsIcon,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/atoms/loading-page";
import Logo from "@/components/atoms/logo-grant-guide";
import { ThemeToggle } from "@/components/atoms/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/providers/auth-provider";

interface CookieSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Load cookie settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("cookieSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setCookieSettings({
          essential: true, // Always force essential cookies to true
          analytics: parsed.analytics || false,
          marketing: parsed.marketing || false,
          preferences: parsed.preferences || false,
        });
      } catch (error) {
        console.error("Error parsing cookie settings:", error);
      }
    }
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  const handleCookieSettingChange = (
    key: keyof CookieSettings,
    value: boolean,
  ) => {
    if (key === "essential") return; // Cannot change essential cookies

    setCookieSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem("cookieSettings", JSON.stringify(cookieSettings));

      // You could also save to your backend/database here
      // await DatabaseService.updateUserSettings(user.uid, { cookieSettings });

      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const clearAllCookies = () => {
    if (
      confirm(
        "Are you sure you want to clear all cookies? This will reset your preferences.",
      )
    ) {
      // Clear all cookies except essential ones
      const cookies = document.cookie.split(";");
      const essentialCookies = ["auth-token", "session", "csrf"];

      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

        // Don't clear essential cookies
        const isEssential = essentialCookies.some((essential) =>
          name.includes(essential),
        );

        if (!isEssential && name) {
          // Clear cookie using a safer approach
          try {
            const clearCookie = (cookieName: string) => {
              const paths = ["/", `${window.location.pathname}`];
              const domains = ["", window.location.hostname];

              paths.forEach((path) => {
                domains.forEach((domain) => {
                  const domainPart = domain ? `; domain=${domain}` : "";
                  // biome-ignore lint/suspicious/noDocumentCookie: Legacy browser support required for cookie clearing
                  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainPart}`;
                });
              });
            };

            clearCookie(name);
          } catch (error) {
            console.warn(`Failed to clear cookie: ${name}`, error);
          }
        }
      });

      // Reset cookie settings
      setCookieSettings({
        essential: true,
        analytics: false,
        marketing: false,
        preferences: false,
      });

      alert("Non-essential cookies have been cleared.");
    }
  };

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
              className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
            >
              <SettingsIcon className="h-5 w-5" />
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

          <div className="pt-4 border-t border-sidebar-border">
            <button
              type="button"
              onClick={() => {
                // Add logout functionality
                window.location.href = "/auth";
              }}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full text-left"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSidebarOpen(false);
            }
          }}
          type="button"
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
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
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

        {/* Settings Content */}
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="space-y-8">
            {/* Cookie Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5" />
                  Cookie Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your cookie preferences for this application.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Essential Cookies */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">
                      Essential Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Required for the website to function properly. Cannot be
                      disabled.
                    </p>
                  </div>
                  <Switch
                    checked={cookieSettings.essential}
                    disabled={true}
                    aria-label="Essential cookies (always enabled)"
                  />
                </div>

                <Separator />

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">
                      Analytics Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how you use our application to improve
                      your experience.
                    </p>
                  </div>
                  <Switch
                    checked={cookieSettings.analytics}
                    onCheckedChange={(checked: boolean) =>
                      handleCookieSettingChange("analytics", checked)
                    }
                  />
                </div>

                <Separator />

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">
                      Marketing Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Used to show you relevant advertisements and track
                      campaign performance.
                    </p>
                  </div>
                  <Switch
                    checked={cookieSettings.marketing}
                    onCheckedChange={(checked: boolean) =>
                      handleCookieSettingChange("marketing", checked)
                    }
                  />
                </div>

                <Separator />

                {/* Preferences Cookies */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">
                      Preferences Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Remember your settings and preferences for a better
                      experience.
                    </p>
                  </div>
                  <Switch
                    checked={cookieSettings.preferences}
                    onCheckedChange={(checked: boolean) =>
                      handleCookieSettingChange("preferences", checked)
                    }
                  />
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Settings
                  </Button>

                  <Button
                    variant="outline"
                    onClick={clearAllCookies}
                    className="flex items-center gap-2"
                  >
                    <Cookie className="h-4 w-4" />
                    Clear All Cookies
                  </Button>
                </div>

                {/* Cookie Information */}
                <div className="bg-muted/50 rounded-lg p-4 mt-6">
                  <h4 className="font-medium mb-2">Current Cookie Status</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Essential:</span>
                      <span className="ml-2 text-green-600">Always Active</span>
                    </div>
                    <div>
                      <span className="font-medium">Analytics:</span>
                      <span
                        className={`ml-2 ${cookieSettings.analytics ? "text-green-600" : "text-red-600"}`}
                      >
                        {cookieSettings.analytics ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Marketing:</span>
                      <span
                        className={`ml-2 ${cookieSettings.marketing ? "text-green-600" : "text-red-600"}`}
                      >
                        {cookieSettings.marketing ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Preferences:</span>
                      <span
                        className={`ml-2 ${cookieSettings.preferences ? "text-green-600" : "text-red-600"}`}
                      >
                        {cookieSettings.preferences ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Settings Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  More settings will be available here in future updates.
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Coming soon: Notification preferences, data export options,
                  and more.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
