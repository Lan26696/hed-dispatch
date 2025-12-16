/**
 * 用户路由（Controller层）
 * 职责：入参校验、调用Service
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { userService } from "~/server/services";

// 入参 Schema 定义
const listInputSchema = z.object({
  keyword: z.string().optional(),
  roleId: z.number().optional(),
  status: z.number().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(10),
});

const createInputSchema = z.object({
  username: z.string().min(2, "用户名至少2个字符"),
  password: z.string().min(6, "密码至少6个字符"),
  name: z.string().optional(),
  email: z.string().email("邮箱格式不正确").optional(),
  phone: z.string().optional(),
  roleId: z.number().optional(),
  status: z.number().default(1),
});

const updateInputSchema = z.object({
  id: z.string(),
  username: z.string().min(2).optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  roleId: z.number().optional(),
  status: z.number().optional(),
});

const resetPasswordSchema = z.object({
  id: z.string(),
  password: z.string().min(6, "密码至少6个字符"),
});

const idSchema = z.object({ id: z.string() });

export const userRouter = createTRPCRouter({
  // 获取用户列表
  list: protectedProcedure
    .input(listInputSchema)
    .query(({ ctx, input }) => userService.list(ctx.db, input)),

  // 获取单个用户
  getById: protectedProcedure
    .input(idSchema)
    .query(({ ctx, input }) => userService.getById(ctx.db, input.id)),

  // 创建用户
  create: protectedProcedure
    .input(createInputSchema)
    .mutation(({ ctx, input }) => userService.create(ctx.db, input)),

  // 更新用户
  update: protectedProcedure
    .input(updateInputSchema)
    .mutation(({ ctx, input }) => userService.update(ctx.db, input)),

  // 重置密码
  resetPassword: protectedProcedure
    .input(resetPasswordSchema)
    .mutation(({ ctx, input }) =>
      userService.resetPassword(ctx.db, input.id, input.password),
    ),

  // 删除用户
  delete: protectedProcedure
    .input(idSchema)
    .mutation(({ ctx, input }) => userService.delete(ctx.db, input.id)),
});
