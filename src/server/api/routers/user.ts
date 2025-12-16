import { z } from "zod";
import { eq, like, and, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  // 获取用户列表
  list: protectedProcedure
    .input(
      z.object({
        keyword: z.string().optional(),
        roleId: z.number().optional(),
        status: z.number().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { keyword, roleId, status, page, pageSize } = input;
      const conditions = [];

      if (keyword) {
        conditions.push(like(users.username, `%${keyword}%`));
      }
      if (roleId !== undefined) {
        conditions.push(eq(users.roleId, roleId));
      }
      if (status !== undefined) {
        conditions.push(eq(users.status, status));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const list = await ctx.db.query.users.findMany({
        where,
        with: { role: true },
        orderBy: [desc(users.createdAt)],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      // 简单计数
      const allUsers = await ctx.db.query.users.findMany({ where });
      const total = allUsers.length;

      return { list, total, page, pageSize };
    }),

  // 获取单个用户
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
        with: { role: true },
      });
    }),

  // 创建用户
  create: protectedProcedure
    .input(
      z.object({
        username: z.string().min(2),
        password: z.string().min(6),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        roleId: z.number().optional(),
        status: z.number().default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      await ctx.db.insert(users).values({
        ...input,
        password: hashedPassword,
      });
      return { success: true };
    }),

  // 更新用户
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        username: z.string().min(2).optional(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        roleId: z.number().optional(),
        status: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await ctx.db.update(users).set(data).where(eq(users.id, id));
      return { success: true };
    }),

  // 重置密码
  resetPassword: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      await ctx.db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, input.id));
      return { success: true };
    }),

  // 删除用户
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(users).where(eq(users.id, input.id));
      return { success: true };
    }),
});
