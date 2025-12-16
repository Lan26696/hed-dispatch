/**
 * 搜索栏组件
 */

import { type ReactNode } from "react";

export interface SearchBarProps {
  children: ReactNode;
  onReset?: () => void;
}

export function SearchBar({ children, onReset }: SearchBarProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-5">
      <div className="flex flex-wrap items-end gap-4">
        {children}
        {onReset && (
          <button
            onClick={onReset}
            className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 font-medium text-slate-400 transition-colors hover:bg-slate-700"
          >
            重置
          </button>
        )}
      </div>
    </div>
  );
}

// 搜索输入框
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "搜索...",
}: SearchInputProps) {
  return (
    <div className="relative min-w-[240px] flex-1">
      <svg
        className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pr-4 pl-12 text-slate-300 transition-all outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
      />
    </div>
  );
}
