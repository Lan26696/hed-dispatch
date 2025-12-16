/**
 * 配置常量
 */

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// 密码配置
export const PASSWORD = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 32,
  SALT_ROUNDS: 10,
} as const;

// 短信配置
export const SMS = {
  SIGNATURE: "【恒德能源】",
  MAX_CONTENT_LENGTH: 500,
} as const;

// CNG 业务配置
export const CNG = {
  // 槽车容量范围 (Nm³)
  VEHICLE_CAPACITY_MIN: 6000,
  VEHICLE_CAPACITY_MAX: 15000,
  // 装车压力范围 (MPa)
  LOAD_PRESSURE_MIN: 18,
  LOAD_PRESSURE_MAX: 25,
  // 推荐装载率
  RECOMMENDED_LOAD_RATE: 0.95,
} as const;

// 系统配置
export const SYSTEM = {
  NAME: "恒德新能源-智能调度仿真平台",
  SHORT_NAME: "恒德调度",
  VERSION: "1.0.0",
} as const;
