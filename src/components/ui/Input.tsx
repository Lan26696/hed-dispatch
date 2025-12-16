/**
 * 输入框组件
 */

import { type InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-300">
            {label}
            {props.required && <span className="text-red-400"> *</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none placeholder:text-slate-500 focus:border-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50 ${icon ? "pl-12" : ""} ${error ? "border-red-500/50" : ""} ${className} `}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
