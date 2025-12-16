import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { smsTemplates, type TemplateVariable } from "~/server/db/schema";
import { eq } from "drizzle-orm";

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

export const smsTemplateRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const templates = await ctx.db.query.smsTemplates.findMany({
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
    return templates;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.db.query.smsTemplates.findFirst({
        where: eq(smsTemplates.id, input.id),
      });
      return template;
    }),

  getByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.db.query.smsTemplates.findFirst({
        where: eq(smsTemplates.code, input.code),
      });
      return template;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        content: z.string().min(1),
        description: z.string().optional(),
        variables: z
          .array(z.object({ key: z.string(), label: z.string() }))
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 如果没有传入变量，自动从内容中提取
      const variables = input.variables ?? extractVariables(input.content);

      const id = `SMS_${Date.now()}`;
      await ctx.db.insert(smsTemplates).values({
        id,
        name: input.name,
        code: input.code,
        content: input.content,
        variables,
        description: input.description,
        status: "active",
        createdBy: ctx.session.user.id,
      });

      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        code: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(["active", "inactive", "pending"]).optional(),
        variables: z
          .array(z.object({ key: z.string(), label: z.string() }))
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, content, variables, ...rest } = input;

      const updateData: Record<string, unknown> = { ...rest };

      if (content) {
        updateData.content = content;
        // 如果没有传入变量，重新从内容中提取
        updateData.variables = variables ?? extractVariables(content);
      } else if (variables) {
        updateData.variables = variables;
      }

      await ctx.db
        .update(smsTemplates)
        .set(updateData)
        .where(eq(smsTemplates.id, id));

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(smsTemplates).where(eq(smsTemplates.id, input.id));
      return { success: true };
    }),

  // 获取变量的中文映射表
  getVariableLabels: protectedProcedure.query(() => {
    return VARIABLE_LABELS;
  }),
});
