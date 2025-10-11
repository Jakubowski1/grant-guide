"use client";

import { BookOpen, History, Home, Plus, X } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/atoms/logo-the-mockr";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function DashboardSidebar({
  sidebarOpen,
  setSidebarOpen,
}: DashboardSidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-sidebar text-sky-50 border-r border-sidebar-border transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col overflow-hidden`}
      >
        <div className="border-b border-border">
          <div className="px-4 h-16 flex items-center">
            <div className="flex items-center justify-between w-full">
              <Logo />

              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
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
        </nav>

        {/* Footer - Sticky at bottom */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 text-center">
            © Rights Reserved the:mockr
          </p>
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
    </>
  );
}
