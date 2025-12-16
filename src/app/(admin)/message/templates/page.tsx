"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

interface TemplateVariable {
  key: string;
  label: string;
}

export default function SmsTemplatesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    content: "",
    description: "",
  });
  const [variables, setVariables] = useState<TemplateVariable[]>([]);

  const utils = api.useUtils();
  const { data: templates, isLoading } = api.smsTemplate.list.useQuery();
  const { data: variableLabels } = api.smsTemplate.getVariableLabels.useQuery();

  const createMutation = api.smsTemplate.create.useMutation({
    onSuccess: () => {
      void utils.smsTemplate.list.invalidate();
      setShowModal(false);
      resetForm();
    },
  });

  const updateMutation = api.smsTemplate.update.useMutation({
    onSuccess: () => {
      void utils.smsTemplate.list.invalidate();
      setShowModal(false);
      resetForm();
    },
  });

  const deleteMutation = api.smsTemplate.delete.useMutation({
    onSuccess: () => {
      void utils.smsTemplate.list.invalidate();
    },
  });

  const extractVariablesFromContent = (content: string): TemplateVariable[] => {
    const matches = content.match(/\{(\w+)\}/g);
    if (!matches) return [];
    const keys = [...new Set(matches.map((m) => m.slice(1, -1)))];
    return keys.map((key) => ({ key, label: variableLabels?.[key] ?? key }));
  };

  useEffect(() => {
    if (formData.content) {
      const extracted = extractVariablesFromContent(formData.content);
      setVariables((prev) =>
        extracted.map((v) => prev.find((p) => p.key === v.key) ?? v),
      );
    } else {
      setVariables([]);
    }
  }, [formData.content, variableLabels]);

  const resetForm = () => {
    setFormData({ name: "", code: "", content: "", description: "" });
    setVariables([]);
    setEditingId(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (template: NonNullable<typeof templates>[0]) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      code: template.code,
      content: template.content,
      description: template.description ?? "",
    });
    if (template.variables) {
      if (typeof template.variables[0] === "string") {
        setVariables(
          (template.variables as unknown as string[]).map((key) => ({
            key,
            label: variableLabels?.[key] ?? key,
          })),
        );
      } else {
        setVariables(template.variables as TemplateVariable[]);
      }
    }
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此模板吗？")) deleteMutation.mutate({ id });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code || !formData.content) {
      alert("请填写完整信息");
      return;
    }
    const data = { ...formData, variables };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const updateVariableLabel = (key: string, label: string) => {
    setVariables((prev) =>
      prev.map((v) => (v.key === key ? { ...v, label } : v)),
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
      case "inactive":
        return "bg-red-500/10 text-red-400 border border-red-500/30";
      case "pending":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "已启用";
      case "inactive":
        return "已禁用";
      case "pending":
        return "待审核";
      default:
        return status;
    }
  };

  const renderContent = (content: string) => {
    return content.replace(
      /\{(\w+)\}/g,
      '<span class="inline-flex items-center rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 px-2 py-0.5 text-xs font-medium text-white">$1</span>',
    );
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">短信模板管理</h1>
          <p className="mt-1 text-sm text-slate-500">
            管理短信通知模板，使用亿美软通短信服务
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/40"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          新建模板
        </button>
      </div>

      {/* 提示卡片 */}
      <div className="flex items-center gap-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-500/20">
          <svg
            className="h-7 w-7 text-cyan-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <div className="text-lg font-semibold text-slate-100">
            亿美软通短信服务
          </div>
          <div className="mt-1 text-sm text-slate-400">
            当前系统已接入亿美软通短信平台，支持模板短信发送。变量使用{" "}
            <code className="rounded bg-slate-700 px-1.5 py-0.5 text-cyan-400">
              {"{变量名}"}
            </code>{" "}
            格式定义，可设置中文别名。
          </div>
        </div>
      </div>

      {/* 模板列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500"></div>
        </div>
      ) : !templates?.length ? (
        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
            <svg
              className="h-8 w-8 text-slate-500"
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
          <p className="text-slate-500">暂无短信模板</p>
          <button
            onClick={handleAdd}
            className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white"
          >
            创建第一个模板
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group rounded-2xl border border-slate-700/50 bg-[#0f172a] p-6 transition hover:border-slate-600"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">
                    {template.name}
                  </h3>
                  <div className="mt-1 font-mono text-xs text-slate-500">
                    {template.code}
                  </div>
                </div>
                <span
                  className={`rounded-lg px-3 py-1 text-xs font-medium ${getStatusStyle(template.status)}`}
                >
                  {getStatusText(template.status)}
                </span>
              </div>

              <div
                className="mb-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 text-sm leading-relaxed text-slate-400"
                dangerouslySetInnerHTML={{
                  __html: renderContent(template.content),
                }}
              />

              <div className="mb-4">
                <div className="mb-2 text-xs font-medium text-slate-500">
                  模板变量
                </div>
                <div className="flex flex-wrap gap-2">
                  {template.variables?.length ? (
                    template.variables.map((v) => {
                      const key = typeof v === "string" ? v : v.key;
                      const label =
                        typeof v === "string"
                          ? (variableLabels?.[v] ?? v)
                          : v.label;
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-2.5 py-1 text-xs font-medium text-white"
                          title={`变量名: ${key}`}
                        >
                          {label}
                          <span className="opacity-60">({key})</span>
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-500">无变量</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-700/50 pt-4">
                <span className="text-xs text-slate-500">
                  更新于{" "}
                  {new Date(
                    template.updatedAt ?? template.createdAt,
                  ).toLocaleString("zh-CN")}
                </span>
                <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(template)}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 弹窗 */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700/50 bg-[#0f172a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 bg-[#0f172a] px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-100">
                {editingId ? "编辑模板" : "新建模板"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
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

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  模板名称 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 transition outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="例如：调度确认通知"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  模板编码 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 transition outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="例如：DISPATCH_CONFIRM"
                />
                <p className="mt-2 text-xs text-slate-500">
                  用于API调用时标识模板，建议使用大写字母和下划线
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  模板内容 <span className="text-red-400">*</span>
                </label>
                <textarea
                  className="min-h-[120px] w-full resize-y rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm leading-relaxed text-slate-300 transition outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder={`请输入短信内容，变量使用 {变量名} 格式\n例如：尊敬的{driver_name}司机，您的调度单已确认`}
                />
                <p className="mt-2 text-xs text-slate-500">
                  变量格式:{" "}
                  <code className="rounded bg-slate-700 px-1 text-cyan-400">
                    {"{driver_name}"}
                  </code>
                  ,{" "}
                  <code className="rounded bg-slate-700 px-1 text-cyan-400">
                    {"{order_no}"}
                  </code>{" "}
                  等
                </p>
              </div>

              {variables.length > 0 && (
                <div>
                  <label className="mb-3 block text-sm font-medium text-slate-300">
                    变量中文别名
                  </label>
                  <div className="space-y-3 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
                    {variables.map((v) => (
                      <div key={v.key} className="flex items-center gap-3">
                        <span className="w-32 shrink-0 rounded-lg bg-cyan-500/20 px-3 py-2 text-center text-xs font-medium text-cyan-400">
                          {v.key}
                        </span>
                        <svg
                          className="h-4 w-4 shrink-0 text-slate-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                        <input
                          type="text"
                          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                          value={v.label}
                          onChange={(e) =>
                            updateVariableLabel(v.key, e.target.value)
                          }
                          placeholder="输入中文别名"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    设置中文别名后，发送短信时会显示更直观的字段名称
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  模板描述
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 transition outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="简要描述模板用途"
                />
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-700/50 bg-[#0f172a] px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/40 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "保存中..."
                  : editingId
                    ? "保存修改"
                    : "创建模板"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
