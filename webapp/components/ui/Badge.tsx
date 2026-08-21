"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "navy" | "teal" | "amber" | "red" | "green" | "gray";
  size?: "sm" | "md";
  className?: string;
}

const variantClasses = {
  navy: "bg-navy-100 text-navy-700",
  teal: "bg-teal-100 text-teal-900",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  green: "bg-green-100 text-green-800",
  gray: "bg-slate-100 text-slate-600",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  children,
  variant = "gray",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
