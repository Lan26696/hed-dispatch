import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { roles, roleMenus } from "~/server/db/schema";

export const roleRouter = createTRPCRouter({
  // 获取角色列表
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.roles.findMany({
      orderBy: [desc(roles.createdAt)],
      with: { roleMenus: true },
    });
  }),

  // 获取所有角色（下拉选择用）
  all: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.roles.findMany({
      where: eq(roles.status, 1),
    });
  }),

  // 获取单个角色
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.roles.findFirst({
        where: eq(roles.id, input.id),
        with: { roleMenus: true },
      });
    }),

  // 创建角色
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        description: z.string().optional(),
        status: z.number().default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(roles).values(input);
      return { success: true };
    }),

  // 更新角色
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        code: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await ctx.db.update(roles).set(data).where(eq(roles.id, id));
      return { success: true };
    }),

  // 删除角色
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // 先删除角色菜单关联
      await ctx.db.delete(roleMenus).where(eq(roleMenus.roleId, input.id));
      // 再删除角色
      await ctx.db.delete(roles).where(eq(roles.id, input.id));
      return { success: true };
    }),

  // 分配菜单权限
  assignMenus: protectedProcedure
    .input(
      z.object({
        roleId: z.number(),
        menuIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { roleId, menuIds } = input;
      // 先删除原有权限
      await ctx.db.delete(roleMenus).where(eq(roleMenus.roleId, roleId));
      // 再添加新权限
      if (menuIds.length > 0) {
        await ctx.db
          .insert(roleMenus)
          .values(menuIds.map((menuId) => ({ roleId, menuId })));
      }
      return { success: true };
    }),

  // 获取角色的菜单ID列表
  getMenuIds: protectedProcedure
    .input(z.object({ roleId: z.number() }))
    .query(async ({ ctx, input }) => {
      const list = await ctx.db.query.roleMenus.findMany({
        where: eq(roleMenus.roleId, input.roleId),
      });
      return list.map((item) => item.menuId);
    }),
});
