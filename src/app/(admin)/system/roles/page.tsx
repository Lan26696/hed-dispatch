"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

type RoleData = {
  id: number;
  name: string;
  code: string;
  description: string | null;
  dataScope: "all" | "dept" | "self";
  status: number;
};

export default function RolesPage() {
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
  const [selectedPermIds, setSelectedPermIds] = useState<number[]>([]);
  const [dataScope, setDataScope] = useState<"all" | "dept" | "self">("self");
  const [activeTab, setActiveTab] = useState<"menu" | "permission">(
    "permission",
  );

  const { data: roles, refetch } = api.role.list.useQuery();
  const { data: allMenus } = api.menu.all.useQuery();
  const { data: permissionGroups } = api.permission.list.useQuery();
  const { data: roleMenuIds } = api.role.getMenuIds.useQuery(
    { roleId: selectedRole?.id ?? 0 },
    { enabled: !!selectedRole },
  );
  const { data: rolePermIds } = api.permission.getRolePermissions.useQuery(
    { roleId: selectedRole?.id ?? 0 },
    { enabled: !!selectedRole },
  );

  const createMutation = api.role.create.useMutation({
    onSuccess: () => {
      void refetch();
      setShowModal(false);
    },
  });
  const updateMutation = api.role.update.useMutation({
    onSuccess: () => {
      void refetch();
      setShowModal(false);
    },
  });
  const deleteMutation = api.role.delete.useMutation({
    onSuccess: () => void refetch(),
  });
  const assignMenusMutation = api.role.assignMenus.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });
  const updatePermsMutation = api.permission.updateRolePermissions.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });
  const updateDataScopeMutation =
    api.permission.updateRoleDataScope.useMutation({
      onSuccess: () => {
        void refetch();
      },
    });

  useEffect(() => {
    if (roleMenuIds) setSelectedMenuIds(roleMenuIds);
  }, [roleMenuIds]);
  useEffect(() => {
    if (rolePermIds) setSelectedPermIds(rolePermIds);
  }, [rolePermIds]);
  useEffect(() => {
    if (selectedRole) setDataScope(selectedRole.dataScope);
  }, [selectedRole]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      description: formData.get("description") as string,
      status: Number(formData.get("status")),
    };
    if (editingRole) updateMutation.mutate({ id: editingRole.id, ...values });
    else createMutation.mutate(values);
  };

  const openPermModal = (role: RoleData) => {
    setSelectedRole(role);
    setShowPermModal(true);
    setActiveTab("permission");
  };
  const toggleMenu = (menuId: number) =>
    setSelectedMenuIds((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
  const togglePerm = (permId: number) =>
    setSelectedPermIds((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId],
    );
  const toggleResourceAll = (permIds: number[]) => {
    const allSelected = permIds.every((id) => selectedPermIds.includes(id));
    if (allSelected)
      setSelectedPermIds((prev) => prev.filter((id) => !permIds.includes(id)));
    else setSelectedPermIds((prev) => [...new Set([...prev, ...permIds])]);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    await assignMenusMutation.mutateAsync({
      roleId: selectedRole.id,
      menuIds: selectedMenuIds,
    });
    await updatePermsMutation.mutateAsync({
      roleId: selectedRole.id,
      permissionIds: selectedPermIds,
    });
    await updateDataScopeMutation.mutateAsync({
      roleId: selectedRole.id,
      dataScope,
    });
    setShowPermModal(false);
    alert("权限保存成功");
  };

  const dataScopeLabels = {
    all: "全部数据",
    dept: "本部门数据",
    self: "仅本人数据",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">角色管理</h1>
          <p className="mt-1 text-slate-500">管理系统角色和权限分配</p>
        </div>
        <button
          onClick={() => {
            setEditingRole(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-cyan-500/30"
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
          新增角色
        </button>
      </div>

      {/* 角色卡片 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles?.map((role) => (
          <div
            key={role.id}
            className="group overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0f172a] transition-all hover:border-slate-600"
          >
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                  <svg
                    className="h-7 w-7 text-white"
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
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${role.status === 1 ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border border-red-500/30 bg-red-500/10 text-red-400"}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${role.status === 1 ? "bg-emerald-400" : "bg-red-400"}`}
                  ></span>
                  {role.status === 1 ? "启用" : "禁用"}
                </span>
              </div>
              <h3 className="mb-1 text-xl font-bold text-slate-100">
                {role.name}
              </h3>
              <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                {role.description ?? "暂无描述"}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-slate-400">
                  {role.code}
                </span>
                <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-cyan-400">
                  {dataScopeLabels[role.dataScope] ?? "仅本人"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-700/50 bg-slate-800/30 px-6 py-4">
              <button
                onClick={() => {
                  setEditingRole(role as RoleData);
                  setShowModal(true);
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10"
              >
                编辑
              </button>
              <button
                onClick={() => openPermModal(role as RoleData)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-violet-400 hover:bg-violet-500/10"
              >
                权限
              </button>
              {role.code !== "admin" && (
                <button
                  onClick={() => {
                    if (confirm("确定删除该角色？"))
                      deleteMutation.mutate({ id: role.id });
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  删除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 新增/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-[#0f172a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/50 p-6">
              <h3 className="text-xl font-bold text-slate-100">
                {editingRole ? "编辑角色" : "新增角色"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
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
                    角色名称 *
                  </label>
                  <input
                    name="name"
                    defaultValue={editingRole?.name}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    角色编码 *
                  </label>
                  <input
                    name="code"
                    defaultValue={editingRole?.code}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  描述
                </label>
                <textarea
                  name="description"
                  defaultValue={editingRole?.description ?? ""}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  状态
                </label>
                <select
                  name="status"
                  defaultValue={editingRole?.status ?? 1}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 outline-none focus:border-cyan-500/50"
                >
                  <option value={1}>启用</option>
                  <option value={0}>禁用</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-700 py-3 font-medium text-slate-400 hover:bg-slate-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-medium text-white shadow-lg"
                >
                  确定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 权限分配弹窗 */}
      {showPermModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-700/50 bg-[#0f172a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/50 p-6">
              <div>
                <h3 className="text-xl font-bold text-slate-100">
                  权限配置 - {selectedRole.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  配置角色的操作权限和数据范围
                </p>
              </div>
              <button
                onClick={() => setShowPermModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
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

            {/* Tab 切换 */}
            <div className="flex border-b border-slate-700/50 px-6">
              <button
                onClick={() => setActiveTab("permission")}
                className={`px-4 py-3 text-sm font-medium transition ${activeTab === "permission" ? "border-b-2 border-cyan-500 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
              >
                操作权限
              </button>
              <button
                onClick={() => setActiveTab("menu")}
                className={`px-4 py-3 text-sm font-medium transition ${activeTab === "menu" ? "border-b-2 border-cyan-500 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
              >
                菜单权限
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-6">
              {/* 数据范围 */}
              <div className="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
                <label className="mb-3 block text-sm font-medium text-slate-300">
                  数据范围
                </label>
                <div className="flex gap-4">
                  {(["all", "dept", "self"] as const).map((scope) => (
                    <label
                      key={scope}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="dataScope"
                        checked={dataScope === scope}
                        onChange={() => setDataScope(scope)}
                        className="h-4 w-4 text-cyan-500 accent-cyan-500"
                      />
                      <span className="text-sm text-slate-400">
                        {dataScopeLabels[scope]}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {dataScope === "all" && "可查看系统中所有数据"}
                  {dataScope === "dept" && "只能查看本部门的数据"}
                  {dataScope === "self" && "只能查看自己创建的数据"}
                </p>
              </div>

              {activeTab === "permission" && (
                <div className="space-y-6">
                  {permissionGroups?.map((group) => (
                    <div
                      key={group.name}
                      className="overflow-hidden rounded-xl border border-slate-700/50"
                    >
                      <div className="bg-slate-800/50 px-4 py-3 font-medium text-slate-300">
                        {group.name}
                      </div>
                      <div className="divide-y divide-slate-800/50">
                        {group.resources.map((resource) => {
                          const permIds = resource.permissions.map((p) => p.id);
                          const allSelected =
                            permIds.length > 0 &&
                            permIds.every((id) => selectedPermIds.includes(id));
                          return (
                            <div
                              key={resource.key}
                              className="flex items-center gap-4 px-4 py-3"
                            >
                              <div className="w-24 shrink-0">
                                <label className="flex cursor-pointer items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={() => toggleResourceAll(permIds)}
                                    className="h-4 w-4 rounded text-cyan-500 accent-cyan-500"
                                  />
                                  <span className="text-sm font-medium text-slate-300">
                                    {resource.label}
                                  </span>
                                </label>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {resource.permissions.map((perm) => (
                                  <label
                                    key={perm.id}
                                    className="flex cursor-pointer items-center gap-1.5"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedPermIds.includes(
                                        perm.id,
                                      )}
                                      onChange={() => togglePerm(perm.id)}
                                      className="h-4 w-4 rounded text-cyan-500 accent-cyan-500"
                                    />
                                    <span className="text-sm text-slate-400">
                                      {perm.actionLabel}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "menu" && (
                <div className="space-y-2">
                  {allMenus
                    ?.filter((m) => m.parentId === 0)
                    .map((parent) => (
                      <div
                        key={parent.id}
                        className="overflow-hidden rounded-xl border border-slate-700/50"
                      >
                        <label className="flex cursor-pointer items-center gap-3 bg-slate-800/50 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedMenuIds.includes(parent.id)}
                            onChange={() => toggleMenu(parent.id)}
                            className="h-4 w-4 rounded text-cyan-500 accent-cyan-500"
                          />
                          <span className="font-medium text-slate-300">
                            {parent.name}
                          </span>
                        </label>
                        <div className="divide-y divide-slate-800/50">
                          {allMenus
                            ?.filter((m) => m.parentId === parent.id)
                            .map((child) => (
                              <label
                                key={child.id}
                                className="flex cursor-pointer items-center gap-3 px-4 py-3 pl-10"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedMenuIds.includes(child.id)}
                                  onChange={() => toggleMenu(child.id)}
                                  className="h-4 w-4 rounded text-cyan-500 accent-cyan-500"
                                />
                                <span className="text-sm text-slate-400">
                                  {child.name}
                                </span>
                              </label>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-700/50 p-6">
              <button
                onClick={() => setShowPermModal(false)}
                className="flex-1 rounded-xl border border-slate-700 py-3 font-medium text-slate-400 hover:bg-slate-800"
              >
                取消
              </button>
              <button
                onClick={handleSavePermissions}
                className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-medium text-white shadow-lg"
              >
                保存权限
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
