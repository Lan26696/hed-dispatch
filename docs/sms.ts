/**
 * 短信服务
 * 处理短信模板和发送
 * 支持亿美软通、阿里云、腾讯云等短信服务商
 */

import { smsTemplateDb, smsRecordDb } from '../db/client';
import { SmsTemplate, SmsRecord, SmsType } from '../types';
import { logger } from './logger';
import { EmaySmsClient, isSuccess, ResultCode } from '../sms-sdk';

// 短信服务配置
interface SmsConfig {
  provider: 'emay' | 'aliyun' | 'tencent' | 'mock';
  // 亿美软通配置
  emayAppId?: string;
  emaySecretKey?: string;
  emayHost?: string;
  emayPort?: number;
  // 阿里云配置
  accessKeyId?: string;
  accessKeySecret?: string;
  signName?: string;
}

// 亿美短信客户端单例
let emayClient: EmaySmsClient | null = null;

// 获取亿美短信客户端
function getEmayClient(config: SmsConfig): EmaySmsClient {
  if (!emayClient && config.emayAppId && config.emaySecretKey) {
    emayClient = new EmaySmsClient({
      appId: config.emayAppId,
      secretKey: config.emaySecretKey,
      host: config.emayHost,
      port: config.emayPort,
    });
  }
  if (!emayClient) {
    throw new Error('亿美短信服务未正确配置，请检查 EMAY_APP_ID 和 EMAY_SECRET_KEY');
  }
  return emayClient;
}

// 获取短信配置
function getSmsConfig(): SmsConfig {
  return {
    provider: (process.env.SMS_PROVIDER as SmsConfig['provider']) || 'mock',
    // 亿美软通配置
    emayAppId: process.env.EMAY_APP_ID,
    emaySecretKey: process.env.EMAY_SECRET_KEY,
    emayHost: process.env.EMAY_HOST,
    emayPort: process.env.EMAY_PORT ? parseInt(process.env.EMAY_PORT, 10) : undefined,
    // 阿里云配置
    accessKeyId: process.env.SMS_ACCESS_KEY_ID,
    accessKeySecret: process.env.SMS_ACCESS_KEY_SECRET,
    signName: process.env.SMS_SIGN_NAME || 'CNG调度系统',
  };
}

class SmsService {
  /**
   * 发送预约成功短信
   */
  async sendReservationSuccess(params: {
    phone: string;
    driverName: string;
    appointmentTime: string;
    stationName: string;
    vehiclePlate: string;
    capacity: string;
  }): Promise<SmsRecord> {
    return this.sendByTemplateCode('RESERVATION_SUCCESS', params.phone, {
      driverName: params.driverName,
      appointmentTime: params.appointmentTime,
      stationName: params.stationName,
      vehiclePlate: params.vehiclePlate,
      capacity: params.capacity,
    });
  }

  /**
   * 发送调度调整短信
   */
  async sendDispatchAdjustment(params: {
    phone: string;
    driverName: string;
    originalTime: string;
    suggestedTime: string;
    dispatcherPhone: string;
  }): Promise<SmsRecord> {
    return this.sendByTemplateCode('DISPATCH_ADJUSTMENT', params.phone, {
      driverName: params.driverName,
      originalTime: params.originalTime,
      suggestedTime: params.suggestedTime,
      dispatcherPhone: params.dispatcherPhone,
    });
  }

  /**
   * 发送场站提醒短信
   */
  async sendStationAlert(params: {
    phone: string;
    stationName: string;
    hour: string;
    scheduledAmount: string;
    plannedAmount: string;
    deviation: string;
  }): Promise<SmsRecord> {
    return this.sendByTemplateCode('STATION_ALERT', params.phone, {
      stationName: params.stationName,
      hour: params.hour,
      scheduledAmount: params.scheduledAmount,
      plannedAmount: params.plannedAmount,
      deviation: params.deviation,
    });
  }

  /**
   * 通过模板代码发送短信
   */
  async sendByTemplateCode(
    templateCode: string,
    phone: string,
    variables: Record<string, string>
  ): Promise<SmsRecord> {
    // 获取模板
    const template = await smsTemplateDb.findByCode(templateCode);
    if (!template) {
      throw new Error(`短信模板不存在: ${templateCode}`);
    }

    // 渲染短信内容
    const content = this.renderTemplate(template.content, variables);

    // 创建短信记录
    const record = await smsRecordDb.create({
      templateId: template.id,
      phone,
      content,
      variables,
      status: 'pending',
    });

    // 发送短信
    try {
      await this.send(phone, content, template);
      
      // 更新记录状态
      await smsRecordDb.update(record.id, {
        status: 'sent',
        sentAt: new Date(),
      });

      // 记录日志
      await logger.info({
        action: 'sms_sent',
        resource: 'sms_record',
        resourceId: record.id,
        details: { phone, templateCode, variables },
      });

      return { ...record, status: 'sent', sentAt: new Date() };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '发送失败';
      
      // 更新记录状态
      await smsRecordDb.update(record.id, {
        status: 'failed',
        errorMessage,
      });

      // 记录错误日志
      await logger.error({
        action: 'sms_failed',
        resource: 'sms_record',
        resourceId: record.id,
        details: { phone, templateCode, error: errorMessage },
      });

      return { ...record, status: 'failed', errorMessage };
    }
  }

  /**
   * 渲染模板内容
   */
  private renderTemplate(template: string, variables: Record<string, string>): string {
    let content = template;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    }
    return content;
  }

  /**
   * 发送短信（实际调用短信服务商API）
   */
  private async send(phone: string, content: string, template: SmsTemplate): Promise<void> {
    const config = getSmsConfig();

    switch (config.provider) {
      case 'emay':
        await this.sendViaEmay(phone, content, config);
        break;
      case 'aliyun':
        await this.sendViaAliyun(phone, template.code, config);
        break;
      case 'tencent':
        await this.sendViaTencent(phone, content, config);
        break;
      case 'mock':
      default:
        // 模拟发送（开发环境）
        console.log(`[SMS Mock] 发送短信到 ${phone}:`);
        console.log(`[SMS Mock] 内容: ${content}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        break;
    }
  }

  /**
   * 亿美软通短信发送
   */
  private async sendViaEmay(
    phone: string,
    content: string,
    config: SmsConfig
  ): Promise<void> {
    const client = getEmayClient(config);
    
    const result = await client.sendSingleSms({
      mobile: phone,
      content: content,
    });

    if (!isSuccess(result)) {
      console.error(`[Emay SMS] 发送失败，错误码: ${result.code}`);
      throw new Error(`亿美短信发送失败: ${result.code}`);
    }

    console.log(`[Emay SMS] 发送成功，smsId: ${result.result?.smsId}`);
  }

  /**
   * 阿里云短信发送
   */
  private async sendViaAliyun(
    phone: string, 
    templateCode: string, 
    config: SmsConfig
  ): Promise<void> {
    // TODO: 实现阿里云短信API调用
    // 需要安装 @alicloud/dysmsapi20170525 包
    console.log(`[Aliyun SMS] 发送到 ${phone}, 模板: ${templateCode}`);
    throw new Error('阿里云短信服务尚未配置');
  }

  /**
   * 腾讯云短信发送
   */
  private async sendViaTencent(
    phone: string, 
    content: string, 
    config: SmsConfig
  ): Promise<void> {
    // TODO: 实现腾讯云短信API调用
    // 需要安装 tencentcloud-sdk-nodejs 包
    console.log(`[Tencent SMS] 发送到 ${phone}`);
    throw new Error('腾讯云短信服务尚未配置');
  }

  /**
   * 获取所有短信模板
   */
  async getTemplates(): Promise<SmsTemplate[]> {
    return smsTemplateDb.findAll();
  }

  /**
   * 获取短信发送记录
   */
  async getRecords(filters?: { phone?: string; status?: string }): Promise<SmsRecord[]> {
    return smsRecordDb.findAll(filters);
  }
}

// 导出单例
export const smsService = new SmsService();

