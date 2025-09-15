"use client";

import { ReactNode, useState } from "react";
import DashboardNavbar from "@/components/organisms/dashboard-navbar";
import Sidebar from "@/components/organisms/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  navbarActions?: ReactNode;
  navbarChildren?: ReactNode;
}

export default function DashboardLayout({
  children,
  title,
  navbarActions,
  navbarChildren,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
        <DashboardNavbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          actions={navbarActions}
        >
          {navbarChildren}
        </DashboardNavbar>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}