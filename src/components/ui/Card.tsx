/**
 * 卡片组件
 */

import { type ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  title?: string;
  extra?: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({
  children,
  title,
  extra,
  className = "",
  padding = true,
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-700/50 bg-[#0f172a] ${className}`}
    >
      {(title || extra) && (
        <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
          {title && (
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          )}
          {extra}
        </div>
      )}
      <div className={padding ? "p-6" : ""}>{children}</div>
    </div>
  );
}
