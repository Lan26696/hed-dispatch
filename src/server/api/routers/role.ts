/**
 * 角色路由（Controller层）
 */

import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { roleService } from "~/server/services";
import { roleMenus } from "~/server/db/schema";

// 入参 Schema 定义
const createInputSchema = z.object({
  name: z.string().min(1, "角色名称不能为空"),
  code: z.string().min(1, "角色编码不能为空"),
  description: z.string().optional(),
  dataScope: z.enum(["all", "dept", "self"]).default("self"),
  status: z.number().default(1),
  menuIds: z.array(z.number()).optional(),
  permissionIds: z.array(z.number()).optional(),
});

const updateInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  description: z.string().optional(),
  dataScope: z.enum(["all", "dept", "self"]).optional(),
  status: z.number().optional(),
  menuIds: z.array(z.number()).optional(),
  permissionIds: z.array(z.number()).optional(),
});

const idSchema = z.object({ id: z.number() });

const assignMenusSchema = z.object({
  roleId: z.number(),
  menuIds: z.array(z.number()),
});

export const roleRouter = createTRPCRouter({
  // 获取角色列表
  list: protectedProcedure.query(async ({ ctx }) => {
    const result = await roleService.list(ctx.db);
    return result.list;
  }),

  // 获取所有角色（下拉选择用）
  all: protectedProcedure.query(({ ctx }) => roleService.getAll(ctx.db)),

  // 获取单个角色
  getById: protectedProcedure
    .input(idSchema)
    .query(({ ctx, input }) => roleService.getById(ctx.db, input.id)),

  // 创建角色
  create: protectedProcedure
    .input(createInputSchema)
    .mutation(({ ctx, input }) => roleService.create(ctx.db, input)),

  // 更新角色
  update: protectedProcedure
    .input(updateInputSchema)
    .mutation(({ ctx, input }) => roleService.update(ctx.db, input)),

  // 删除角色
  delete: protectedProcedure
    .input(idSchema)
    .mutation(({ ctx, input }) => roleService.delete(ctx.db, input.id)),

  // 分配菜单权限（兼容旧接口）
  assignMenus: protectedProcedure
    .input(assignMenusSchema)
    .mutation(({ ctx, input }) =>
      roleService.update(ctx.db, {
        id: input.roleId,
        menuIds: input.menuIds,
      }),
    ),

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
