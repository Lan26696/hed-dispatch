/**
 * 亿美软通短信 SDK 类型定义
 * 从 Java SDK 转译为 TypeScript
 */

// ==================== 通用类型 ====================

/**
 * API 响应结果模型
 */
export interface ResultModel<T> {
  /** 响应状态码 */
  code: string;
  /** 响应结果 */
  result: T | null;
}

/**
 * 错误码枚举
 */
export const ResultCode = {
  SUCCESS: 'SUCCESS',
  SYSTEM: 'SYSTEM',
  PARAM_ERROR: 'PARAM_ERROR',
  SIGN_ERROR: 'SIGN_ERROR',
  APPID_ERROR: 'APPID_ERROR',
  BALANCE_NOT_ENOUGH: 'BALANCE_NOT_ENOUGH',
} as const;

export type ResultCodeType = keyof typeof ResultCode;

// ==================== 请求类型 ====================

/**
 * 基础请求参数
 */
export interface BaseRequest {
  /** 请求时间 (毫秒时间戳) */
  requestTime?: number;
  /** 请求有效时间(秒)，默认60秒 */
  requestValidPeriod?: number;
}

/**
 * 短信基础请求参数
 */
export interface SmsBaseRequest extends BaseRequest {
  /** 定时发送时间 yyyy-MM-dd HH:mm:ss */
  timerTime?: string;
  /** 扩展码 */
  extendedCode?: string;
}

/**
 * 单条短信发送请求
 */
export interface SmsSingleRequest extends SmsBaseRequest {
  /** 电话号码 */
  mobile: string;
  /** 短信内容 */
  content: string;
  /** 自定义 smsId */
  customSmsId?: string;
}

/**
 * 自定义 SmsId 和手机号
 */
export interface CustomSmsIdAndMobile {
  /** 自定义 SmsId */
  customSmsId?: string;
  /** 手机号 */
  mobile: string;
}

/**
 * 批量短信发送请求（自定义 smsId）
 */
export interface SmsBatchRequest extends SmsBaseRequest {
  /** 手机号与自定义 SmsId 数组 */
  smses: CustomSmsIdAndMobile[];
  /** 短信内容 */
  content: string;
}

/**
 * 批量短信发送请求（非自定义 smsId）
 */
export interface SmsBatchOnlyRequest extends SmsBaseRequest {
  /** 手机号数组 */
  mobiles: string[];
  /** 短信内容 */
  content: string;
}

/**
 * 手机号和内容
 */
export interface MobileAndContent {
  /** 手机号 */
  mobile: string;
  /** 短信内容 */
  content: string;
  /** 自定义 SmsId */
  customSmsId?: string;
}

/**
 * 个性化短信请求
 */
export interface SmsPersonalityRequest extends SmsBaseRequest {
  /** 手机号和内容数组 */
  smses: MobileAndContent[];
}

/**
 * 全属性个性化短信参数
 */
export interface PersonalityParams {
  /** 手机号 */
  mobile: string;
  /** 短信内容 */
  content: string;
  /** 自定义 SmsId */
  customSmsId?: string;
  /** 定时发送时间 */
  timerTime?: string;
  /** 扩展码 */
  extendedCode?: string;
}

/**
 * 全属性个性化短信请求
 */
export interface SmsPersonalityAllRequest extends BaseRequest {
  /** 个性化短信参数数组 */
  smses: PersonalityParams[];
}

/**
 * 余额请求
 */
export interface BalanceRequest extends BaseRequest {}

/**
 * 状态报告请求
 */
export interface ReportRequest extends BaseRequest {
  /** 请求数量，最大500 */
  number?: number;
}

/**
 * 上行短信请求
 */
export interface MoRequest extends BaseRequest {
  /** 请求数量，最大500 */
  number?: number;
}

/**
 * 状态报告重新获取请求
 */
export interface RetrieveReportRequest extends BaseRequest {
  /** 开始时间 yyyyMMddHHmmss */
  startTime: string;
  /** 结束时间 yyyyMMddHHmmss */
  endTime: string;
  /** 短信 smsId，多个用逗号分隔 */
  smsId?: string;
}

// ==================== 响应类型 ====================

/**
 * 短信发送响应
 */
export interface SmsResponse {
  /** 系统唯一 smsId */
  smsId?: string;
  /** 手机号 */
  mobile?: string;
  /** 自定义 smsId */
  customSmsId?: string;
}

/**
 * 余额响应
 */
export interface BalanceResponse {
  /** 余额 */
  balance: number;
}

/**
 * 状态报告响应
 */
export interface ReportResponse {
  /** 接口自定义 ID */
  interSmsId?: string;
  /** 短信唯一标识 */
  smsId?: string;
  /** 客户自定义 SmsId */
  customSmsId?: string;
  /** 成功失败标识 */
  state?: string;
  /** 状态报告描述 */
  desc?: string;
  /** 手机号 */
  mobile?: string;
  /** 状态报告返回时间 */
  receiveTime?: string;
  /** 信息提交时间 */
  submitTime?: string;
  /** 扩展码 */
  extendedCode?: string;
}

/**
 * 上行短信响应
 */
export interface MoResponse {
  /** 手机号 */
  mobile?: string;
  /** 扩展码 */
  extendedCode?: string;
  /** 内容 */
  content?: string;
  /** 手机上行时间 */
  moTime?: string;
}

/**
 * 状态报告重新获取响应
 */
export interface RetrieveReportResponse {
  /** 响应状态码 */
  code?: string;
}

// ==================== SDK 配置类型 ====================

/**
 * SDK 配置
 */
export interface EmaySmsConfig {
  /** 亿美服务账号 */
  appId: string;
  /** 亿美服务密码 */
  secretKey: string;
  /** 网关 IP（可选，不填则使用默认网关） */
  host?: string;
  /** 网关端口（可选，与 host 一起使用） */
  port?: number;
  /** 请求超时时间（毫秒），默认 30000 */
  timeout?: number;
}

/**
 * 默认网关地址
 */
export const DEFAULT_HOST = 'http://bjmtn.b2m.cn';
export const DEFAULT_PORT = 80;

/**
 * 加密算法
 */
export const ALGORITHM = 'AES/ECB/PKCS5Padding';
