/**
 * 短信发送记录路由（Controller层）
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { smsService } from "~/server/services";

// 入参 Schema 定义
const listInputSchema = z
  .object({
    status: z.enum(["pending", "success", "failed"]).optional(),
    mobile: z.string().optional(),
    limit: z.number().default(50),
  })
  .optional();

const sendInputSchema = z.object({
  templateId: z.string(),
  mobile: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确"),
  variables: z.record(z.string()).optional(),
});

const idSchema = z.object({ id: z.string() });

export const smsRecordRouter = createTRPCRouter({
  // 获取发送记录
  list: protectedProcedure
    .input(listInputSchema)
    .query(({ ctx, input }) => smsService.listRecords(ctx.db, input ?? {})),

  // 获取今日统计
  stats: protectedProcedure.query(({ ctx }) => smsService.getStats(ctx.db)),

  // 发送短信
  send: protectedProcedure.input(sendInputSchema).mutation(({ ctx, input }) =>
    smsService.send(ctx.db, {
      ...input,
      createdBy: ctx.session.user.id,
    }),
  ),

  // 重发短信
  resend: protectedProcedure
    .input(idSchema)
    .mutation(({ ctx, input }) => smsService.resend(ctx.db, input.id)),
});
