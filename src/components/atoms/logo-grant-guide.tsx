"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl";
  variant?: "default" | "minimal";
  className?: string;
  isMobile?: boolean;
}

export default function Logo({
  size = "md",
  variant = "minimal",
  className = "",
}: LogoProps) {
  const iconSizes = {
    xs: 20,
    sm: 48,
    md: 72,
    lg: 100,
    xl: 200,
    xxl: 400,
    xxxl: 600,
  };

  return (
    <>
      {variant === "minimal" ? (
        <Link href="/" className="flex flex-col items-center justify-center">
          <Image
            className={className}
            src="/GrantGuideLogoMini.svg"
            alt="Logo Grant Guide"
            width={iconSizes[size]}
            height={iconSizes[size]}
          />
        </Link>
      ) : (
        <Link href="/" className="flex flex-col items-center justify-center">
          <Image
            className={className}
            src="/GrantGuideLogoMain.svg"
            alt="Logo Grant Guide"
            width={iconSizes[size]}
            height={iconSizes[size]}
          />
        </Link>
      )}
    </>
  );
}
