"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Calendar,
  Clock,
  Briefcase,
  Upload,
  Save,
  ArrowLeft,
} from "lucide-react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

export default function ProfilePage() {
  const { user, userData, loading, refreshUserData } = useAuth();
  const router = useRouter();
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
    console.log("Database connection:", db ? "✅ Connected" : "❌ Not connected");
    
    if (!user) {
      console.error("❌ Missing user");
      alert("User not authenticated. Please sign in again.");
      return;
    }

    if (!db) {
      console.error("❌ Database not initialized");
      alert("Database connection failed. Please refresh the page and try again.");
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
        photoURL: user.photoURL || userData?.photoURL || undefined,
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
      alert(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

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
                  console.log("🖱️ Edit Profile button clicked! Current editing state:", isEditing);
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
                      setEditData((prev) => ({ ...prev, role: e.target.value }))
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
                      console.log("Button state:", { saving, isEditing, user: !!user, userData: !!userData });
                      handleSaveProfile();
                    }}
                    onMouseDown={() => console.log("🖱️ Save button mouse down!")}
                    onMouseEnter={() => console.log("🖱️ Save button mouse enter!")}
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
  );
}