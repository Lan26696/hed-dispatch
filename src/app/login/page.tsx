"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("用户名或密码错误");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* 左侧品牌区 */}
      <div className="relative hidden overflow-hidden bg-[#0a0f1a] lg:flex lg:w-[45%]">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-600/10 to-violet-600/10" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col items-center justify-center p-12 text-white">
          <div className="mb-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 backdrop-blur-sm">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="brightness-0 invert"
            />
          </div>
          <h1 className="mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-center text-3xl font-bold text-transparent">
            恒德新能源
          </h1>
          <p className="max-w-sm text-center text-lg text-slate-400">
            智能调度仿真平台
          </p>

          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
              <div className="text-3xl font-bold text-cyan-400">99.9%</div>
              <div className="mt-1 text-sm text-slate-500">系统稳定性</div>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
              <div className="text-3xl font-bold text-blue-400">24/7</div>
              <div className="mt-1 text-sm text-slate-500">全天候服务</div>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
              <div className="text-3xl font-bold text-violet-400">100+</div>
              <div className="mt-1 text-sm text-slate-500">功能模块</div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧登录区 */}
      <div className="flex flex-1 items-center justify-center bg-[#0f172a] p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="mx-auto"
            />
          </div>

          <div className="rounded-3xl border border-slate-700/50 bg-[#0a0f1a] p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-100">欢迎登录</h2>
              <p className="mt-2 text-slate-500">请输入您的账号信息</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                  <svg
                    className="h-5 w-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  用户名
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg
                      className="h-5 w-5 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="请输入用户名"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pr-4 pl-12 text-slate-200 transition-all outline-none placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  密码
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg
                      className="h-5 w-5 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="请输入密码"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pr-4 pl-12 text-slate-200 transition-all outline-none placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/40 disabled:from-cyan-600 disabled:to-blue-700 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
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
                    登录中...
                  </>
                ) : (
                  "登 录"
                )}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            © 2025 恒德新能源. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
