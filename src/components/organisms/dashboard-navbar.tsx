"use client";

import { HelpCircle, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/atoms/theme-toggle";
import { Button } from "@/components/ui/button";

interface DashboardNavbarProps {
  onSignOut: () => void;
}

export default function DashboardNavbar({ onSignOut }: DashboardNavbarProps) {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="px-4 h-16 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* User Actions */}
            <div className="flex items-center space-x-2">
              {/* Avatar - Profile Link */}
              <Link href="/profile">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </Link>

              {/* Settings */}
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>

              {/* Help & Support */}
              <Link href="/support">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </Link>

              {/* Sign Out */}
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:bg-accent"
                onClick={onSignOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
