/**
 * 下拉选择组件
 */

import { type SelectHTMLAttributes, forwardRef } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-300">
            {label}
            {props.required && <span className="text-red-400"> *</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none focus:border-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-red-500/50" : ""} ${className} `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
