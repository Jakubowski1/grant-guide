import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";
import { AuthProvider } from "../providers/auth-provider";
import { ThemeProvider } from "../providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grant Guide - AI Interview Preparation Platform",
  description:
    "Master your interviews with AI-powered practice sessions, personalized feedback, and company-specific preparation",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
