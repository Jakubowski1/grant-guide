"use client";

import React, { useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { gsap } from "gsap";

interface Logo {
  node?: React.ReactNode;
  src?: string;
  alt?: string;
  title?: string;
  href?: string;
}

interface LogoLoopProps {
  logos: Logo[];
  logoHeight?: number;
  gap?: number;
  speed?: number;
  scaleOnHover?: boolean;
  pauseOnHover?: boolean;
  fadeWidth?: number;
  className?: string;
}

export default function LogoLoop({
  logos,
  logoHeight = 48,
  gap = 40,
  speed = 100,
  scaleOnHover = true,
  pauseOnHover = true,
  fadeWidth = 80,
  className = "",
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<HTMLDivElement>(null);

  // Duplicate logos enough to fill container twice for seamless loop
  const duplicatedLogos = useMemo(() => {
    if (!containerRef.current || logos.length === 0) return [];

    const containerWidth = containerRef.current.offsetWidth;
    const singleLogoWidth = logoHeight * 1.2 + gap;
    const repeatCount = Math.ceil((containerWidth * 2) / (logos.length * singleLogoWidth));
    const duplicated: Logo[] = [];

    for (let i = 0; i < repeatCount; i++) {
      duplicated.push(...logos);
    }

    return [...duplicated, ...duplicated];
  }, [logos, logoHeight, gap]);

  // GSAP infinite scroll with per-logo fade
  useEffect(() => {
    if (!loopRef.current || duplicatedLogos.length === 0) return;
    const loop = loopRef.current;
    const container = containerRef.current;
    const totalWidth = loop.scrollWidth / 2;

    gsap.set(loop, { x: 0 });

    const tween = gsap.to(loop, {
      x: -totalWidth,
      duration: totalWidth / speed,
      ease: "linear",
      modifiers: {
        x: (x) => {
          let val = parseFloat(x);
          if (val <= -totalWidth) val += totalWidth;
          return `${val}px`;
        },
      },
      repeat: -1,
      onUpdate: () => {
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const children = Array.from(loop.children) as HTMLElement[];
        children.forEach((child) => {
          const childRect = child.getBoundingClientRect();
          const distanceLeft = childRect.left - containerRect.left;
          const distanceRight = containerRect.right - childRect.right;
          let opacity = 1;

          if (distanceLeft < fadeWidth) opacity = distanceLeft / fadeWidth;
          if (distanceRight < fadeWidth) opacity = Math.min(opacity, distanceRight / fadeWidth);

          child.style.opacity = opacity.toString();
        });
      },
    });

    if (pauseOnHover && container) {
      const handleEnter = () => tween.pause();
      const handleLeave = () => tween.resume();
      container.addEventListener("mouseenter", handleEnter);
      container.addEventListener("mouseleave", handleLeave);

      return () => {
        tween.kill();
        container.removeEventListener("mouseenter", handleEnter);
        container.removeEventListener("mouseleave", handleLeave);
      };
    }

    return () => tween.kill();
  }, [duplicatedLogos, speed, fadeWidth, pauseOnHover]);

  return (
    <section
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: `${logoHeight}px` }}
    >
      <div ref={loopRef} className="flex items-center h-full" style={{ gap: `${gap}px`, width: "fit-content" }}>
        {duplicatedLogos.map((logo, idx) => (
          <div
            key={idx}
            className={`flex-shrink-0 flex items-center justify-center transition-transform duration-200 ${scaleOnHover ? "hover:scale-110" : ""
              }`}
            style={{ height: `${logoHeight}px`, minWidth: `${logoHeight * 1.2}px` }}
          >
            {logo.href ? (
              <a
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-full w-full"
                title={logo.title || logo.alt}
              >
                {logo.node ? (
                  <div style={{ fontSize: `${logoHeight * 0.5}px` }}>{logo.node}</div>
                ) : logo.src ? (
                  <Image
                    src={logo.src || "/placeholder.svg"}
                    alt={logo.alt || ""}
                    width={logoHeight * 1.1}
                    height={logoHeight * 0.7}
                    style={{ width: "auto", height: "auto" }}
                    className="object-contain"
                  />
                ) : null}
              </a>
            ) : logo.node ? (
              <div style={{ fontSize: `${logoHeight * 0.5}px` }}>{logo.node}</div>
            ) : logo.src ? (
              <Image
                src={logo.src || "/placeholder.svg"}
                alt={logo.alt || ""}
                width={logoHeight * 1.1}
                height={logoHeight * 0.7}
                style={{ width: "auto", height: "auto" }}
                className="object-contain"
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
