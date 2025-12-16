/**
 * 状态常量定义
 */

// 启用/禁用状态
export const ENABLE_STATUS = {
  ENABLED: 1,
  DISABLED: 0,
} as const;

export const ENABLE_STATUS_LABEL = {
  [ENABLE_STATUS.ENABLED]: "启用",
  [ENABLE_STATUS.DISABLED]: "禁用",
} as const;

// 通用状态
export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
} as const;

export const STATUS_LABEL = {
  [STATUS.ACTIVE]: "启用",
  [STATUS.INACTIVE]: "禁用",
  [STATUS.PENDING]: "待审核",
} as const;

// 短信发送状态
export const SMS_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
} as const;

export const SMS_STATUS_LABEL = {
  [SMS_STATUS.PENDING]: "发送中",
  [SMS_STATUS.SUCCESS]: "发送成功",
  [SMS_STATUS.FAILED]: "发送失败",
} as const;

// 调度单状态
export const DISPATCH_STATUS = {
  PENDING: "pending",
  LOADING: "loading",
  DELIVERING: "delivering",
  UNLOADING: "unloading",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const DISPATCH_STATUS_LABEL = {
  [DISPATCH_STATUS.PENDING]: "待发车",
  [DISPATCH_STATUS.LOADING]: "装气中",
  [DISPATCH_STATUS.DELIVERING]: "运输中",
  [DISPATCH_STATUS.UNLOADING]: "卸气中",
  [DISPATCH_STATUS.COMPLETED]: "已完成",
  [DISPATCH_STATUS.CANCELLED]: "已取消",
} as const;

// 场站类型
export const STATION_TYPE = {
  MOTHER: "mother",
  DISTRIBUTION: "distribution",
  FILLING: "filling",
  STORAGE: "storage",
  DECOMPRESSION: "decompression",
} as const;

export const STATION_TYPE_LABEL = {
  [STATION_TYPE.MOTHER]: "气源母站",
  [STATION_TYPE.DISTRIBUTION]: "配送站",
  [STATION_TYPE.FILLING]: "加气站",
  [STATION_TYPE.STORAGE]: "储气站",
  [STATION_TYPE.DECOMPRESSION]: "解压站",
} as const;

// 菜单类型
export const MENU_TYPE = {
  DIRECTORY: 1,
  MENU: 2,
} as const;

export const MENU_TYPE_LABEL = {
  [MENU_TYPE.DIRECTORY]: "目录",
  [MENU_TYPE.MENU]: "菜单",
} as const;

// 数据范围
export const DATA_SCOPE = {
  ALL: "all",
  DEPT: "dept",
  SELF: "self",
} as const;

export const DATA_SCOPE_LABEL = {
  [DATA_SCOPE.ALL]: "全部数据",
  [DATA_SCOPE.DEPT]: "本部门数据",
  [DATA_SCOPE.SELF]: "仅本人数据",
} as const;
