"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/atoms/logo-grant-guide";
import { ThemeToggle } from "@/components/atoms/theme-toggle";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  scrollThreshold?: number;
}

export default function Navbar({ scrollThreshold = 100 }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let ticking = false;
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          clearTimeout(timeoutId);

          timeoutId = setTimeout(() => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > scrollThreshold);
          }, 16); // Small debounce to smooth out rapid scroll events

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [scrollThreshold]);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {!isScrolled && !isMobile ? (
            <Logo size="lg" variant="default" />
          ) : (
            <Logo size="sm" variant="minimal" />
          )}

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
