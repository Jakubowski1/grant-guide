import type React from "react";

interface GrantGuideLogoProps {
  size?: number;
  className?: string;
}

const GrantGuideLogo: React.FC<GrantGuideLogoProps> = ({
  size = 48,
  className = "",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Grant Guide Logo"
    >
      <title>Grant Guide Logo</title>
      {/* Ultra-modern geometric design - three ascending bars forming an arrow */}
      <g className="text-brand-mint">
        {/* Bottom bar - shortest */}
        <rect x="8" y="32" width="12" height="4" rx="2" fill="currentColor" />

        {/* Middle bar - medium */}
        <rect x="14" y="24" width="16" height="4" rx="2" fill="currentColor" />

        {/* Top bar - longest with arrow point */}
        <path
          d="M20 16 L36 16 C37.105 16 38 16.895 38 18 C38 19.105 37.105 20 36 20 L20 20 C18.895 20 18 19.105 18 18 C18 16.895 18.895 16 20 16 Z"
          fill="currentColor"
        />

        {/* Modern arrow point */}
        <path d="M36 12 L42 18 L36 24 L36 20 L36 16 Z" fill="currentColor" />
      </g>
    </svg>
  );
};

export default GrantGuideLogo;
