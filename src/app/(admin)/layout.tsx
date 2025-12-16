import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "~/server/auth";
import { Sidebar } from "~/app/_components/sidebar";
import { TRPCReactProvider } from "~/trpc/react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <TRPCReactProvider>
      <div className="flex min-h-screen bg-[#0a0f1a]">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          {/* 顶部导航 */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-800/50 bg-[#0f172a]/90 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <nav className="hidden items-center gap-2 text-sm sm:flex">
                <Link href="/" className="text-slate-400 hover:text-cyan-400">
                  首页
                </Link>
                <span className="text-slate-600">/</span>
                <span className="font-medium text-slate-200">工作台</span>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* 搜索 */}
              <div className="hidden items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2 md:flex">
                <svg
                  className="h-4 w-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="搜索..."
                  className="w-40 bg-transparent text-sm text-slate-300 outline-none placeholder:text-slate-500"
                />
              </div>

              {/* 通知 */}
              <button className="relative rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-cyan-400">
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-500 ring-2 ring-[#0f172a]"></span>
              </button>

              {/* 用户 */}
              <div className="flex items-center gap-3 border-l border-slate-700/50 pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-medium text-white shadow-lg shadow-cyan-500/30">
                  {(session.user.name ??
                    session.user.username)?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-200">
                    {session.user.name ?? session.user.username}
                  </p>
                  <p className="text-xs text-slate-500">管理员</p>
                </div>
                <Link
                  href="/api/auth/signout"
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  title="退出登录"
                >
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </header>

          {/* 内容区 */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </TRPCReactProvider>
  );
}
