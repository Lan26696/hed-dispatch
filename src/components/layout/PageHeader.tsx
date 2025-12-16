/**
 * 页面头部组件
 */

import { type ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  extra?: ReactNode;
}

export function PageHeader({ title, description, extra }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
        {description && <p className="mt-1 text-slate-500">{description}</p>}
      </div>
      {extra}
    </div>
  );
}
