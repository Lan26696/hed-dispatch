/**
 * 亿美软通短信服务
 * 封装亿美短信 SDK，提供便捷的短信发送方法
 */

import { 
  EmaySmsClient, 
  isSuccess, 
  ResultModel, 
  SmsResponse, 
  BalanceResponse,
  ReportResponse,
  ResultCode,
  ERROR_CODES,
} from '../sms-sdk';

// 亿美短信客户端单例
let client: EmaySmsClient | null = null;

/**
 * 获取亿美短信客户端实例（单例模式）
 */
function getClient(): EmaySmsClient {
  if (!client) {
    const appId = process.env.EMAY_APP_ID;
    const secretKey = process.env.EMAY_SECRET_KEY;
    const host = process.env.EMAY_HOST;
    const port = process.env.EMAY_PORT ? parseInt(process.env.EMAY_PORT, 10) : undefined;

    if (!appId || !secretKey) {
      throw new Error('亿美短信配置缺失：请在 .env.local 中配置 EMAY_APP_ID 和 EMAY_SECRET_KEY');
    }
    console.log('appId', appId);
    console.log('secretKey', secretKey);
    console.log('host', host);
    console.log('port', port);
    client = new EmaySmsClient({
      appId,
      secretKey,
      host,
      port,
      timeout: 30000,
    });

    console.log('[EmaySmsService] 客户端已初始化', { host, port });
  }

  return client;
}

/**
 * 短信发送结果
 */
export interface SmsSendResult {
  /** 是否成功 */
  success: boolean;
  /** 短信ID */
  smsId?: string;
  /** 错误码 */
  code: string;
  /** 错误信息 */
  message: string;
}

/**
 * 批量发送结果
 */
export interface SmsBatchSendResult {
  /** 是否全部成功 */
  success: boolean;
  /** 成功数量 */
  successCount: number;
  /** 失败数量 */
  failCount: number;
  /** 详细结果 */
  results: Array<{
    mobile: string;
    smsId?: string;
    success: boolean;
  }>;
  /** 错误码 */
  code: string;
  /** 错误信息 */
  message: string;
}

/**
 * 亿美短信服务类
 */
class EmaySmsService {
  /**
   * 发送单条短信
   * 
   * @param mobile - 手机号
   * @param content - 短信内容（需包含签名，如：【公司名称】您的验证码是...）
   * @param customSmsId - 自定义短信ID（可选）
   * @returns 发送结果
   * 
   * @example
   * ```typescript
   * const result = await emaySmsService.sendSms(
   *   '13800138000',
   *   '【测试】您的验证码是：123456，5分钟内有效。'
   * );
   * ```
   */
  async sendSms(mobile: string, content: string, customSmsId?: string): Promise<SmsSendResult> {
    try {
      const client = getClient();
      
      console.log('[EmaySmsService] 发送短信:', { mobile, contentLength: content.length });
      
      const result = await client.sendSingleSms({
        mobile,
        content,
        customSmsId,
      });

      if (isSuccess(result)) {
        console.log('[EmaySmsService] 发送成功:', result.result);
        return {
          success: true,
          smsId: result.result?.smsId,
          code: result.code,
          message: '发送成功',
        };
      } else {
        console.error('[EmaySmsService] 发送失败:', result.code);
        return {
          success: false,
          code: result.code,
          message: ERROR_CODES[result.code] || `发送失败: ${result.code}`,
        };
      }
    } catch (error) {
      console.error('[EmaySmsService] 发送异常:', error);
      return {
        success: false,
        code: 'EXCEPTION',
        message: error instanceof Error ? error.message : '发送异常',
      };
    }
  }

  /**
   * 批量发送短信（相同内容）
   * 
   * @param mobiles - 手机号数组
   * @param content - 短信内容
   * @returns 发送结果
   * 
   * @example
   * ```typescript
   * const result = await emaySmsService.sendBatchSms(
   *   ['13800138001', '13800138002'],
   *   '【测试】系统通知：服务器维护中...'
   * );
   * ```
   */
  async sendBatchSms(mobiles: string[], content: string): Promise<SmsBatchSendResult> {
    try {
      const client = getClient();
      
      console.log('[EmaySmsService] 批量发送:', { count: mobiles.length });
      
      const result = await client.sendBatchOnlySms({
        mobiles,
        content,
      });

      if (isSuccess(result) && result.result) {
        const results = result.result.map(r => ({
          mobile: r.mobile || '',
          smsId: r.smsId,
          success: !!r.smsId,
        }));
        
        const successCount = results.filter(r => r.success).length;
        
        return {
          success: successCount === mobiles.length,
          successCount,
          failCount: mobiles.length - successCount,
          results,
          code: result.code,
          message: `发送完成：成功 ${successCount}，失败 ${mobiles.length - successCount}`,
        };
      } else {
        return {
          success: false,
          successCount: 0,
          failCount: mobiles.length,
          results: mobiles.map(m => ({ mobile: m, success: false })),
          code: result.code,
          message: ERROR_CODES[result.code] || `发送失败: ${result.code}`,
        };
      }
    } catch (error) {
      console.error('[EmaySmsService] 批量发送异常:', error);
      return {
        success: false,
        successCount: 0,
        failCount: mobiles.length,
        results: mobiles.map(m => ({ mobile: m, success: false })),
        code: 'EXCEPTION',
        message: error instanceof Error ? error.message : '发送异常',
      };
    }
  }

  /**
   * 发送个性化短信（不同内容）
   * 
   * @param messages - 短信列表
   * @returns 发送结果
   * 
   * @example
   * ```typescript
   * const result = await emaySmsService.sendPersonalitySms([
   *   { mobile: '13800138001', content: '【测试】张三，您的验证码是：111111' },
   *   { mobile: '13800138002', content: '【测试】李四，您的验证码是：222222' },
   * ]);
   * ```
   */
  async sendPersonalitySms(
    messages: Array<{ mobile: string; content: string; customSmsId?: string }>
  ): Promise<SmsBatchSendResult> {
    try {
      const client = getClient();
      
      console.log('[EmaySmsService] 个性化发送:', { count: messages.length });
      
      const result = await client.sendPersonalitySms({
        smses: messages.map(m => ({
          mobile: m.mobile,
          content: m.content,
          customSmsId: m.customSmsId,
        })),
      });

      if (isSuccess(result) && result.result) {
        const results = result.result.map((r, i) => ({
          mobile: r.mobile || messages[i]?.mobile || '',
          smsId: r.smsId,
          success: !!r.smsId,
        }));
        
        const successCount = results.filter(r => r.success).length;
        
        return {
          success: successCount === messages.length,
          successCount,
          failCount: messages.length - successCount,
          results,
          code: result.code,
          message: `发送完成：成功 ${successCount}，失败 ${messages.length - successCount}`,
        };
      } else {
        return {
          success: false,
          successCount: 0,
          failCount: messages.length,
          results: messages.map(m => ({ mobile: m.mobile, success: false })),
          code: result.code,
          message: ERROR_CODES[result.code] || `发送失败: ${result.code}`,
        };
      }
    } catch (error) {
      console.error('[EmaySmsService] 个性化发送异常:', error);
      return {
        success: false,
        successCount: 0,
        failCount: messages.length,
        results: messages.map(m => ({ mobile: m.mobile, success: false })),
        code: 'EXCEPTION',
        message: error instanceof Error ? error.message : '发送异常',
      };
    }
  }

  /**
   * 查询账户余额
   * 
   * @returns 余额信息
   */
  async getBalance(): Promise<{ success: boolean; balance?: number; code: string; message: string }> {
    try {
      const client = getClient();
      
      const result = await client.getBalance();

      console.log('result', result);
      if (isSuccess(result) && result.result) {
        return {
          success: true,
          balance: result.result.balance,
          code: result.code,
          message: '查询成功',
        };
      } else {
        return {
          success: false,
          code: result.code,
          message: ERROR_CODES[result.code] || `查询失败: ${result.code}`,
        };
      }
    } catch (error) {
      console.error('[EmaySmsService] 查询余额异常:', error);
      return {
        success: false,
        code: 'EXCEPTION',
        message: error instanceof Error ? error.message : '查询异常',
      };
    }
  }

  /**
   * 获取状态报告
   * 
   * @param number - 获取数量（最大500）
   * @returns 状态报告列表
   */
  async getReports(number: number = 500): Promise<{
    success: boolean;
    reports?: ReportResponse[];
    code: string;
    message: string;
  }> {
    try {
      const client = getClient();
      
      const result = await client.getReport({ number: Math.min(number, 500) });

      if (isSuccess(result)) {
        return {
          success: true,
          reports: result.result || [],
          code: result.code,
          message: '查询成功',
        };
      } else {
        return {
          success: false,
          code: result.code,
          message: ERROR_CODES[result.code] || `查询失败: ${result.code}`,
        };
      }
    } catch (error) {
      console.error('[EmaySmsService] 获取状态报告异常:', error);
      return {
        success: false,
        code: 'EXCEPTION',
        message: error instanceof Error ? error.message : '查询异常',
      };
    }
  }

  /**
   * 发送验证码短信
   * 
   * @param mobile - 手机号
   * @param code - 验证码
   * @param signName - 签名名称（如：测试公司）
   * @param expireMinutes - 过期时间（分钟）
   * @returns 发送结果
   */
  async sendVerifyCode(
    mobile: string, 
    code: string, 
    signName: string = '测试',
    expireMinutes: number = 5
  ): Promise<SmsSendResult> {
    const content = `【${signName}】您的验证码是：${code}，${expireMinutes}分钟内有效，请勿泄露给他人。`;
    return this.sendSms(mobile, content);
  }

  /**
   * 发送通知短信
   * 
   * @param mobile - 手机号
   * @param message - 通知内容
   * @param signName - 签名名称
   * @returns 发送结果
   */
  async sendNotification(
    mobile: string, 
    message: string, 
    signName: string = '测试'
  ): Promise<SmsSendResult> {
    const content = `【${signName}】${message}`;
    return this.sendSms(mobile, content);
  }
}

// 导出单例服务
export const emaySmsService = new EmaySmsService();

// 导出便捷方法
export const sendSms = emaySmsService.sendSms.bind(emaySmsService);
export const sendBatchSms = emaySmsService.sendBatchSms.bind(emaySmsService);
export const sendVerifyCode = emaySmsService.sendVerifyCode.bind(emaySmsService);
export const sendNotification = emaySmsService.sendNotification.bind(emaySmsService);
export const getBalance = emaySmsService.getBalance.bind(emaySmsService);

