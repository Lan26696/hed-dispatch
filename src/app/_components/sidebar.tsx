"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { api } from "~/trpc/react";

interface MenuItem {
  id: number;
  name: string;
  path: string | null;
  icon: string | null;
  type: number;
  children?: MenuItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: menus = [], isLoading } = api.menu.getUserMenus.useQuery();

  const getIcon = (iconName: string | null) => {
    const icons: Record<string, React.ReactNode> = {
      home: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      settings: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      users: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      shield: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      menu: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      ),
      message: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
      template: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      record: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    };
    return (
      icons[iconName ?? ""] ?? (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )
    );
  };

  const renderMenuItem = (menu: MenuItem, level = 0) => {
    const isActive = pathname === menu.path;
    const hasChildren = menu.children && menu.children.length > 0;

    if (hasChildren) {
      return (
        <li key={menu.id} className="space-y-1">
          <div
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-500 ${level > 0 ? "pl-12" : ""}`}
          >
            {getIcon(menu.icon)}
            <span>{menu.name}</span>
          </div>
          <ul className="space-y-1">
            {menu.children!.map((child) => renderMenuItem(child, level + 1))}
          </ul>
        </li>
      );
    }

    return (
      <li key={menu.id}>
        <Link
          href={menu.path ?? "/"}
          className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${level > 0 ? "pl-12" : ""} ${isActive ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20" : "text-slate-400 hover:bg-white/5 hover:text-cyan-400"}`}
        >
          {getIcon(menu.icon)}
          <span>{menu.name}</span>
        </Link>
      </li>
    );
  };

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-[#0a0f1a]">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2 shadow-lg shadow-cyan-500/20">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="brightness-0 invert"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">恒德新能源</h1>
            <p className="text-xs text-cyan-400/60">智能调度仿真平台</p>
          </div>
        </div>
      </div>

      {/* 菜单 */}
      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <svg
              className="h-6 w-6 animate-spin text-cyan-500"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : (
          <ul className="space-y-1">
            {menus.map((menu) => renderMenuItem(menu as MenuItem))}
          </ul>
        )}
      </nav>

      {/* 底部 */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-medium text-white">
            v
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500">版本</p>
            <p className="text-sm font-medium text-slate-300">1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
