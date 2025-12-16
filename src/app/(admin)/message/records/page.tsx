"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

type SmsRecord = {
  id: string;
  mobile: string;
  content: string;
  templateName: string | null;
  templateCode: string | null;
  status: "pending" | "success" | "failed";
  errorMsg: string | null;
  variables: Record<string, string> | null;
  createdAt: Date;
  sentAt: Date | null;
};

export default function SmsRecordsPage() {
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SmsRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchMobile, setSearchMobile] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [sendForm, setSendForm] = useState({
    templateId: "",
    mobile: "",
    variables: {} as Record<string, string>,
  });

  const utils = api.useUtils();

  const {
    data: records = [],
    isLoading,
    error,
  } = api.smsRecord.list.useQuery(undefined, { retry: false });

  const { data: templates = [] } = api.smsTemplate.list.useQuery();
  const { data: stats } = api.smsRecord.stats.useQuery(undefined, {
    retry: false,
  });

  const sendMutation = api.smsRecord.send.useMutation({
    onSuccess: () => {
      void utils.smsRecord.list.invalidate();
      void utils.smsRecord.stats.invalidate();
      setShowSendModal(false);
      setSendForm({ templateId: "", mobile: "", variables: {} });
      alert("发送成功");
    },
    onError: (error) => {
      alert(error.message || "发送失败");
    },
  });

  const resendMutation = api.smsRecord.resend.useMutation({
    onSuccess: () => {
      void utils.smsRecord.list.invalidate();
      void utils.smsRecord.stats.invalidate();
      alert("重发成功");
    },
    onError: (error) => {
      alert(error.message || "重发失败");
    },
  });

  const selectedTemplate = templates.find((t) => t.id === sendForm.templateId);

  const normalizedVariables =
    selectedTemplate?.variables?.map((v) => {
      if (typeof v === "string") {
        return { key: v, label: v };
      }
      return v as { key: string; label: string };
    }) ?? [];

  const previewContent = () => {
    if (!selectedTemplate) return "";
    let content = selectedTemplate.content;
    for (const [key, value] of Object.entries(sendForm.variables)) {
      content = content.replace(
        new RegExp(`\\{${key}\\}`, "g"),
        value || `{${key}}`,
      );
    }
    return content;
  };

  const handleSend = () => {
    if (!sendForm.templateId || !sendForm.mobile) {
      alert("请选择模板并填写手机号");
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(sendForm.mobile)) {
      alert("手机号格式不正确");
      return;
    }
    sendMutation.mutate({
      templateId: sendForm.templateId,
      mobile: sendForm.mobile,
      variables: sendForm.variables,
    });
  };

  const handleViewDetail = (record: SmsRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "success":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
      case "failed":
        return "bg-red-500/10 text-red-400 border border-red-500/30";
      case "pending":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "发送成功";
      case "failed":
        return "发送失败";
      case "pending":
        return "发送中";
      default:
        return status;
    }
  };

  const filteredRecords = records.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchMobile && !r.mobile.includes(searchMobile)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleFilterChange = (newFilter: string) => {
    setStatusFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchMobile(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">发送记录</h1>
          <p className="mt-1 text-sm text-slate-500">查看短信发送历史记录</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSendModal(true)}
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            发送短信
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
              <svg
                className="h-6 w-6 text-slate-400"
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
            </div>
            <div>
              <div className="text-sm text-slate-500">今日发送</div>
              <div className="text-2xl font-bold text-slate-100">
                {stats?.total ?? 0}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <svg
                className="h-6 w-6 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm text-emerald-400/70">发送成功</div>
              <div className="text-2xl font-bold text-emerald-400">
                {stats?.success ?? 0}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
              <svg
                className="h-6 w-6 text-red-400"
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
            </div>
            <div>
              <div className="text-sm text-red-400/70">发送失败</div>
              <div className="text-2xl font-bold text-red-400">
                {stats?.failed ?? 0}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
              <svg
                className="h-6 w-6 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm text-amber-400/70">发送中</div>
              <div className="text-2xl font-bold text-amber-400">
                {stats?.pending ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-700/50 bg-[#0f172a] p-4">
        <select
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-300 transition outline-none focus:border-cyan-500/50"
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="all">全部状态</option>
          <option value="success">发送成功</option>
          <option value="failed">发送失败</option>
          <option value="pending">发送中</option>
        </select>
        <div className="relative flex-1">
          <svg
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500"
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
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pr-4 pl-10 text-sm text-slate-300 transition outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
            placeholder="搜索手机号..."
            value={searchMobile}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* 记录列表 */}
      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0f172a]">
        {/* 表头 */}
        <div className="grid grid-cols-[60px_130px_1fr_120px_100px_160px_100px] gap-4 border-b border-slate-700/50 bg-slate-800/30 px-6 py-4 text-sm font-semibold text-slate-400">
          <span>序号</span>
          <span>手机号</span>
          <span>短信内容</span>
          <span>模板</span>
          <span>状态</span>
          <span>发送时间</span>
          <span>操作</span>
        </div>

        {/* 内容 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500"></div>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-slate-500">加载失败，请刷新重试</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center">
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
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <p className="text-slate-500">暂无发送记录</p>
            <button
              onClick={() => setShowSendModal(true)}
              className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white"
            >
              发送第一条短信
            </button>
          </div>
        ) : (
          <>
            {paginatedRecords.map((record, index) => (
              <div
                key={record.id}
                className="grid grid-cols-[60px_130px_1fr_120px_100px_160px_100px] items-center gap-4 border-b border-slate-800/50 px-6 py-4 text-sm text-slate-400 transition hover:bg-slate-800/30"
              >
                <span className="text-slate-500">
                  {(currentPage - 1) * pageSize + index + 1}
                </span>
                <span className="font-mono font-medium text-slate-200">
                  {record.mobile}
                </span>
                <span
                  className="truncate pr-4 text-slate-400"
                  title={record.content}
                >
                  {record.content}
                </span>
                <span className="text-slate-500">
                  {record.templateName ?? "-"}
                </span>
                <span>
                  <span
                    className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${getStatusStyle(record.status)}`}
                  >
                    {getStatusText(record.status)}
                  </span>
                </span>
                <span className="text-slate-500">
                  {new Date(record.createdAt).toLocaleString("zh-CN")}
                </span>
                <span className="flex gap-2">
                  <button
                    onClick={() => handleViewDetail(record as SmsRecord)}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
                  >
                    详情
                  </button>
                  {record.status === "failed" && (
                    <button
                      onClick={() => resendMutation.mutate({ id: record.id })}
                      disabled={resendMutation.isPending}
                      className="rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400 transition hover:bg-cyan-500/20 disabled:opacity-50"
                    >
                      重发
                    </button>
                  )}
                </span>
              </div>
            ))}

            {/* 分页 */}
            <div className="flex items-center justify-between border-t border-slate-800/50 bg-slate-800/20 px-6 py-4">
              <span className="text-sm text-slate-500">
                共 {filteredRecords.length} 条记录，第 {currentPage}/
                {totalPages || 1} 页
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-400 transition hover:bg-slate-700 disabled:opacity-50"
                >
                  上一页
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        currentPage === pageNum
                          ? "bg-cyan-500 text-white"
                          : "border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-400 transition hover:bg-slate-700 disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 发送短信弹窗 */}
      {showSendModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowSendModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-[#0f172a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-100">发送短信</h2>
              <button
                onClick={() => setShowSendModal(false)}
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

            <div className="max-h-[60vh] space-y-5 overflow-y-auto p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  选择模板
                </label>
                <select
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 transition outline-none focus:border-cyan-500/50"
                  value={sendForm.templateId}
                  onChange={(e) =>
                    setSendForm({
                      ...sendForm,
                      templateId: e.target.value,
                      variables: {},
                    })
                  }
                >
                  <option value="">请选择短信模板</option>
                  {templates
                    .filter((t) => t.status === "active")
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>

              {selectedTemplate && (
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
                  <div className="mb-2 text-xs font-medium text-slate-500">
                    模板内容预览
                  </div>
                  <div className="text-sm leading-relaxed text-slate-300">
                    {previewContent()}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  接收手机号
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 transition outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                  placeholder="请输入手机号"
                  value={sendForm.mobile}
                  onChange={(e) =>
                    setSendForm({ ...sendForm, mobile: e.target.value })
                  }
                />
              </div>

              {normalizedVariables.length > 0 && (
                <div className="space-y-4">
                  <div className="text-sm font-medium text-slate-300">
                    模板变量
                  </div>
                  {normalizedVariables.map((v) => (
                    <div key={v.key}>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-400">
                        {v.label || v.key}
                        <span className="rounded bg-slate-700 px-1.5 py-0.5 text-xs text-slate-500">{`{${v.key}}`}</span>
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 transition outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                        placeholder={`请输入${v.label || v.key}`}
                        value={sendForm.variables[v.key] ?? ""}
                        onChange={(e) =>
                          setSendForm({
                            ...sendForm,
                            variables: {
                              ...sendForm.variables,
                              [v.key]: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-700/50 px-6 py-4">
              <button
                onClick={() => setShowSendModal(false)}
                className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800"
              >
                取消
              </button>
              <button
                onClick={handleSend}
                disabled={
                  sendMutation.isPending ||
                  !sendForm.templateId ||
                  !sendForm.mobile
                }
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/40 disabled:opacity-50"
              >
                {sendMutation.isPending ? "发送中..." : "发送"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {showDetailModal && selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-[#0f172a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-100">发送详情</h2>
              <button
                onClick={() => setShowDetailModal(false)}
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

            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">状态</span>
                <span
                  className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${getStatusStyle(selectedRecord.status)}`}
                >
                  {getStatusText(selectedRecord.status)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">手机号</span>
                <span className="font-mono text-sm font-medium text-slate-200">
                  {selectedRecord.mobile}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">模板</span>
                <span className="text-sm text-slate-300">
                  {selectedRecord.templateName ?? "-"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">创建时间</span>
                <span className="text-sm text-slate-300">
                  {new Date(selectedRecord.createdAt).toLocaleString("zh-CN")}
                </span>
              </div>

              {selectedRecord.sentAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">发送时间</span>
                  <span className="text-sm text-slate-300">
                    {new Date(selectedRecord.sentAt).toLocaleString("zh-CN")}
                  </span>
                </div>
              )}

              <div>
                <span className="mb-2 block text-sm text-slate-500">
                  短信内容
                </span>
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 text-sm leading-relaxed text-slate-300">
                  {selectedRecord.content}
                </div>
              </div>

              {selectedRecord.variables &&
                Object.keys(selectedRecord.variables).length > 0 && (
                  <div>
                    <span className="mb-2 block text-sm text-slate-500">
                      变量值
                    </span>
                    <div className="space-y-2">
                      {Object.entries(selectedRecord.variables).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2"
                          >
                            <span className="text-xs text-slate-500">{`{${key}}`}</span>
                            <span className="text-sm text-slate-300">
                              {value}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {selectedRecord.status === "failed" &&
                selectedRecord.errorMsg && (
                  <div>
                    <span className="mb-2 block text-sm text-slate-500">
                      错误信息
                    </span>
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                      {selectedRecord.errorMsg}
                    </div>
                  </div>
                )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-700/50 px-6 py-4">
              {selectedRecord.status === "failed" && (
                <button
                  onClick={() => {
                    resendMutation.mutate({ id: selectedRecord.id });
                    setShowDetailModal(false);
                  }}
                  className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-600"
                >
                  重新发送
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
