"use client";

import { useState } from "react";

// ============ CNG调度业务Mock数据 ============

// 场站数据 - 基于seed.ts中的场站
const mockStations = [
  {
    id: "ST_YUANJING",
    name: "远景气源站",
    code: "YJ-001",
    type: "mother", // 母站
    typeLabel: "气源母站",
    address: "陕西省榆林市远景工业园",
    capacity: 48000, // 日供气能力 Nm³
    currentPressure: 22.5, // 当前压力 MPa
    currentStock: 35000, // 当前库存 Nm³
    status: "online",
    manager: "张站长",
    phone: "13900001001",
  },
  {
    id: "ST_GAOXIN",
    name: "高新母站",
    code: "GX-001",
    type: "mother",
    typeLabel: "气源母站",
    address: "陕西省西安市高新区66号",
    capacity: 25000,
    currentPressure: 21.8,
    currentStock: 18500,
    status: "online",
    manager: "陈站长",
    phone: "13900001006",
  },
  {
    id: "ST_DANING",
    name: "大宁配送站",
    code: "DN-001",
    type: "distribution", // 配送站
    typeLabel: "配送站",
    address: "陕西省延安市大宁县",
    capacity: 20000,
    currentPressure: 18.2,
    currentStock: 12000,
    status: "online",
    manager: "李站长",
    phone: "13900001002",
  },
  {
    id: "ST_HENGFENG",
    name: "恒丰加气站",
    code: "HF-001",
    type: "filling", // 加气站
    typeLabel: "加气站",
    address: "陕西省西安市高新区",
    capacity: 16000,
    currentPressure: 15.6,
    currentStock: 8500,
    status: "online",
    manager: "王站长",
    phone: "13900001003",
  },
  {
    id: "ST_PENGAO",
    name: "鹏奥储气站",
    code: "PA-001",
    type: "storage", // 储气站
    typeLabel: "储气站",
    address: "陕西省咸阳市经开区",
    capacity: 12000,
    currentPressure: 19.5,
    currentStock: 9800,
    status: "warning", // 库存预警
    manager: "赵站长",
    phone: "13900001004",
  },
  {
    id: "ST_DONGCHENG",
    name: "东城解压站",
    code: "DC-001",
    type: "decompression", // 解压站
    typeLabel: "解压站",
    address: "陕西省西安市东城区",
    capacity: 8000,
    currentPressure: 4.2, // 解压后压力较低
    currentStock: 3200,
    status: "offline", // 维护中
    manager: "刘站长",
    phone: "13900001005",
  },
];

// 槽车/车辆数据
const mockVehicles = [
  {
    id: "V001",
    plateNo: "陕A·G8801",
    capacity: 10000,
    driver: "张伟",
    phone: "13800001001",
    status: "delivering",
  },
  {
    id: "V002",
    plateNo: "陕A·G8802",
    capacity: 10000,
    driver: "李强",
    phone: "13800001002",
    status: "loading",
  },
  {
    id: "V003",
    plateNo: "陕A·G8803",
    capacity: 8000,
    driver: "王磊",
    phone: "13800001003",
    status: "idle",
  },
  {
    id: "V004",
    plateNo: "陕A·G8804",
    capacity: 12000,
    driver: "赵军",
    phone: "13800001004",
    status: "delivering",
  },
  {
    id: "V005",
    plateNo: "陕A·G8805",
    capacity: 10000,
    driver: "刘洋",
    phone: "13800001005",
    status: "maintenance",
  },
];

// 今日统计
const mockStats = {
  todayOrders: 8, // 今日调度单
  pending: 2, // 待执行
  executing: 3, // 执行中（运输途中）
  completed: 3, // 已完成
  totalVolume: 68000, // 今日计划总量 Nm³
  completedVolume: 28500, // 已完成量 Nm³
};

// 上游供气计划（母站出气）
const mockUpstreamPlan = {
  planned: 68000, // 计划供气量 Nm³
  completed: 38500, // 已出站量
  percentage: 57,
  stations: [
    { name: "远景气源站", planned: 45000, completed: 28000 },
    { name: "高新母站", planned: 23000, completed: 10500 },
  ],
};

// 下游配送计划（各站点收气）
const mockDownstreamPlan = {
  planned: 68000,
  delivered: 28500,
  percentage: 42,
  stations: [
    { name: "大宁配送站", planned: 20000, delivered: 10000 },
    { name: "恒丰加气站", planned: 18000, delivered: 8500 },
    { name: "鹏奥储气站", planned: 15000, delivered: 10000 },
    { name: "东城解压站", planned: 15000, delivered: 0 }, // 维护中
  ],
};

// 系统状态
const mockSystemStatus = [
  { name: "调度引擎", status: "running", cpu: 32, memory: 58 },
  { name: "GPS定位服务", status: "running", cpu: 18, memory: 42 },
  { name: "压力监测", status: "running", cpu: 12, memory: 35 },
  { name: "库存预警", status: "warning", cpu: 45, memory: 68 },
];

// 调度单数据
const mockOrders = [
  {
    id: "DD2024121600001",
    fromStation: "远景气源站",
    fromCode: "YJ-001",
    toStation: "大宁配送站",
    toCode: "DN-001",
    vehicle: "陕A·G8801",
    driver: "张伟",
    driverPhone: "13800001001",
    planVolume: 10000, // 计划运量 Nm³
    actualVolume: 9850, // 实际运量
    loadPressure: 22.0, // 装车压力 MPa
    distance: 185, // 运输距离 km
    status: "completed",
    planTime: "06:00",
    loadTime: "06:15", // 装车时间
    departTime: "06:45", // 发车时间
    arriveTime: "09:30", // 到达时间
    unloadTime: "10:00", // 卸车完成
  },
  {
    id: "DD2024121600002",
    fromStation: "远景气源站",
    fromCode: "YJ-001",
    toStation: "恒丰加气站",
    toCode: "HF-001",
    vehicle: "陕A·G8804",
    driver: "赵军",
    driverPhone: "13800001004",
    planVolume: 12000,
    actualVolume: 11800,
    loadPressure: 21.5,
    distance: 320,
    status: "completed",
    planTime: "05:30",
    loadTime: "05:50",
    departTime: "06:20",
    arriveTime: "10:45",
    unloadTime: "11:15",
  },
  {
    id: "DD2024121600003",
    fromStation: "高新母站",
    fromCode: "GX-001",
    toStation: "鹏奥储气站",
    toCode: "PA-001",
    vehicle: "陕A·G8802",
    driver: "李强",
    driverPhone: "13800001002",
    planVolume: 10000,
    actualVolume: 10000,
    loadPressure: 21.8,
    distance: 45,
    status: "completed",
    planTime: "07:00",
    loadTime: "07:20",
    departTime: "07:50",
    arriveTime: "08:45",
    unloadTime: "09:10",
  },
  {
    id: "DD2024121600004",
    fromStation: "远景气源站",
    fromCode: "YJ-001",
    toStation: "大宁配送站",
    toCode: "DN-001",
    vehicle: "陕A·G8801",
    driver: "张伟",
    driverPhone: "13800001001",
    planVolume: 10000,
    actualVolume: null,
    loadPressure: 22.3,
    distance: 185,
    status: "executing",
    planTime: "11:00",
    loadTime: "11:20",
    departTime: "11:50",
    arriveTime: null,
    unloadTime: null,
    currentLocation: "延安市宝塔区", // 当前位置
    progress: 65, // 运输进度 %
  },
  {
    id: "DD2024121600005",
    fromStation: "高新母站",
    fromCode: "GX-001",
    toStation: "恒丰加气站",
    toCode: "HF-001",
    vehicle: "陕A·G8803",
    driver: "王磊",
    driverPhone: "13800001003",
    planVolume: 8000,
    actualVolume: null,
    loadPressure: 21.2,
    distance: 12,
    status: "executing",
    planTime: "13:00",
    loadTime: "13:15",
    departTime: "13:40",
    arriveTime: null,
    unloadTime: null,
    currentLocation: "高新区科技路",
    progress: 80,
  },
  {
    id: "DD2024121600006",
    fromStation: "远景气源站",
    fromCode: "YJ-001",
    toStation: "鹏奥储气站",
    toCode: "PA-001",
    vehicle: "陕A·G8804",
    driver: "赵军",
    driverPhone: "13800001004",
    planVolume: 12000,
    actualVolume: null,
    loadPressure: null,
    distance: 280,
    status: "executing",
    planTime: "12:30",
    loadTime: "12:50",
    departTime: "13:20",
    arriveTime: null,
    unloadTime: null,
    currentLocation: "铜川市耀州区",
    progress: 35,
  },
  {
    id: "DD2024121600007",
    fromStation: "高新母站",
    fromCode: "GX-001",
    toStation: "大宁配送站",
    toCode: "DN-001",
    vehicle: "陕A·G8802",
    driver: "李强",
    driverPhone: "13800001002",
    planVolume: 10000,
    actualVolume: null,
    loadPressure: null,
    distance: 295,
    status: "pending",
    planTime: "15:00",
    loadTime: null,
    departTime: null,
    arriveTime: null,
    unloadTime: null,
  },
  {
    id: "DD2024121600008",
    fromStation: "远景气源站",
    fromCode: "YJ-001",
    toStation: "恒丰加气站",
    toCode: "HF-001",
    vehicle: "陕A·G8803",
    driver: "王磊",
    driverPhone: "13800001003",
    planVolume: 8000,
    actualVolume: null,
    loadPressure: null,
    distance: 320,
    status: "pending",
    planTime: "16:30",
    loadTime: null,
    departTime: null,
    arriveTime: null,
    unloadTime: null,
  },
];

export default function DispatchBoardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders =
    statusFilter === "all"
      ? mockOrders
      : mockOrders.filter((o) => o.status === statusFilter);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "executing":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
      case "pending":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
      case "cancelled":
        return "bg-red-500/10 text-red-400 border border-red-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "executing":
        return "运输中";
      case "pending":
        return "待发车";
      case "completed":
        return "已完成";
      case "cancelled":
        return "已取消";
      default:
        return status;
    }
  };

  const getStationTypeStyle = (type: string) => {
    switch (type) {
      case "mother":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30";
      case "distribution":
        return "bg-violet-500/10 text-violet-400 border border-violet-500/30";
      case "filling":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
      case "storage":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
      case "decompression":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/30";
    }
  };

  const getStationStatusStyle = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-400";
      case "warning":
        return "bg-amber-400";
      case "offline":
        return "bg-red-400";
      default:
        return "bg-slate-400";
    }
  };

  const getSystemStatusStyle = (status: string) => {
    switch (status) {
      case "running":
        return "bg-emerald-400";
      case "warning":
        return "bg-amber-400";
      case "error":
        return "bg-red-400";
      default:
        return "bg-slate-400";
    }
  };

  // 计算库存百分比
  const getStockPercentage = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100);
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">调度中心</h1>
          <p className="mt-1 text-sm text-slate-500">
            CNG槽车调度管理 · 实时监控运输状态与场站运营
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2">
            <svg
              className="h-4 w-4 text-cyan-400"
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
            <span className="text-sm text-cyan-400">
              当前结算周期: 12月16日 00:00 - 24:00
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
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
            新建调度单
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4">
        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-5">
          <div className="text-3xl font-bold text-cyan-400">
            {mockStats.todayOrders}
          </div>
          <div className="mt-1 text-sm text-slate-500">今日调度单</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-5">
          <div className="text-3xl font-bold text-amber-400">
            {mockStats.pending}
          </div>
          <div className="mt-1 text-sm text-slate-500">待发车</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-5">
          <div className="text-3xl font-bold text-blue-400">
            {mockStats.executing}
          </div>
          <div className="mt-1 text-sm text-slate-500">运输中</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-5">
          <div className="text-3xl font-bold text-emerald-400">
            {mockStats.completed}
          </div>
          <div className="mt-1 text-sm text-slate-500">已完成</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-violet-400">
              {(mockStats.completedVolume / 1000).toFixed(1)}
            </span>
            <span className="text-sm text-slate-500">
              / {mockStats.totalVolume / 1000}k
            </span>
          </div>
          <div className="mt-1 text-sm text-slate-500">完成量 (Nm³)</div>
        </div>
      </div>

      {/* 上下游计划 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 上游供气（母站出气） */}
        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
                <svg
                  className="h-4 w-4 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </div>
              <span className="font-medium text-slate-200">上游供气计划</span>
            </div>
            <span className="text-2xl font-bold text-cyan-400">
              {mockUpstreamPlan.percentage}%
            </span>
          </div>
          <div className="mb-4">
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${mockUpstreamPlan.percentage}%` }}
              />
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              已出站{" "}
              <span className="font-medium text-cyan-400">
                {(mockUpstreamPlan.completed / 1000).toFixed(1)}k
              </span>{" "}
              / {mockUpstreamPlan.planned / 1000}k Nm³
            </span>
          </div>
          <div className="space-y-2 border-t border-slate-700/50 pt-4">
            {mockUpstreamPlan.stations.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-400">{s.name}</span>
                <span className="text-slate-300">
                  {(s.completed / 1000).toFixed(1)}k / {s.planned / 1000}k
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 下游配送（各站收气） */}
        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                <svg
                  className="h-4 w-4 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
              <span className="font-medium text-slate-200">下游配送计划</span>
            </div>
            <span className="text-2xl font-bold text-amber-400">
              {mockDownstreamPlan.percentage}%
            </span>
          </div>
          <div className="mb-4">
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${mockDownstreamPlan.percentage}%` }}
              />
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              已配送{" "}
              <span className="font-medium text-amber-400">
                {(mockDownstreamPlan.delivered / 1000).toFixed(1)}k
              </span>{" "}
              / {mockDownstreamPlan.planned / 1000}k Nm³
            </span>
          </div>
          <div className="space-y-2 border-t border-slate-700/50 pt-4">
            {mockDownstreamPlan.stations.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-400">{s.name}</span>
                <span
                  className={
                    s.delivered === 0 ? "text-red-400" : "text-slate-300"
                  }
                >
                  {(s.delivered / 1000).toFixed(1)}k / {s.planned / 1000}k
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 场站状态 & 系统状态 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 场站状态 - 占2列 */}
        <div className="col-span-2 rounded-2xl border border-slate-700/50 bg-[#0f172a] p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
              <svg
                className="h-4 w-4 text-violet-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <span className="font-medium text-slate-200">
              场站运营状态 ({mockStations.length})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {mockStations.map((station) => {
              const stockPct = getStockPercentage(
                station.currentStock,
                station.capacity,
              );
              return (
                <div
                  key={station.id}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${getStationStatusStyle(station.status)}`}
                      />
                      <span className="font-medium text-slate-200">
                        {station.name}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs ${getStationTypeStyle(station.type)}`}
                      >
                        {station.typeLabel}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-500">
                      {station.code}
                    </span>
                  </div>
                  <div className="mb-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">压力</span>
                      <div className="font-medium text-slate-300">
                        {station.currentPressure} MPa
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">库存</span>
                      <div className="font-medium text-slate-300">
                        {(station.currentStock / 1000).toFixed(1)}k Nm³
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">库存率</span>
                      <div
                        className={`font-medium ${stockPct < 30 ? "text-red-400" : stockPct < 50 ? "text-amber-400" : "text-emerald-400"}`}
                      >
                        {stockPct}%
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all ${stockPct < 30 ? "bg-red-500" : stockPct < 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${stockPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 系统状态 */}
        <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a] p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
              <svg
                className="h-4 w-4 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="font-medium text-slate-200">系统状态</span>
          </div>
          <div className="space-y-3">
            {mockSystemStatus.map((sys) => (
              <div
                key={sys.name}
                className="rounded-xl border border-slate-700/50 bg-slate-800/30 px-4 py-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${getSystemStatusStyle(sys.status)}`}
                    />
                    <span className="text-sm font-medium text-slate-200">
                      {sys.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-slate-500">
                      <span>CPU</span>
                      <span
                        className={
                          sys.cpu > 70 ? "text-amber-400" : "text-slate-300"
                        }
                      >
                        {sys.cpu}%
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700">
                      <div
                        className={`h-full rounded-full ${sys.cpu > 70 ? "bg-amber-500" : "bg-cyan-500"}`}
                        style={{ width: `${sys.cpu}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-slate-500">
                      <span>内存</span>
                      <span
                        className={
                          sys.memory > 70 ? "text-amber-400" : "text-slate-300"
                        }
                      >
                        {sys.memory}%
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700">
                      <div
                        className={`h-full rounded-full ${sys.memory > 70 ? "bg-amber-500" : "bg-cyan-500"}`}
                        style={{ width: `${sys.memory}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 调度单列表 */}
      <div className="rounded-2xl border border-slate-700/50 bg-[#0f172a]">
        <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
              <svg
                className="h-4 w-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <span className="font-medium text-slate-200">
              调度单列表 ({mockOrders.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs transition ${statusFilter === "all" ? "bg-slate-700 text-slate-200" : "border border-slate-700 text-slate-500 hover:bg-slate-800"}`}
            >
              全部
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`rounded-lg px-3 py-1.5 text-xs transition ${statusFilter === "pending" ? "border border-amber-500/30 bg-amber-500/20 text-amber-400" : "border border-slate-700 text-slate-500 hover:bg-slate-800"}`}
            >
              待发车
            </button>
            <button
              onClick={() => setStatusFilter("executing")}
              className={`rounded-lg px-3 py-1.5 text-xs transition ${statusFilter === "executing" ? "border border-blue-500/30 bg-blue-500/20 text-blue-400" : "border border-slate-700 text-slate-500 hover:bg-slate-800"}`}
            >
              运输中
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`rounded-lg px-3 py-1.5 text-xs transition ${statusFilter === "completed" ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400" : "border border-slate-700 text-slate-500 hover:bg-slate-800"}`}
            >
              已完成
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                  调度单号
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                  起点站
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                  终点站
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                  车辆/司机
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                  计划量
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                  装车压力
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                  里程
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                  计划时间
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-slate-800/20"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-cyan-400">
                      {order.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-300">
                      {order.fromStation}
                    </div>
                    <div className="text-xs text-slate-500">
                      {order.fromCode}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-300">
                      {order.toStation}
                    </div>
                    <div className="text-xs text-slate-500">{order.toCode}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-300">
                      {order.vehicle}
                    </div>
                    <div className="text-xs text-slate-500">{order.driver}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-slate-300">
                      {(order.planVolume / 1000).toFixed(0)}k
                    </span>
                    <span className="text-xs text-slate-500"> Nm³</span>
                  </td>
                  <td className="px-4 py-3">
                    {order.loadPressure ? (
                      <span className="text-sm text-slate-300">
                        {order.loadPressure} MPa
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-400">
                      {order.distance} km
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex w-fit rounded-lg px-2 py-0.5 text-xs font-medium ${getStatusStyle(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                      {order.status === "executing" && order.progress && (
                        <div className="flex items-center gap-1">
                          <div className="h-1 w-12 overflow-hidden rounded-full bg-slate-700">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${order.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-blue-400">
                            {order.progress}%
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {order.planTime}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                        title="查看详情"
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
                      </button>
                      {order.status === "pending" && (
                        <button
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-emerald-500/10 hover:text-emerald-400"
                          title="确认发车"
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
                              strokeWidth={1.5}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      )}
                      {order.status === "executing" && (
                        <button
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-blue-500/10 hover:text-blue-400"
                          title="查看轨迹"
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
                              strokeWidth={1.5}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-slate-500">
              暂无{statusFilter !== "all" ? getStatusText(statusFilter) : ""}
              调度单
            </p>
          </div>
        )}
      </div>

      {/* 新建调度单弹窗 */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-[#0f172a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-100">
                新建调度单
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
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
              {/* 起点终点 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    起点站（气源站）<span className="text-red-400">*</span>
                  </label>
                  <select className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500/50">
                    <option value="">请选择气源站</option>
                    {mockStations
                      .filter((s) => s.type === "mother")
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code}) - 库存
                          {(s.currentStock / 1000).toFixed(0)}k Nm³
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    终点站 <span className="text-red-400">*</span>
                  </label>
                  <select className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500/50">
                    <option value="">请选择目标站点</option>
                    {mockStations
                      .filter((s) => s.type !== "mother")
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.typeLabel}) - 库存
                          {(s.currentStock / 1000).toFixed(0)}k Nm³
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* 车辆司机 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    槽车 <span className="text-red-400">*</span>
                  </label>
                  <select className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500/50">
                    <option value="">请选择槽车</option>
                    {mockVehicles
                      .filter((v) => v.status === "idle")
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plateNo} - 容量{v.capacity / 1000}k Nm³ -{" "}
                          {v.driver}
                        </option>
                      ))}
                    {mockVehicles.filter(
                      (v) => v.status !== "idle" && v.status !== "maintenance",
                    ).length > 0 && (
                      <optgroup label="执行中（预约）">
                        {mockVehicles
                          .filter(
                            (v) =>
                              v.status !== "idle" && v.status !== "maintenance",
                          )
                          .map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.plateNo} - {v.driver} (执行中)
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    计划运量 (Nm³) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="例如: 10000"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    槽车容量上限，建议装载率90%-95%
                  </p>
                </div>
              </div>

              {/* 时间计划 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    计划发车日期
                  </label>
                  <input
                    type="date"
                    defaultValue="2024-12-16"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    计划发车时间
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    预计里程 (km)
                  </label>
                  <input
                    type="number"
                    placeholder="自动计算"
                    disabled
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-500 outline-none"
                  />
                </div>
              </div>

              {/* 备注 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  调度备注
                </label>
                <textarea
                  rows={2}
                  placeholder="如有特殊要求请备注，如：优先配送、紧急补气等"
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                />
              </div>

              {/* 提示信息 */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-slate-400">
                    <p className="mb-1 font-medium text-cyan-400">调度说明</p>
                    <ul className="list-inside list-disc space-y-1 text-xs">
                      <li>调度单创建后将自动通知司机，请确认信息准确</li>
                      <li>装车压力建议控制在20-23 MPa，确保运输安全</li>
                      <li>运输途中请保持GPS在线，便于实时追踪</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-700/50 px-6 py-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800"
              >
                取消
              </button>
              <button className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/40">
                创建调度单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
