"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * `primary` is the single filled action per viewport. On a navy surface use
   * `primaryOnDark` — the light-surface fill is too dark to read there.
   */
  variant?:
    | "primary"
    | "primaryOnDark"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  as?: "button" | "a";
  href?: string;
}

// Contrast measured 2026-08-19 against the 4.5:1 AA bar. Do not substitute
// shades by eye: white on green-500 — the previous default — is 2.54:1.
const variantClasses = {
  // white on green-700 — 5.48:1
  primary: "bg-green-700 text-white hover:bg-green-800 border border-transparent",
  // navy-950 on green-400 — 9.72:1, the brightest thing on a navy band
  primaryOnDark:
    "bg-green-400 text-navy-950 hover:bg-green-300 border border-transparent",
  secondary: "bg-navy-700 text-white hover:bg-navy-800 border border-transparent",
  outline:
    "bg-transparent text-navy-700 border-2 border-navy-700 hover:bg-navy-700 hover:text-white",
  // Quiet secondary action: a hairline, not a fill.
  ghost:
    "bg-transparent text-navy-700 border border-pearl-300 hover:bg-cloud-100",
  danger: "bg-red-600 text-white hover:bg-red-700 border border-transparent",
};

// Radius vocabulary is 8 / 12 / pill: buttons and inputs take the 8px tier.
const sizeClasses = {
  sm: "px-4 py-2 text-xs font-semibold rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm font-semibold rounded-lg gap-2",
  lg: "px-7 py-3.5 text-base font-semibold rounded-lg gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-700 disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing…
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
