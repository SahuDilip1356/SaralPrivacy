"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "accent" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  as?: "button" | "a";
  href?: string;
}

const variantClasses = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 border border-transparent",
  secondary: "bg-saffron-500 text-white hover:bg-saffron-600 border border-transparent",
  outline:
    "bg-transparent text-brand-700 border-2 border-brand-700 hover:bg-brand-700 hover:text-white",
  accent: "bg-saffron-500 text-brand-700 hover:bg-saffron-600 border border-transparent",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
  danger: "bg-red-600 text-white hover:bg-red-700 border border-transparent",
};

const sizeClasses = {
  sm: "px-4 py-2 text-xs font-semibold rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm font-semibold rounded-lg gap-2",
  lg: "px-7 py-3.5 text-base font-semibold rounded-xl gap-2",
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
          "inline-flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saffron-500 disabled:opacity-50 disabled:cursor-not-allowed",
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
