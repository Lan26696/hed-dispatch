/**
 * 亿美软通短信服务
 * 封装亿美短信 SDK，提供便捷的短信发送方法
 */

import {
  EmaySmsClient,
  isSuccess,
  ERROR_CODES,
  type ReportResponse,
} from "../sms-sdk";

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
    const port = process.env.EMAY_PORT
      ? parseInt(process.env.EMAY_PORT, 10)
      : undefined;

    if (!appId || !secretKey) {
      throw new Error(
        "亿美短信配置缺失：请在 .env 中配置 EMAY_APP_ID 和 EMAY_SECRET_KEY",
      );
    }

    client = new EmaySmsClient({
      appId,
      secretKey,
      host,
      port,
      timeout: 30000,
    });

    console.log("[EmaySmsService] 客户端已初始化", { host, port });
  }

  return client;
}

/**
 * 短信发送结果
 */
export interface SmsSendResult {
  success: boolean;
  smsId?: string;
  code: string;
  message: string;
}

/**
 * 批量发送结果
 */
export interface SmsBatchSendResult {
  success: boolean;
  successCount: number;
  failCount: number;
  results: Array<{
    mobile: string;
    smsId?: string;
    success: boolean;
  }>;
  code: string;
  message: string;
}

/**
 * 亿美短信服务类
 */
class EmaySmsService {
  /**
   * 发送单条短信
   */
  async sendSms(
    mobile: string,
    content: string,
    customSmsId?: string,
  ): Promise<SmsSendResult> {
    try {
      const smsClient = getClient();

      console.log("[EmaySmsService] 发送短信:", {
        mobile,
        contentLength: content.length,
      });

      const result = await smsClient.sendSingleSms({
        mobile,
        content,
        customSmsId,
      });

      if (isSuccess(result)) {
        console.log("[EmaySmsService] 发送成功:", result.result);
        return {
          success: true,
          smsId: result.result?.smsId,
          code: result.code,
          message: "发送成功",
        };
      } else {
        console.error("[EmaySmsService] 发送失败:", result.code);
        return {
          success: false,
          code: result.code,
          message: ERROR_CODES[result.code] ?? `发送失败: ${result.code}`,
        };
      }
    } catch (error) {
      console.error("[EmaySmsService] 发送异常:", error);
      return {
        success: false,
        code: "EXCEPTION",
        message: error instanceof Error ? error.message : "发送异常",
      };
    }
  }

  /**
   * 批量发送短信（相同内容）
   */
  async sendBatchSms(
    mobiles: string[],
    content: string,
  ): Promise<SmsBatchSendResult> {
    try {
      const smsClient = getClient();

      console.log("[EmaySmsService] 批量发送:", { count: mobiles.length });

      const result = await smsClient.sendBatchOnlySms({
        mobiles,
        content,
      });

      if (isSuccess(result) && result.result) {
        const results = result.result.map((r) => ({
          mobile: r.mobile ?? "",
          smsId: r.smsId,
          success: !!r.smsId,
        }));

        const successCount = results.filter((r) => r.success).length;

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
          results: mobiles.map((m) => ({ mobile: m, success: false })),
          code: result.code,
          message: ERROR_CODES[result.code] ?? `发送失败: ${result.code}`,
        };
      }
    } catch (error) {
      console.error("[EmaySmsService] 批量发送异常:", error);
      return {
        success: false,
        successCount: 0,
        failCount: mobiles.length,
        results: mobiles.map((m) => ({ mobile: m, success: false })),
        code: "EXCEPTION",
        message: error instanceof Error ? error.message : "发送异常",
      };
    }
  }

  /**
   * 发送个性化短信（不同内容）
   */
  async sendPersonalitySms(
    messages: Array<{ mobile: string; content: string; customSmsId?: string }>,
  ): Promise<SmsBatchSendResult> {
    try {
      const smsClient = getClient();

      console.log("[EmaySmsService] 个性化发送:", { count: messages.length });

      const result = await smsClient.sendPersonalitySms({
        smses: messages.map((m) => ({
          mobile: m.mobile,
          content: m.content,
          customSmsId: m.customSmsId,
        })),
      });

      if (isSuccess(result) && result.result) {
        const results = result.result.map((r, i) => ({
          mobile: r.mobile ?? messages[i]?.mobile ?? "",
          smsId: r.smsId,
          success: !!r.smsId,
        }));

        const successCount = results.filter((r) => r.success).length;

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
          results: messages.map((m) => ({ mobile: m.mobile, success: false })),
          code: result.code,
          message: ERROR_CODES[result.code] ?? `发送失败: ${result.code}`,
        };
      }
    } catch (error) {
      console.error("[EmaySmsService] 个性化发送异常:", error);
      return {
        success: false,
        successCount: 0,
        failCount: messages.length,
        results: messages.map((m) => ({ mobile: m.mobile, success: false })),
        code: "EXCEPTION",
        message: error instanceof Error ? error.message : "发送异常",
      };
    }
  }

  /**
   * 查询账户余额
   */
  async getBalance(): Promise<{
    success: boolean;
    balance?: number;
    code: string;
    message: string;
  }> {
    try {
      const smsClient = getClient();
      const result = await smsClient.getBalance();

      if (isSuccess(result) && result.result) {
        return {
          success: true,
          balance: result.result.balance,
          code: result.code,
          message: "查询成功",
        };
      } else {
        return {
          success: false,
          code: result.code,
          message: ERROR_CODES[result.code] ?? `查询失败: ${result.code}`,
        };
      }
    } catch (error) {
      console.error("[EmaySmsService] 查询余额异常:", error);
      return {
        success: false,
        code: "EXCEPTION",
        message: error instanceof Error ? error.message : "查询异常",
      };
    }
  }

  /**
   * 获取状态报告
   */
  async getReports(number = 500): Promise<{
    success: boolean;
    reports?: ReportResponse[];
    code: string;
    message: string;
  }> {
    try {
      const smsClient = getClient();
      const result = await smsClient.getReport({
        number: Math.min(number, 500),
      });

      if (isSuccess(result)) {
        return {
          success: true,
          reports: result.result ?? [],
          code: result.code,
          message: "查询成功",
        };
      } else {
        return {
          success: false,
          code: result.code,
          message: ERROR_CODES[result.code] ?? `查询失败: ${result.code}`,
        };
      }
    } catch (error) {
      console.error("[EmaySmsService] 获取状态报告异常:", error);
      return {
        success: false,
        code: "EXCEPTION",
        message: error instanceof Error ? error.message : "查询异常",
      };
    }
  }

  /**
   * 发送验证码短信
   */
  async sendVerifyCode(
    mobile: string,
    code: string,
    signName = "恒德能源",
    expireMinutes = 5,
  ): Promise<SmsSendResult> {
    const content = `【${signName}】您的验证码是：${code}，${expireMinutes}分钟内有效，请勿泄露给他人。`;
    return this.sendSms(mobile, content);
  }

  /**
   * 发送通知短信
   */
  async sendNotification(
    mobile: string,
    message: string,
    signName = "恒德能源",
  ): Promise<SmsSendResult> {
    const content = `【${signName}】${message}`;
    return this.sendSms(mobile, content);
  }
}

// 导出单例服务
export const emaySmsService = new EmaySmsService();
