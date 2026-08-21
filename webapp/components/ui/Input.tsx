"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
            "transition-colors duration-200 text-sm bg-white",
            error && "border-red-400 focus:ring-red-400",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-semibold text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
            "transition-colors duration-200 text-sm bg-white appearance-none",
            error && "border-red-400 focus:ring-red-400",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-semibold text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
            "transition-colors duration-200 text-sm bg-white resize-y",
            error && "border-red-400 focus:ring-red-400",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, description, className, id, ...props }, ref) => {
    const checkboxId = id || Math.random().toString(36).substr(2, 9);

    return (
      <div className="space-y-1">
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              // The label carries `htmlFor`, so the real tap target is the
              // label text, not this 16px box — which is why it passes 2.5.8
              // despite the measurement. The touch-only bump to 20px is for
              // the people who aim at the box anyway.
              // `shrink-0` because this is a flex child next to a long label:
              // without it the box was measuring 13px wide against its
              // declared 16, so the control rendered visibly non-square.
              // The label carries `htmlFor`, so the real tap target is the
              // label text — which is why it passes 2.5.8 despite the size.
              // The touch-only bump to 20px is for people who aim at the box.
              "mt-0.5 h-4 w-4 shrink-0 pointer-coarse:h-5 pointer-coarse:w-5 rounded border-slate-300 text-green-500",
              "focus:ring-2 focus:ring-green-500 focus:ring-offset-0",
              "transition-colors duration-200 cursor-pointer",
              className
            )}
            {...props}
          />
          <label htmlFor={checkboxId} className="text-sm text-slate-700 cursor-pointer leading-relaxed">
            {label}
          </label>
        </div>
        {description && <p className="text-xs text-slate-500 pl-7">{description}</p>}
        {error && <p className="text-xs text-red-600 pl-7">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
