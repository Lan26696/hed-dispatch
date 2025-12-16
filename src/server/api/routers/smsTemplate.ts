/**
 * 短信模板路由（Controller层）
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { smsService } from "~/server/services";
import type { TemplateVariable } from "~/server/db/schema";

// 常用变量的中文映射
const VARIABLE_LABELS: Record<string, string> = {
  driver_name: "司机姓名",
  order_no: "调度单号",
  time: "时间",
  station_name: "场站名称",
  vehicle_plate: "车牌号",
  amount: "装卸量",
  reason: "原因",
  new_time: "新时间",
  direction: "方向",
  deviation: "偏差量",
  appointment_time: "预约时间",
  quantity: "计划量",
  code: "验证码",
  expire_minutes: "有效期",
};

// 从内容中提取变量并生成带中文别名的变量列表
function extractVariables(content: string): TemplateVariable[] {
  const matches = content.match(/\{(\w+)\}/g);
  if (!matches) return [];

  const keys = [...new Set(matches.map((m) => m.slice(1, -1)))];
  return keys.map((key) => ({
    key,
    label: VARIABLE_LABELS[key] ?? key,
  }));
}

// 入参 Schema 定义
const variableSchema = z.object({ key: z.string(), label: z.string() });

const createInputSchema = z.object({
  name: z.string().min(1, "模板名称不能为空"),
  code: z.string().min(1, "模板编码不能为空"),
  content: z.string().min(1, "模板内容不能为空"),
  description: z.string().optional(),
  variables: z.array(variableSchema).optional(),
});

const updateInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  variables: z.array(variableSchema).optional(),
});

const idSchema = z.object({ id: z.string() });
const codeSchema = z.object({ code: z.string() });

export const smsTemplateRouter = createTRPCRouter({
  // 获取模板列表
  list: protectedProcedure.query(({ ctx }) => smsService.listTemplates(ctx.db)),

  // 根据ID获取模板
  getById: protectedProcedure
    .input(idSchema)
    .query(({ ctx, input }) => smsService.getTemplateById(ctx.db, input.id)),

  // 根据编码获取模板
  getByCode: protectedProcedure
    .input(codeSchema)
    .query(async ({ ctx, input }) => {
      const templates = await smsService.listTemplates(ctx.db);
      return templates.find((t) => t.code === input.code);
    }),

  // 创建模板
  create: protectedProcedure
    .input(createInputSchema)
    .mutation(({ ctx, input }) => {
      // 如果没有传入变量，自动从内容中提取
      const variables = input.variables ?? extractVariables(input.content);
      return smsService.createTemplate(ctx.db, {
        ...input,
        variables,
        status: "active",
        createdBy: ctx.session.user.id,
      });
    }),

  // 更新模板
  update: protectedProcedure
    .input(updateInputSchema)
    .mutation(({ ctx, input }) => {
      const { content, variables, ...rest } = input;

      // 如果更新了内容但没有传入变量，重新提取
      const finalVariables =
        content && !variables ? extractVariables(content) : variables;

      return smsService.updateTemplate(ctx.db, {
        ...rest,
        content,
        variables: finalVariables,
      });
    }),

  // 删除模板
  delete: protectedProcedure
    .input(idSchema)
    .mutation(({ ctx, input }) => smsService.deleteTemplate(ctx.db, input.id)),

  // 获取变量的中文映射表
  getVariableLabels: protectedProcedure.query(() => VARIABLE_LABELS),
});
