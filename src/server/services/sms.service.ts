/**
 * 短信服务层
 */

import { type MySql2Database } from "drizzle-orm/mysql2";
import type * as schema from "~/server/db/schema";
import {
  smsRepository,
  type TemplateFindManyOptions,
  type RecordFindManyOptions,
} from "~/server/repositories";
import { emaySmsService } from "~/lib/services/emay-sms";

type DB = MySql2Database<typeof schema>;

export interface TemplateCreateInput {
  name: string;
  code: string;
  content: string;
  variables?: { key: string; label: string }[];
  description?: string;
  status?: "active" | "inactive" | "pending";
  createdBy?: string;
}

export interface TemplateUpdateInput {
  id: string;
  name?: string;
  code?: string;
  content?: string;
  variables?: { key: string; label: string }[];
  description?: string;
  status?: "active" | "inactive" | "pending";
}

export interface SendSmsInput {
  templateId: string;
  mobile: string;
  variables?: Record<string, string>;
  createdBy?: string;
}

export const smsService = {
  // ============ 模板相关 ============

  /**
   * 获取模板列表
   */
  async listTemplates(db: DB, input: TemplateFindManyOptions = {}) {
    return smsRepository.findManyTemplates(db, input);
  },

  /**
   * 获取单个模板
   */
  async getTemplateById(db: DB, id: string) {
    return smsRepository.findTemplateById(db, id);
  },

  /**
   * 创建模板
   */
  async createTemplate(db: DB, input: TemplateCreateInput) {
    // 检查编码是否已存在
    const exists = await smsRepository.findTemplateByCode(db, input.code);
    if (exists) {
      throw new Error("模板编码已存在");
    }

    const id = `TPL_${Date.now()}`;
    await smsRepository.createTemplate(db, { id, ...input });
    return { success: true, id };
  },

  /**
   * 更新模板
   */
  async updateTemplate(db: DB, input: TemplateUpdateInput) {
    const { id, ...data } = input;

    // 如果修改编码，检查是否重复
    if (data.code) {
      const exists = await smsRepository.findTemplateByCode(db, data.code);
      if (exists && exists.id !== id) {
        throw new Error("模板编码已存在");
      }
    }

    await smsRepository.updateTemplate(db, id, data);
    return { success: true };
  },

  /**
   * 删除模板
   */
  async deleteTemplate(db: DB, id: string) {
    await smsRepository.deleteTemplate(db, id);
    return { success: true };
  },

  // ============ 发送记录相关 ============

  /**
   * 获取发送记录
   */
  async listRecords(db: DB, input: RecordFindManyOptions = {}) {
    return smsRepository.findManyRecords(db, input);
  },

  /**
   * 获取今日统计
   */
  async getStats(db: DB) {
    return smsRepository.getTodayStats(db);
  },

  /**
   * 发送短信
   */
  async send(db: DB, input: SendSmsInput) {
    const { templateId, mobile, variables, createdBy } = input;

    // 获取模板
    const template = await smsRepository.findTemplateById(db, templateId);
    if (!template) {
      throw new Error("模板不存在");
    }
    if (template.status !== "active") {
      throw new Error("模板未启用");
    }

    // 渲染内容
    let content = template.content;
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`\\{${key}\\}`, "g"), value);
      }
    }

    // 添加签名
    if (!content.startsWith("【")) {
      content = `【恒德能源】${content}`;
    }

    // 创建记录
    const recordId = `REC_${Date.now()}`;
    await smsRepository.createRecord(db, {
      id: recordId,
      templateId: template.id,
      templateCode: template.code,
      templateName: template.name,
      mobile,
      content,
      variables,
      status: "pending",
      createdBy,
    });

    // 发送短信
    try {
      const result = await emaySmsService.sendSms(mobile, content);

      if (result.success) {
        await smsRepository.updateRecord(db, recordId, {
          status: "success",
          smsId: result.smsId,
          sentAt: new Date(),
        });
      } else {
        await smsRepository.updateRecord(db, recordId, {
          status: "failed",
          errorMsg: result.message,
        });
        throw new Error(result.message);
      }

      return { success: true, recordId };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "发送失败";
      await smsRepository.updateRecord(db, recordId, {
        status: "failed",
        errorMsg,
      });
      throw new Error(errorMsg);
    }
  },

  /**
   * 重发短信
   */
  async resend(db: DB, id: string) {
    const record = await smsRepository.findRecordById(db, id);
    if (!record) {
      throw new Error("记录不存在");
    }

    // 更新状态为发送中
    await smsRepository.updateRecord(db, id, {
      status: "pending",
      errorMsg: null,
    });

    // 重新发送
    try {
      const result = await emaySmsService.sendSms(
        record.mobile,
        record.content,
      );

      if (result.success) {
        await smsRepository.updateRecord(db, id, {
          status: "success",
          smsId: result.smsId,
          sentAt: new Date(),
        });
      } else {
        await smsRepository.updateRecord(db, id, {
          status: "failed",
          errorMsg: result.message,
        });
        throw new Error(result.message);
      }

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "发送失败";
      await smsRepository.updateRecord(db, id, {
        status: "failed",
        errorMsg,
      });
      throw new Error(errorMsg);
    }
  },
};
