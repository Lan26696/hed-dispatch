"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function UsersPage() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<{
    id: string;
    username: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    roleId: number | null;
    status: number;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const { data, refetch } = api.user.list.useQuery({
    keyword,
    page,
    pageSize: 10,
  });
  const { data: roles } = api.role.all.useQuery();
  const createMutation = api.user.create.useMutation({
    onSuccess: () => {
      void refetch();
      setShowModal(false);
    },
  });
  const updateMutation = api.user.update.useMutation({
    onSuccess: () => {
      void refetch();
      setShowModal(false);
    },
  });
  const deleteMutation = api.user.delete.useMutation({
    onSuccess: () => void refetch(),
  });
  const resetPwdMutation = api.user.resetPassword.useMutation({
    onSuccess: () => setShowPasswordModal(false),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = {
      username: formData.get("username") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      roleId: Number(formData.get("roleId")) || undefined,
      status: Number(formData.get("status")),
    };
    if (editingUser) updateMutation.mutate({ id: editingUser.id, ...values });
    else
      createMutation.mutate({
        ...values,
        password: formData.get("password") as string,
      });
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">用户管理</h1>
          <p className="mt-1 text-slate-500">管理系统用户账号和权限</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40"
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
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          新增用户
        </button>
      </div>

      {/* 搜索筛选 */}
      <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-5">
        <div className="flex flex-wrap gap-4">
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
              placeholder="搜索用户名、姓名、邮箱..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pr-4 pl-12 text-slate-300 transition-all outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
            />
          </div>
          <button className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 font-medium text-slate-400 transition-colors hover:bg-slate-700">
            重置
          </button>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0f172a]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                  用户信息
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                  角色
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                  手机号
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                  状态
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data?.list.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-slate-800/30"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 font-semibold text-white shadow-lg shadow-cyan-500/30">
                        {user.name?.[0] ?? user.username[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">
                          {user.username}
                        </p>
                        <p className="text-sm text-slate-500">
                          {user.email ?? "暂无邮箱"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-sm font-medium text-violet-400">
                      {user.role?.name ?? "未分配"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {user.phone ?? "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${user.status === 1 ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border border-red-500/30 bg-red-500/10 text-red-400"}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${user.status === 1 ? "bg-emerald-400" : "bg-red-400"}`}
                      ></span>
                      {user.status === 1 ? "启用" : "禁用"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowModal(true);
                        }}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-cyan-500/10 hover:text-cyan-400"
                        title="编辑"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setShowPasswordModal(true);
                        }}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-amber-500/10 hover:text-amber-400"
                        title="重置密码"
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
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("确定删除该用户？"))
                            deleteMutation.mutate({ id: user.id });
                        }}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="删除"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 分页 */}
        <div className="flex items-center justify-between border-t border-slate-800/50 bg-slate-800/20 px-6 py-4">
          <p className="text-sm text-slate-500">
            共{" "}
            <span className="font-medium text-slate-300">
              {data?.total ?? 0}
            </span>{" "}
            条记录
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-400 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              上一页
            </button>
            <span className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-white">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(data?.list.length ?? 0) < 10}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-400 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* 新增/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-[#0f172a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/50 p-6">
              <h3 className="text-xl font-bold text-slate-100">
                {editingUser ? "编辑用户" : "新增用户"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    用户名 *
                  </label>
                  <input
                    name="username"
                    defaultValue={editingUser?.username}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      密码 *
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                    />
                  </div>
                )}
                <div className={editingUser ? "col-span-1" : ""}>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    姓名
                  </label>
                  <input
                    name="name"
                    defaultValue={editingUser?.name ?? ""}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    邮箱
                  </label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingUser?.email ?? ""}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    手机号
                  </label>
                  <input
                    name="phone"
                    defaultValue={editingUser?.phone ?? ""}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    角色
                  </label>
                  <select
                    name="roleId"
                    defaultValue={editingUser?.roleId ?? ""}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none focus:border-cyan-500/50"
                  >
                    <option value="">请选择角色</option>
                    {roles?.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    状态
                  </label>
                  <select
                    name="status"
                    defaultValue={editingUser?.status ?? 1}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none focus:border-cyan-500/50"
                  >
                    <option value={1}>启用</option>
                    <option value={0}>禁用</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-700 py-3 font-medium text-slate-400 transition-colors hover:bg-slate-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-medium text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl"
                >
                  确定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 重置密码弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-[#0f172a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/50 p-6">
              <h3 className="text-xl font-bold text-slate-100">重置密码</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                resetPwdMutation.mutate({
                  id: selectedUserId,
                  password: fd.get("password") as string,
                });
              }}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  新密码
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="请输入新密码（至少6位）"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 rounded-xl border border-slate-700 py-3 font-medium text-slate-400 transition-colors hover:bg-slate-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-medium text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl"
                >
                  确定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
