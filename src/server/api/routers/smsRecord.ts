import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { smsRecords, smsTemplates } from "~/server/db/schema";
import { eq, desc, and, like, sql } from "drizzle-orm";
import { emaySmsService } from "~/lib/services/emay-sms";

export const smsRecordRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          status: z.string().optional(),
          mobile: z.string().optional(),
          limit: z.number().default(50),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input?.status) {
        conditions.push(
          eq(
            smsRecords.status,
            input.status as "pending" | "success" | "failed",
          ),
        );
      }
      if (input?.mobile) {
        conditions.push(like(smsRecords.mobile, `%${input.mobile}%`));
      }

      const records = await ctx.db.query.smsRecords.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: [desc(smsRecords.createdAt)],
        limit: input?.limit ?? 50,
      });

      return records;
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    // 获取今日开始时间（本地时区）
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 获取所有记录，在应用层过滤今日数据
    const allRecords = await ctx.db.query.smsRecords.findMany();
    const todayRecords = allRecords.filter(
      (r) => new Date(r.createdAt) >= today,
    );

    const stats = {
      total: todayRecords.length,
      success: todayRecords.filter((r) => r.status === "success").length,
      failed: todayRecords.filter((r) => r.status === "failed").length,
      pending: todayRecords.filter((r) => r.status === "pending").length,
    };

    return stats;
  }),

  send: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        mobile: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确"),
        variables: z.record(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 获取模板
      const template = await ctx.db.query.smsTemplates.findFirst({
        where: eq(smsTemplates.id, input.templateId),
      });

      if (!template) {
        throw new Error("模板不存在");
      }

      if (template.status !== "active") {
        throw new Error("模板未启用");
      }

      // 渲染内容
      let content = template.content;
      if (input.variables) {
        for (const [key, value] of Object.entries(input.variables)) {
          content = content.replace(new RegExp(`\\{${key}\\}`, "g"), value);
        }
      }

      // 添加签名
      if (!content.startsWith("【")) {
        content = `【恒德能源】${content}`;
      }

      // 创建记录
      const recordId = `REC_${Date.now()}`;
      await ctx.db.insert(smsRecords).values({
        id: recordId,
        templateId: template.id,
        templateCode: template.code,
        templateName: template.name,
        mobile: input.mobile,
        content,
        variables: input.variables,
        status: "pending",
        createdBy: ctx.session.user.id,
      });

      // 发送短信
      try {
        const result = await emaySmsService.sendSms(input.mobile, content);

        if (result.success) {
          await ctx.db
            .update(smsRecords)
            .set({
              status: "success",
              smsId: result.smsId,
              sentAt: new Date(),
            })
            .where(eq(smsRecords.id, recordId));
        } else {
          await ctx.db
            .update(smsRecords)
            .set({
              status: "failed",
              errorMsg: result.message,
            })
            .where(eq(smsRecords.id, recordId));

          throw new Error(result.message);
        }

        return { success: true, recordId };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "发送失败";
        await ctx.db
          .update(smsRecords)
          .set({
            status: "failed",
            errorMsg,
          })
          .where(eq(smsRecords.id, recordId));

        throw new Error(errorMsg);
      }
    }),

  resend: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.query.smsRecords.findFirst({
        where: eq(smsRecords.id, input.id),
      });

      if (!record) {
        throw new Error("记录不存在");
      }

      // 更新状态为发送中
      await ctx.db
        .update(smsRecords)
        .set({ status: "pending", errorMsg: null })
        .where(eq(smsRecords.id, input.id));

      // 重新发送
      try {
        const result = await emaySmsService.sendSms(
          record.mobile,
          record.content,
        );

        if (result.success) {
          await ctx.db
            .update(smsRecords)
            .set({
              status: "success",
              smsId: result.smsId,
              sentAt: new Date(),
            })
            .where(eq(smsRecords.id, input.id));
        } else {
          await ctx.db
            .update(smsRecords)
            .set({
              status: "failed",
              errorMsg: result.message,
            })
            .where(eq(smsRecords.id, input.id));

          throw new Error(result.message);
        }

        return { success: true };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "发送失败";
        await ctx.db
          .update(smsRecords)
          .set({
            status: "failed",
            errorMsg,
          })
          .where(eq(smsRecords.id, input.id));

        throw new Error(errorMsg);
      }
    }),
});
