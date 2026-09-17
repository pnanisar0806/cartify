import React from "react";

interface LogoProps {
  className?: string;
}

/**
 * Official Swiggy Instamart vector logo
 */
export function SwiggyLogo({ className = "h-5 w-auto" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 74 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Swiggy Orange Icon */}
      <g transform="translate(0, 0)">
        <path
          d="M12.034 24c-.376-.411-2.075-2.584-3.95-5.513-.547-.916-.901-1.63-.833-1.814.178-.48 3.355-.743 4.333-.308.298.132.29.307.29.409 0 .44-.022 1.619-.022 1.619a.441.441 0 1 0 .883-.002l-.005-2.939c0-.255-.278-.319-.331-.329-.511-.002-1.548-.006-2.661-.006-2.457 0-3.006.101-3.423-.172-.904-.591-2.383-4.577-2.417-6.819C3.849 4.964 5.723 2.225 8.362.868A8.13 8.13 0 0 1 12.026 0c4.177 0 7.617 3.153 8.075 7.209l.001.011c.084.981-5.321 1.189-6.39.904-.164-.044-.206-.212-.206-.284L13.5 4.996a.442.442 0 0 0-.884.002l.009 3.866a.33.33 0 0 0 .268.32l3.354-.001c1.79 0 2.542.207 3.042.588.333.254.461.739.349 1.37C18.633 16.755 12.273 23.71 12.034 24z"
          fill="#FC8019"
        />
      </g>
      {/* Brand text */}
      <text
        x="24"
        y="16.5"
        fill="#FC8019"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="13"
        letterSpacing="-0.3"
      >
        swiggy
      </text>
    </svg>
  );
}

/**
 * Official Blinkit vector logo with trademark yellow background & green branding
 */
export function BlinkitLogo({ className = "h-5 w-auto" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 74 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Yellow pill badge */}
      <rect width="74" height="24" rx="6" fill="#F8CB46" />
      {/* 'blink' in dark ink */}
      <text
        x="7"
        y="16.5"
        fill="#181C14"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="13.5"
        letterSpacing="-0.4"
      >
        blink
      </text>
      {/* 'it' in signature green */}
      <text
        x="51"
        y="16.5"
        fill="#0C831F"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="13.5"
        letterSpacing="-0.4"
      >
        it
      </text>
    </svg>
  );
}

/**
 * Official Amazon Fresh vector logo (Amazon text + signature orange smile + green fresh badge)
 */
export function AmazonFreshLogo({ className = "h-5 w-auto" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 102 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Amazon Text */}
      <text
        x="0"
        y="14"
        fill="#131921"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize="12.5"
        letterSpacing="-0.3"
      >
        amazon
      </text>
      {/* Signature Amazon smile curve */}
      <path
        d="M2 18c8 4.5 24 4.5 35-1.5-.5.8-1.5 2-2.5 2.5-10 4-22 3.5-32.5-1"
        stroke="#FF9900"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="#FF9900"
      />
      {/* Smile Arrowhead */}
      <path
        d="M38 16.5l-2.2 3.2 3.8-.4z"
        fill="#FF9900"
      />
      {/* Green 'fresh' Pill */}
      <rect x="47" y="2" width="53" height="20" rx="4" fill="#007600" />
      <text
        x="53"
        y="16"
        fill="#FFFFFF"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="11"
        letterSpacing="0.2"
      >
        fresh
      </text>
    </svg>
  );
}

/**
 * Official Amazon Now vector logo (Amazon text + smile + blue/orange NOW speed badge)
 */
export function AmazonNowLogo({ className = "h-5 w-auto" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 94 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Amazon Text */}
      <text
        x="0"
        y="14"
        fill="#131921"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize="12.5"
        letterSpacing="-0.3"
      >
        amazon
      </text>
      {/* Signature Amazon smile curve */}
      <path
        d="M2 18c8 4.5 24 4.5 35-1.5-.5.8-1.5 2-2.5 2.5-10 4-22 3.5-32.5-1"
        stroke="#FF9900"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="#FF9900"
      />
      <path
        d="M38 16.5l-2.2 3.2 3.8-.4z"
        fill="#FF9900"
      />
      {/* Orange 'NOW' Speed Pill */}
      <rect x="47" y="2" width="45" height="20" rx="4" fill="#FF9900" />
      <text
        x="53"
        y="16"
        fill="#131921"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="11"
        letterSpacing="0.6"
      >
        NOW
      </text>
    </svg>
  );
}
