"use client";

import { updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import {
  BookOpen,
  Briefcase,
  Calendar,
  Clock,
  HelpCircle,
  History,
  Home,
  LogOut,
  Mail,
  Menu,
  Plus,
  Save,
  Settings,
  Upload,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/atoms/loading-page";
import Logo from "@/components/atoms/logo-grant-guide";
import { ThemeToggle } from "@/components/atoms/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/providers/auth-provider";

export default function ProfilePage() {
  const { user, userData, loading, refreshUserData } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    displayName: "",
    role: "",
    experience: "",
  });

  // Debug Firebase connection on component mount
  useEffect(() => {
    console.log("🔍 ProfilePage mounted - Firebase connection status:");
    console.log("Database (db):", db ? "✅ Connected" : "❌ Not connected");
    console.log("Auth:", auth ? "✅ Connected" : "❌ Not connected");
    console.log("User:", user?.uid);
    console.log("UserData:", userData);
    console.log("Loading:", loading);
    console.log("Is Editing:", isEditing);
    console.log("Saving:", saving);
    console.log("Edit Data:", editData);
  }, [user, userData, loading, isEditing, saving, editData]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Initialize edit data from userData or fallback to user auth data
    setEditData({
      displayName: userData?.displayName || user?.displayName || "",
      role: userData?.role || "",
      experience: userData?.experience || "",
    });
  }, [userData, user]);

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${user.uid}`);

      // Upload file
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firebase Auth profile
      await updateProfile(user, {
        photoURL: downloadURL,
      });

      // Update Firestore user document
      if (db) {
        await updateDoc(doc(db, "users", user.uid), {
          photoURL: downloadURL,
        });
      }

      // Refresh user data instead of reloading the page
      await refreshUserData();
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    console.log("🔄 handleSaveProfile called");
    console.log("User:", user?.uid);
    console.log("UserData:", userData);
    console.log("EditData:", editData);
    console.log(
      "Database connection:",
      db ? "✅ Connected" : "❌ Not connected",
    );

    if (!user) {
      console.error("❌ Missing user");
      alert("User not authenticated. Please sign in again.");
      return;
    }

    if (!db) {
      console.error("❌ Database not initialized");
      alert(
        "Database connection failed. Please refresh the page and try again.",
      );
      return;
    }

    setSaving(true);
    try {
      console.log("🔄 Updating Firebase Auth profile...");
      // Update Firebase Auth display name
      await updateProfile(user, {
        displayName: editData.displayName,
      });
      console.log("✅ Firebase Auth profile updated");

      console.log("🔄 Updating/Creating Firestore document...");

      // Prepare user data for Firestore
      const userDocData = {
        displayName: editData.displayName,
        role: editData.role,
        experience: editData.experience,
        email: user.email || "",
        uid: user.uid,
        // Only include photoURL if it exists
        ...(user.photoURL && { photoURL: user.photoURL }),
        ...(!user.photoURL &&
          userData?.photoURL && { photoURL: userData.photoURL }),
        // Preserve existing data if userData exists
        ...(userData && {
          createdAt: userData.createdAt,
          howDidYouHear: userData.howDidYouHear,
        }),
        // Always update lastLoginAt
        lastLoginAt: new Date(),
        // Set createdAt only if this is a new document (userData is null)
        ...(!userData && { createdAt: new Date() }),
      };

      // Use setDoc with merge option to create or update the document
      await setDoc(doc(db, "users", user.uid), userDocData, { merge: true });
      console.log("✅ Firestore document updated/created");

      console.log("🔄 Refreshing user data...");
      await refreshUserData();
      console.log("✅ User data refreshed");

      setIsEditing(false);
      console.log("✅ Profile save completed successfully");
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      alert(
        `Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setSaving(false);
      console.log("🏁 handleSaveProfile finished");
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
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
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <BookOpen className="h-5 w-5" />
            <span>Practice Library</span>
          </Link>

          <div className="pt-4 border-t border-sidebar-border">
            <Link
              href="/profile"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
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

          <div className="pt-4 border-t border-sidebar-border">
            <button
              type="button"
              onClick={() => {
                // Add logout functionality
                router.push("/auth");
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
          type="button"
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
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
                <h1 className="text-2xl font-bold text-foreground">
                  Profile Settings
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

        {/* Profile Content */}
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Avatar & Basic Info Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div className="relative mx-auto w-32 h-32 mb-4">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage
                      src={user.photoURL || userData?.photoURL}
                      alt={userData?.displayName || "User"}
                    />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10">
                      {getInitials(userData?.displayName || user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors">
                        {uploading ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </div>
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl">
                  {userData?.displayName || user.displayName || "User"}
                </CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
                {(userData?.role || editData.role) && (
                  <Badge variant="secondary" className="mt-2">
                    {userData?.role || editData.role}
                  </Badge>
                )}
              </CardHeader>
            </Card>

            {/* Profile Details Card */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Details
                </CardTitle>
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => {
                    console.log(
                      "🖱️ Edit Profile button clicked! Current editing state:",
                      isEditing,
                    );
                    if (isEditing) {
                      console.log("🔄 Cancelling edit mode");
                      setIsEditing(false);
                      // Reset edit data
                      setEditData({
                        displayName: userData?.displayName || "",
                        role: userData?.role || "",
                        experience: userData?.experience || "",
                      });
                    } else {
                      console.log("🔄 Enabling edit mode");
                      setIsEditing(true);
                    }
                    console.log("🔄 New editing state will be:", !isEditing);
                  }}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  {isEditing ? (
                    <Input
                      id="displayName"
                      value={editData.displayName}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          displayName: e.target.value,
                        }))
                      }
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <p className="text-sm bg-muted rounded-md p-3">
                      {userData?.displayName || user.displayName || "Not set"}
                    </p>
                  )}
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <p className="text-sm bg-muted rounded-md p-3 text-muted-foreground">
                    {user.email}
                  </p>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Role/Position
                  </Label>
                  {isEditing ? (
                    <Input
                      id="role"
                      value={editData.role}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      placeholder="Enter your role or position"
                    />
                  ) : (
                    <p className="text-sm bg-muted rounded-md p-3">
                      {userData?.role || "Not set"}
                    </p>
                  )}
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  {isEditing ? (
                    <Input
                      id="experience"
                      value={editData.experience}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          experience: e.target.value,
                        }))
                      }
                      placeholder="Enter your experience level"
                    />
                  ) : (
                    <p className="text-sm bg-muted rounded-md p-3">
                      {userData?.experience || "Not set"}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        console.log("🖱️ Save button clicked!");
                        console.log("Button state:", {
                          saving,
                          isEditing,
                          user: !!user,
                          userData: !!userData,
                        });
                        handleSaveProfile();
                      }}
                      onMouseDown={() =>
                        console.log("🖱️ Save button mouse down!")
                      }
                      onMouseEnter={() =>
                        console.log("🖱️ Save button mouse enter!")
                      }
                      disabled={saving}
                      className="flex items-center gap-2"
                      type="button"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Information Card */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </Label>
                    <p className="font-medium">
                      {userData?.createdAt
                        ? formatDate(userData.createdAt)
                        : "Unknown"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Last Login
                    </Label>
                    <p className="font-medium">
                      {userData?.lastLoginAt
                        ? formatDate(userData.lastLoginAt)
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="font-semibold">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">User ID</Label>
                      <p className="font-mono text-sm bg-muted rounded p-2 break-all">
                        {user.uid}
                      </p>
                    </div>
                    {userData?.howDidYouHear && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">
                          How did you hear about us?
                        </Label>
                        <p className="text-sm bg-muted rounded p-2">
                          {userData.howDidYouHear}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
