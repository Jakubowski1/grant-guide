"use client";

import GrantGuideLogo from "./grant-guide-logo";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal";
  className?: string;
  isMobile?: boolean;
}

export default function Logo({
  size = "md",
  variant = "default",
  className = "",
  isMobile = false,
}: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${iconSizes[size]} relative`}>
        <GrantGuideLogo className="w-full h-full" />
      </div>
      {variant === "default" && !isMobile && (
        <div className="flex flex-col">
          <h1
            className={`font-bold tracking-tight ${sizeClasses[size]} text-foreground`}
          >
            Grant Guide
          </h1>

          {size !== "sm" && (
            <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
              Interview Mastery
            </span>
          )}
        </div>
      )}
    </div>
  );
}
