/**
 * 亿美软通短信 SDK
 * 
 * 本 SDK 是从 Java 版本的亿美 EUCP SMS SDK 转译而来，
 * 适用于 Next.js/Node.js 环境。
 * 
 * ## 功能特性
 * - 发送单条短信
 * - 发送批量短信（相同内容）
 * - 发送个性化短信（不同内容）
 * - 查询账户余额
 * - 获取状态报告
 * - 获取上行短信
 * 
 * ## 使用示例
 * 
 * ```typescript
 * import { EmaySmsClient, isSuccess } from '@/lib/sms-sdk';
 * 
 * // 创建客户端实例
 * const client = new EmaySmsClient({
 *   appId: process.env.EMAY_APP_ID!,
 *   secretKey: process.env.EMAY_SECRET_KEY!,
 * });
 * 
 * // 发送单条短信
 * const result = await client.sendSingleSms({
 *   mobile: '13800138000',
 *   content: '【公司名称】您的验证码是：123456，5分钟内有效。',
 * });
 * 
 * if (isSuccess(result)) {
 *   console.log('短信发送成功，smsId:', result.result?.smsId);
 * } else {
 *   console.error('短信发送失败，错误码:', result.code);
 * }
 * ```
 * 
 * ## 环境变量配置
 * 
 * 在 `.env.local` 中配置以下变量：
 * ```
 * EMAY_APP_ID=your-app-id
 * EMAY_SECRET_KEY=your-secret-key
 * EMAY_HOST=bjmtn.b2m.cn  # 可选，默认网关
 * EMAY_PORT=80  # 可选，默认端口
 * ```
 * 
 * @module sms-sdk
 */

// 导出客户端
export { EmaySmsClient, isSuccess } from './client';

// 导出类型
export type {
  EmaySmsConfig,
  ResultModel,
  SmsSingleRequest,
  SmsBatchRequest,
  SmsBatchOnlyRequest,
  SmsPersonalityRequest,
  SmsPersonalityAllRequest,
  BalanceRequest,
  ReportRequest,
  MoRequest,
  RetrieveReportRequest,
  SmsResponse,
  BalanceResponse,
  ReportResponse,
  MoResponse,
  RetrieveReportResponse,
  CustomSmsIdAndMobile,
  MobileAndContent,
  PersonalityParams,
  BaseRequest,
  SmsBaseRequest,
} from './types';

// 导出常量
export { ResultCode, DEFAULT_HOST, DEFAULT_PORT, ALGORITHM } from './types';

// 导出工具函数
export { md5 } from './crypto';
export { generateSign, formatDate } from './http-client';

/**
 * 创建短信客户端的便捷方法
 * 从环境变量读取配置
 * 
 * @returns EmaySmsClient 实例
 * @throws 如果环境变量未配置则抛出错误
 * 
 * @example
 * ```typescript
 * import { createSmsClient } from '@/lib/sms-sdk';
 * 
 * const client = createSmsClient();
 * const result = await client.sendSingleSms({
 *   mobile: '13800138000',
 *   content: '您的验证码是：123456',
 * });
 * ```
 */
export function createSmsClient() {
  const appId = process.env.EMAY_APP_ID;
  const secretKey = process.env.EMAY_SECRET_KEY;

  if (!appId || !secretKey) {
    throw new Error(
      '[SMS SDK] 缺少环境变量配置。请在 .env.local 中设置 EMAY_APP_ID 和 EMAY_SECRET_KEY'
    );
  }

  const { EmaySmsClient } = require('./client');

  return new EmaySmsClient({
    appId,
    secretKey,
    host: process.env.EMAY_HOST,
    port: process.env.EMAY_PORT ? parseInt(process.env.EMAY_PORT, 10) : undefined,
    timeout: process.env.EMAY_TIMEOUT ? parseInt(process.env.EMAY_TIMEOUT, 10) : undefined,
  });
}

/**
 * 错误码说明
 */
export const ERROR_CODES: Record<string, string> = {
  SUCCESS: '成功',
  SYSTEM: '系统异常',
  PARAM_ERROR: '参数错误',
  SIGN_ERROR: '签名错误',
  APPID_ERROR: 'AppId 错误',
  BALANCE_NOT_ENOUGH: '余额不足',
  IP_ERROR: 'IP 限制',
  MOBILE_ERROR: '手机号格式错误',
  CONTENT_ERROR: '内容格式错误',
  TEMPLATE_ERROR: '模板错误',
  KEYWORD_ERROR: '关键词拦截',
  FREQUENCY_ERROR: '频率限制',
  BLACKLIST_ERROR: '黑名单拦截',
  TIME_ERROR: '时间格式错误',
  EMPTY_ERROR: '内容为空',
};
