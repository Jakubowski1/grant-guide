"use client";

import { HelpCircle, LogOut, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/atoms/theme-toggle";
import { AvatarIconDisplay } from "@/components/molecules/avatar-icon-selector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/providers/auth-provider";

interface DashboardNavbarProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function DashboardNavbar({
  setSidebarOpen,
}: DashboardNavbarProps) {
  const { user, userData, signOut } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <TooltipProvider>
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-4 h-16 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2"
              >
                <Menu className="h-4 w-4" />
                Menu
              </Button>
              <ThemeToggle />

              {/* User Actions */}
              <div className="flex items-center space-x-2">
                {/* Avatar - Profile Link */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/profile">
                      <div className="w-8 h-8 rounded-full hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                        {userData?.avatarIcon ? (
                          <AvatarIconDisplay
                            iconId={userData.avatarIcon}
                            size="md"
                            className="w-8 h-8"
                          />
                        ) : (
                          <Avatar className="w-8 h-8 border-2 border-primary/20">
                            <AvatarImage
                              src={user?.photoURL || userData?.photoURL}
                              alt={
                                userData?.displayName ||
                                user?.displayName ||
                                "User"
                              }
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(
                                userData?.displayName ||
                                  user?.displayName ||
                                  null,
                              )}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Profile</p>
                  </TooltipContent>
                </Tooltip>

                {/* Settings */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/settings">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-foreground hover:bg-accent"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>

                {/* Help & Support */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/support">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-foreground hover:bg-accent"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Help & Support</p>
                  </TooltipContent>
                </Tooltip>

                {/* Sign Out */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-foreground hover:bg-accent"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign Out</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
