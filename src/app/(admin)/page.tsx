import { auth } from "~/server/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      {/* 欢迎横幅 - 深空蓝渐变 */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-900/30 bg-gradient-to-r from-[#0f172a] via-[#1e3a5f] to-[#0c4a6e] p-8 text-white">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-cyan-400/5 blur-2xl" />
        <div className="relative z-10">
          <h1 className="mb-2 text-3xl font-bold">
            欢迎回来，{session?.user.name ?? session?.user.username} 👋
          </h1>
          <p className="text-lg text-cyan-100/70">
            今天是个好日子，祝您工作顺利！
          </p>
        </div>
      </div>

      {/* 统计卡片 - 暗黑科技风 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-6 shadow-lg shadow-black/20 transition-all hover:border-cyan-800/50 hover:shadow-cyan-900/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-slate-400">总用户数</p>
              <p className="text-3xl font-bold text-white">1,234</p>
              <p className="mt-2 flex items-center gap-1 text-sm text-emerald-400">
                ↑ +12.5%
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              <svg
                className="h-7 w-7"
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
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-6 shadow-lg shadow-black/20 transition-all hover:border-blue-800/50 hover:shadow-blue-900/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-slate-400">今日访问</p>
              <p className="text-3xl font-bold text-white">856</p>
              <p className="mt-2 flex items-center gap-1 text-sm text-emerald-400">
                ↑ +8.2%
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-6 shadow-lg shadow-black/20 transition-all hover:border-violet-800/50 hover:shadow-violet-900/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-slate-400">调度单量</p>
              <p className="text-3xl font-bold text-white">432</p>
              <p className="mt-2 flex items-center gap-1 text-sm text-amber-400">
                ↓ -3.1%
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-6 shadow-lg shadow-black/20 transition-all hover:border-emerald-800/50 hover:shadow-emerald-900/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm text-slate-400">系统状态</p>
              <p className="text-3xl font-bold text-emerald-400">正常</p>
              <p className="mt-2 text-sm text-slate-500">运行时间: 99.9%</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷操作 & 最近活动 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] shadow-lg shadow-black/20 lg:col-span-2">
          <div className="border-b border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white">快捷操作</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
            <button className="group flex flex-col items-center gap-3 rounded-2xl border border-transparent bg-slate-800/50 p-4 transition-all hover:border-cyan-500/20 hover:bg-cyan-500/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50 text-cyan-400 shadow-sm group-hover:bg-cyan-500/20">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-cyan-400">
                添加用户
              </span>
            </button>
            <button className="group flex flex-col items-center gap-3 rounded-2xl border border-transparent bg-slate-800/50 p-4 transition-all hover:border-blue-500/20 hover:bg-blue-500/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50 text-blue-400 shadow-sm group-hover:bg-blue-500/20">
                <svg
                  className="h-6 w-6"
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
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-blue-400">
                新建调度
              </span>
            </button>
            <button className="group flex flex-col items-center gap-3 rounded-2xl border border-transparent bg-slate-800/50 p-4 transition-all hover:border-violet-500/20 hover:bg-violet-500/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50 text-violet-400 shadow-sm group-hover:bg-violet-500/20">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-violet-400">
                数据报表
              </span>
            </button>
            <button className="group flex flex-col items-center gap-3 rounded-2xl border border-transparent bg-slate-800/50 p-4 transition-all hover:border-amber-500/20 hover:bg-amber-500/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50 text-amber-400 shadow-sm group-hover:bg-amber-500/20">
                <svg
                  className="h-6 w-6"
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
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-amber-400">
                系统设置
              </span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] shadow-lg shadow-black/20">
          <div className="border-b border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white">最近活动</h3>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20"></div>
              <div>
                <p className="text-sm text-slate-300">用户 admin 登录系统</p>
                <p className="mt-0.5 text-xs text-slate-500">刚刚</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20"></div>
              <div>
                <p className="text-sm text-slate-300">新增用户 test001</p>
                <p className="mt-0.5 text-xs text-slate-500">5 分钟前</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-amber-400 ring-4 ring-amber-400/20"></div>
              <div>
                <p className="text-sm text-slate-300">修改系统配置</p>
                <p className="mt-0.5 text-xs text-slate-500">1 小时前</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-violet-400 ring-4 ring-violet-400/20"></div>
              <div>
                <p className="text-sm text-slate-300">数据备份完成</p>
                <p className="mt-0.5 text-xs text-slate-500">2 小时前</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
