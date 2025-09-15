"use client";

import { Menu, Plus } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { ThemeToggle } from "@/components/atoms/theme-toggle";
import { Button } from "@/components/ui/button";

interface DashboardNavbarProps {
  onMenuClick: () => void;
  title?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export default function DashboardNavbar({
  onMenuClick,
  title,
  actions,
  children,
}: DashboardNavbarProps) {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-foreground hover:bg-accent"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {title && (
              <h1 className="text-2xl font-bold text-foreground lg:block hidden">
                {title}
              </h1>
            )}
            {children}
          </div>
          <div className="flex items-center space-x-4">
            {actions}
            <ThemeToggle />
            <Link href="/configure">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                New Interview
                <Plus className="size-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}