/**
 * 短信数据访问层
 */

import { eq, like, and, desc, sql } from "drizzle-orm";
import { type MySql2Database } from "drizzle-orm/mysql2";
import { smsTemplates, smsRecords } from "~/server/db/schema";
import type * as schema from "~/server/db/schema";
import type { TemplateVariable } from "~/server/db/schema";

type DB = MySql2Database<typeof schema>;

// ============ 模板相关 ============

export interface TemplateFindManyOptions {
  keyword?: string;
  status?: "active" | "inactive" | "pending";
  page?: number;
  pageSize?: number;
}

export interface TemplateCreateData {
  id: string;
  name: string;
  code: string;
  content: string;
  variables?: TemplateVariable[];
  description?: string;
  status?: "active" | "inactive" | "pending";
  createdBy?: string;
}

export interface TemplateUpdateData {
  name?: string;
  code?: string;
  content?: string;
  variables?: TemplateVariable[];
  description?: string;
  status?: "active" | "inactive" | "pending";
}

// ============ 记录相关 ============

export interface RecordFindManyOptions {
  status?: "pending" | "success" | "failed";
  mobile?: string;
  limit?: number;
}

export interface RecordCreateData {
  id: string;
  templateId?: string;
  templateCode?: string;
  templateName?: string;
  mobile: string;
  content: string;
  variables?: Record<string, string>;
  status?: "pending" | "success" | "failed";
  createdBy?: string;
}

export interface RecordUpdateData {
  status?: "pending" | "success" | "failed";
  smsId?: string;
  errorMsg?: string | null;
  sentAt?: Date;
}

export const smsRepository = {
  // ============ 模板操作 ============

  /**
   * 查询模板列表
   */
  async findManyTemplates(db: DB, options: TemplateFindManyOptions = {}) {
    const { keyword, status, page, pageSize } = options;
    const conditions = [];

    if (keyword) {
      conditions.push(like(smsTemplates.name, `%${keyword}%`));
    }
    if (status) {
      conditions.push(eq(smsTemplates.status, status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    if (page && pageSize) {
      return db.query.smsTemplates.findMany({
        where,
        orderBy: [desc(smsTemplates.createdAt)],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
    }

    return db.query.smsTemplates.findMany({
      where,
      orderBy: [desc(smsTemplates.createdAt)],
    });
  },

  /**
   * 根据ID查询模板
   */
  async findTemplateById(db: DB, id: string) {
    return db.query.smsTemplates.findFirst({
      where: eq(smsTemplates.id, id),
    });
  },

  /**
   * 根据编码查询模板
   */
  async findTemplateByCode(db: DB, code: string) {
    return db.query.smsTemplates.findFirst({
      where: eq(smsTemplates.code, code),
    });
  },

  /**
   * 创建模板
   */
  async createTemplate(db: DB, data: TemplateCreateData) {
    await db.insert(smsTemplates).values(data);
  },

  /**
   * 更新模板
   */
  async updateTemplate(db: DB, id: string, data: TemplateUpdateData) {
    await db.update(smsTemplates).set(data).where(eq(smsTemplates.id, id));
  },

  /**
   * 删除模板
   */
  async deleteTemplate(db: DB, id: string) {
    await db.delete(smsTemplates).where(eq(smsTemplates.id, id));
  },

  // ============ 记录操作 ============

  /**
   * 查询发送记录
   */
  async findManyRecords(db: DB, options: RecordFindManyOptions = {}) {
    const { status, mobile, limit = 50 } = options;
    const conditions = [];

    if (status) {
      conditions.push(eq(smsRecords.status, status));
    }
    if (mobile) {
      conditions.push(like(smsRecords.mobile, `%${mobile}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    return db.query.smsRecords.findMany({
      where,
      orderBy: [desc(smsRecords.createdAt)],
      limit,
    });
  },

  /**
   * 根据ID查询记录
   */
  async findRecordById(db: DB, id: string) {
    return db.query.smsRecords.findFirst({
      where: eq(smsRecords.id, id),
    });
  },

  /**
   * 创建发送记录
   */
  async createRecord(db: DB, data: RecordCreateData) {
    await db.insert(smsRecords).values(data);
  },

  /**
   * 更新发送记录
   */
  async updateRecord(db: DB, id: string, data: RecordUpdateData) {
    await db.update(smsRecords).set(data).where(eq(smsRecords.id, id));
  },

  /**
   * 获取今日统计
   */
  async getTodayStats(db: DB) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allRecords = await db.query.smsRecords.findMany();
    const todayRecords = allRecords.filter(
      (r) => new Date(r.createdAt) >= today,
    );

    return {
      total: todayRecords.length,
      success: todayRecords.filter((r) => r.status === "success").length,
      failed: todayRecords.filter((r) => r.status === "failed").length,
      pending: todayRecords.filter((r) => r.status === "pending").length,
    };
  },
};
