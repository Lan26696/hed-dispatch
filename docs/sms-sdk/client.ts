/**
 * 亿美软通短信 SDK 客户端
 * 
 * 功能说明：
 * - 发送单条短信
 * - 发送批量短信
 * - 发送个性化短信
 * - 查询余额
 * - 获取状态报告
 * - 获取上行短信
 * 
 * 使用示例：
 * ```typescript
 * const client = new EmaySmsClient({
 *   appId: 'your-app-id',
 *   secretKey: 'your-secret-key',
 * });
 * 
 * // 发送单条短信
 * const result = await client.sendSingleSms({
 *   mobile: '13800138000',
 *   content: '您的验证码是：123456',
 * });
 * ```
 */

import {
  EmaySmsConfig,
  ResultModel,
  ResultCode,
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
  DEFAULT_HOST,
  DEFAULT_PORT,
} from './types';
import { sendEncryptedRequest, sendFormRequest, generateSign, formatDate } from './http-client';

/**
 * API 接口路径
 */
const API_PATHS = {
  /** 发送单条短信 */
  SEND_SINGLE_SMS: '/inter/sendSingleSMS',
  /** 发送批量短信（非自定义 smsId） */
  SEND_BATCH_ONLY_SMS: '/inter/sendBatchOnlySMS',
  /** 发送批量短信（自定义 smsId） */
  SEND_BATCH_SMS: '/inter/sendBatchSMS',
  /** 发送个性化短信 */
  SEND_PERSONALITY_SMS: '/inter/sendPersonalitySMS',
  /** 发送全属性个性化短信 */
  SEND_PERSONALITY_ALL_SMS: '/inter/sendPersonalityAllSMS',
  /** 获取余额 */
  GET_BALANCE: '/inter/getBalance',
  /** 获取状态报告 */
  GET_REPORT: '/inter/getReport',
  /** 获取上行短信 */
  GET_MO: '/inter/getMo',
  /** 状态报告重新获取 */
  RETRIEVE_REPORT: '/report/retrieveReport',
} as const;

/**
 * 亿美短信 SDK 客户端
 */
export class EmaySmsClient {
  /** 亿美服务账号 */
  private appId: string;
  /** 亿美服务密码 */
  private secretKey: string;
  /** 网关地址 */
  private host: string;
  /** 请求超时时间 */
  private timeout: number;

  /**
   * 创建 SMS 客户端实例
   * 
   * @param config - SDK 配置
   * @throws 如果 appId 或 secretKey 为空则抛出错误
   */
  constructor(config: EmaySmsConfig) {
    if (!config.appId || !config.secretKey) {
      throw new Error('[EmaySmsClient] appId 和 secretKey 不能为空');
    }

    this.appId = config.appId;
    this.secretKey = config.secretKey;
    this.timeout = config.timeout || 30000;

    // 构建网关地址
    if (config.host) {
      let host = config.host;
      if (!host.toLowerCase().startsWith('http://') && !host.toLowerCase().startsWith('https://')) {
        host = 'http://' + host;
      }
      this.host = config.port ? `${host}:${config.port}` : host;
    } else {
      this.host = `${DEFAULT_HOST}:${DEFAULT_PORT}`;
    }
  }

  /**
   * 获取完整的 API URL
   */
  private getUrl(path: string): string {
    return this.host + path;
  }

  /**
   * 准备请求数据（添加默认字段）
   */
  private prepareRequest<T extends { requestTime?: number; requestValidPeriod?: number }>(
    request: T
  ): T {
    return {
      ...request,
      requestTime: request.requestTime || Date.now(),
      requestValidPeriod: request.requestValidPeriod || 60,
    };
  }

  /**
   * 发送单条短信
   * 
   * @param request - 短信请求参数
   * @returns 发送结果
   * 
   * @example
   * ```typescript
   * const result = await client.sendSingleSms({
   *   mobile: '13800138000',
   *   content: '您的验证码是：123456',
   *   customSmsId: 'my-sms-001',  // 可选
   *   timerTime: '2024-01-01 10:00:00',  // 可选，定时发送
   *   extendedCode: '001',  // 可选，扩展码
   * });
   * ```
   */
  async sendSingleSms(request: SmsSingleRequest): Promise<ResultModel<SmsResponse>> {
    const preparedRequest = this.prepareRequest(request);
    return sendEncryptedRequest<SmsResponse>(
      this.appId,
      this.secretKey,
      this.getUrl(API_PATHS.SEND_SINGLE_SMS),
      preparedRequest,
      { timeout: this.timeout }
    );
  }

  /**
   * 发送批量短信（非自定义 smsId）
   * 相同内容发送给多个手机号
   * 
   * @param request - 批量短信请求参数
   * @returns 发送结果数组
   * 
   * @example
   * ```typescript
   * const result = await client.sendBatchOnlySms({
   *   mobiles: ['13800138001', '13800138002', '13800138003'],
   *   content: '您的验证码是：123456',
   * });
   * ```
   */
  async sendBatchOnlySms(request: SmsBatchOnlyRequest): Promise<ResultModel<SmsResponse[]>> {
    const preparedRequest = this.prepareRequest(request);
    return sendEncryptedRequest<SmsResponse[]>(
      this.appId,
      this.secretKey,
      this.getUrl(API_PATHS.SEND_BATCH_ONLY_SMS),
      preparedRequest,
      { timeout: this.timeout }
    );
  }

  /**
   * 发送批量短信（自定义 smsId）
   * 相同内容发送给多个手机号，可为每个手机号指定自定义 smsId
   * 
   * @param request - 批量短信请求参数
   * @returns 发送结果数组
   * 
   * @example
   * ```typescript
   * const result = await client.sendBatchSms({
   *   smses: [
   *     { mobile: '13800138001', customSmsId: 'sms-001' },
   *     { mobile: '13800138002', customSmsId: 'sms-002' },
   *   ],
   *   content: '您的验证码是：123456',
   * });
   * ```
   */
  async sendBatchSms(request: SmsBatchRequest): Promise<ResultModel<SmsResponse[]>> {
    const preparedRequest = this.prepareRequest(request);
    return sendEncryptedRequest<SmsResponse[]>(
      this.appId,
      this.secretKey,
      this.getUrl(API_PATHS.SEND_BATCH_SMS),
      preparedRequest,
      { timeout: this.timeout }
    );
  }

  /**
   * 发送个性化短信
   * 不同内容发送给不同手机号
   * 
   * @param request - 个性化短信请求参数
   * @returns 发送结果数组
   * 
   * @example
   * ```typescript
   * const result = await client.sendPersonalitySms({
   *   smses: [
   *     { mobile: '13800138001', content: '张三，您的验证码是：111111' },
   *     { mobile: '13800138002', content: '李四，您的验证码是：222222' },
   *   ],
   * });
   * ```
   */
  async sendPersonalitySms(request: SmsPersonalityRequest): Promise<ResultModel<SmsResponse[]>> {
    const preparedRequest = this.prepareRequest(request);
    return sendEncryptedRequest<SmsResponse[]>(
      this.appId,
      this.secretKey,
      this.getUrl(API_PATHS.SEND_PERSONALITY_SMS),
      preparedRequest,
      { timeout: this.timeout }
    );
  }

  /**
   * 发送全属性个性化短信
   * 每条短信可独立设置内容、定时时间、扩展码等
   * 
   * @param request - 全属性个性化短信请求参数
   * @returns 发送结果数组
   * 
   * @example
   * ```typescript
   * const result = await client.sendPersonalityAllSms({
   *   smses: [
   *     { 
   *       mobile: '13800138001', 
   *       content: '张三，您的验证码是：111111',
   *       customSmsId: 'sms-001',
   *       timerTime: '2024-01-01 10:00:00',
   *       extendedCode: '001',
   *     },
   *   ],
   * });
   * ```
   */
  async sendPersonalityAllSms(request: SmsPersonalityAllRequest): Promise<ResultModel<SmsResponse[]>> {
    const preparedRequest = this.prepareRequest(request);
    return sendEncryptedRequest<SmsResponse[]>(
      this.appId,
      this.secretKey,
      this.getUrl(API_PATHS.SEND_PERSONALITY_ALL_SMS),
      preparedRequest,
      { timeout: this.timeout }
    );
  }

  /**
   * 获取账户余额
   * 
   * @param request - 余额请求参数（可选）
   * @returns 余额信息
   * 
   * @example
   * ```typescript
   * const result = await client.getBalance();
   * if (result.code === 'SUCCESS' && result.result) {
   *   console.log('当前余额:', result.result.balance);
   * }
   * ```
   */
  async getBalance(request: BalanceRequest = {}): Promise<ResultModel<BalanceResponse>> {
    const preparedRequest = this.prepareRequest(request);
    return sendEncryptedRequest<BalanceResponse>(
      this.appId,
      this.secretKey,
      this.getUrl(API_PATHS.GET_BALANCE),
      preparedRequest,
      { timeout: this.timeout }
    );
  }

  /**
   * 获取状态报告
   * 获取已发送短信的送达状态
   * 
   * @param request - 状态报告请求参数
   * @returns 状态报告数组
   * 
   * @example
   * ```typescript
   * const result = await client.getReport({ number: 100 });
   * if (result.code === 'SUCCESS' && result.result) {
   *   for (const report of result.result) {
   *     console.log(`短信 ${report.smsId} 状态: ${report.state}`);
   *   }
   * }
   * ```
   */
  async getReport(request: ReportRequest = {}): Promise<ResultModel<ReportResponse[]>> {
    const preparedRequest = this.prepareRequest({
      ...request,
      number: Math.min(request.number || 500, 500), // 最大500
    });
    return sendEncryptedRequest<ReportResponse[]>(
      this.appId,
      this.secretKey,
      this.getUrl(API_PATHS.GET_REPORT),
      preparedRequest,
      { timeout: this.timeout }
    );
  }

  /**
   * 获取上行短信
   * 获取用户回复的短信
   * 
   * @param request - 上行短信请求参数
   * @returns 上行短信数组
   * 
   * @example
   * ```typescript
   * const result = await client.getMo({ number: 100 });
   * if (result.code === 'SUCCESS' && result.result) {
   *   for (const mo of result.result) {
   *     console.log(`收到来自 ${mo.mobile} 的短信: ${mo.content}`);
   *   }
   * }
   * ```
   */
  async getMo(request: MoRequest = {}): Promise<ResultModel<MoResponse[]>> {
    const preparedRequest = this.prepareRequest({
      ...request,
      number: Math.min(request.number || 500, 500), // 最大500
    });
    return sendEncryptedRequest<MoResponse[]>(
      this.appId,
      this.secretKey,
      this.getUrl(API_PATHS.GET_MO),
      preparedRequest,
      { timeout: this.timeout }
    );
  }

  /**
   * 状态报告重新获取
   * 重新获取指定时间范围内的状态报告
   * 
   * @param request - 状态报告重新获取请求参数
   * @returns 获取结果
   * 
   * @example
   * ```typescript
   * const result = await client.retrieveReport({
   *   startTime: '20240101100000',
   *   endTime: '20240101110000',
   *   smsId: '123456789',  // 可选
   * });
   * ```
   */
  async retrieveReport(request: RetrieveReportRequest): Promise<ResultModel<RetrieveReportResponse>> {
    const timestamp = formatDate(new Date());
    const sign = generateSign(this.appId, this.secretKey, timestamp);

    const params: Record<string, string> = {
      appId: this.appId,
      timestamp,
      sign,
      startTime: request.startTime,
      endTime: request.endTime,
    };

    if (request.smsId) {
      params.smsId = request.smsId;
    }

    const result = await sendFormRequest<string>(
      this.getUrl(API_PATHS.RETRIEVE_REPORT),
      params,
      { timeout: this.timeout }
    );

    return {
      code: result.code,
      result: { code: result.code },
    };
  }
}

/**
 * 判断结果是否成功
 * 
 * @param result - API 响应结果
 * @returns 是否成功
 */
export function isSuccess<T>(result: ResultModel<T>): boolean {
  return result.code === ResultCode.SUCCESS && result.result !== null;
}
