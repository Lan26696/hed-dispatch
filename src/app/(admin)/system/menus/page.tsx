"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

const iconOptions = ["home", "settings", "users", "shield", "menu"];

type MenuData = {
  id: number;
  parentId: number | null;
  name: string;
  path: string | null;
  icon: string | null;
  type: number;
  sort: number;
  status?: number;
  visible?: number;
  children?: MenuData[];
};

export default function MenusPage() {
  const [editingMenu, setEditingMenu] = useState<MenuData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [parentId, setParentId] = useState(0);

  const { data: menus, refetch } = api.menu.list.useQuery();
  const { data: allMenus } = api.menu.all.useQuery();
  const createMutation = api.menu.create.useMutation({
    onSuccess: () => {
      void refetch();
      setShowModal(false);
    },
  });
  const updateMutation = api.menu.update.useMutation({
    onSuccess: () => {
      void refetch();
      setShowModal(false);
    },
  });
  const deleteMutation = api.menu.delete.useMutation({
    onSuccess: () => void refetch(),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = {
      parentId: Number(formData.get("parentId")),
      name: formData.get("name") as string,
      path: formData.get("path") as string,
      icon: formData.get("icon") as string,
      type: Number(formData.get("type")),
      sort: Number(formData.get("sort")),
      status: Number(formData.get("status")),
      visible: Number(formData.get("visible")),
    };
    if (editingMenu) updateMutation.mutate({ id: editingMenu.id, ...values });
    else createMutation.mutate(values);
  };

  const renderMenuRow = (menu: MenuData, level = 0): React.ReactElement[] => {
    const rows = [
      <tr
        key={menu.id}
        className={`transition-colors hover:bg-slate-800/30 ${level > 0 ? "bg-slate-800/10" : ""}`}
      >
        <td className="px-6 py-4">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: level * 28 }}
          >
            {level > 0 && <span className="text-lg text-slate-600">└</span>}
            <span className="font-medium text-slate-200">{menu.name}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className="text-slate-500">{menu.icon ?? "-"}</span>
        </td>
        <td className="px-6 py-4">
          {menu.path ? (
            <code className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-sm text-cyan-400">
              {menu.path}
            </code>
          ) : (
            <span className="text-slate-600">-</span>
          )}
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium ${menu.type === 1 ? "border border-blue-500/30 bg-blue-500/10 text-blue-400" : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"}`}
          >
            {menu.type === 1 ? "目录" : "菜单"}
          </span>
        </td>
        <td className="px-6 py-4 text-slate-400">{menu.sort}</td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${menu.status === 1 ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border border-red-500/30 bg-red-500/10 text-red-400"}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${menu.status === 1 ? "bg-emerald-400" : "bg-red-400"}`}
            ></span>
            {menu.status === 1 ? "启用" : "禁用"}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-1">
            {menu.type === 1 && (
              <button
                onClick={() => {
                  setParentId(menu.id);
                  setEditingMenu(null);
                  setShowModal(true);
                }}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
                title="添加子菜单"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={() => {
                setEditingMenu(menu);
                setParentId(menu.parentId ?? 0);
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
                if (confirm("确定删除该菜单？"))
                  deleteMutation.mutate({ id: menu.id });
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
      </tr>,
    ];
    if (menu.children?.length)
      menu.children.forEach((child) =>
        rows.push(...renderMenuRow(child, level + 1)),
      );
    return rows;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">菜单管理</h1>
          <p className="mt-1 text-slate-500">管理系统菜单和导航结构</p>
        </div>
        <button
          onClick={() => {
            setEditingMenu(null);
            setParentId(0);
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
          新增菜单
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0f172a]">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                菜单名称
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                图标
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                路径
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                类型
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                排序
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
            {menus?.map((menu) => renderMenuRow(menu))}
          </tbody>
        </table>
      </div>

      {/* 新增/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-[#0f172a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/50 p-6">
              <h3 className="text-xl font-bold text-slate-100">
                {editingMenu ? "编辑菜单" : "新增菜单"}
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
                    父级菜单
                  </label>
                  <select
                    name="parentId"
                    defaultValue={editingMenu?.parentId ?? parentId}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none focus:border-cyan-500/50"
                  >
                    <option value={0}>顶级菜单</option>
                    {allMenus
                      ?.filter((m) => m.type === 1)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    菜单名称 *
                  </label>
                  <input
                    name="name"
                    defaultValue={editingMenu?.name}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    路由路径
                  </label>
                  <input
                    name="path"
                    defaultValue={editingMenu?.path ?? ""}
                    placeholder="/system/users"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    图标
                  </label>
                  <select
                    name="icon"
                    defaultValue={editingMenu?.icon ?? ""}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none focus:border-cyan-500/50"
                  >
                    <option value="">无</option>
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    类型
                  </label>
                  <select
                    name="type"
                    defaultValue={editingMenu?.type ?? 2}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none focus:border-cyan-500/50"
                  >
                    <option value={1}>目录</option>
                    <option value={2}>菜单</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    排序
                  </label>
                  <input
                    name="sort"
                    type="number"
                    defaultValue={editingMenu?.sort ?? 0}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    状态
                  </label>
                  <select
                    name="status"
                    defaultValue={editingMenu?.status ?? 1}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none focus:border-cyan-500/50"
                  >
                    <option value={1}>启用</option>
                    <option value={0}>禁用</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    显示
                  </label>
                  <select
                    name="visible"
                    defaultValue={editingMenu?.visible ?? 1}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 transition-all outline-none focus:border-cyan-500/50"
                  >
                    <option value={1}>显示</option>
                    <option value={0}>隐藏</option>
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
    </div>
  );
}
