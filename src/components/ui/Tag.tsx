/**
 * 标签组件
 */

import { type ReactNode } from "react";

export interface TagProps {
  children: ReactNode;
  color?: "default" | "success" | "warning" | "error" | "info" | "violet";
  dot?: boolean;
}

const colorStyles = {
  default: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-400",
};

const dotColors = {
  default: "bg-slate-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-red-400",
  info: "bg-cyan-400",
  violet: "bg-violet-400",
};

export function Tag({ children, color = "default", dot = false }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${colorStyles[color]}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[color]}`} />
      )}
      {children}
    </span>
  );
}
