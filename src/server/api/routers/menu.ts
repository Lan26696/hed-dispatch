/**
 * 菜单路由（Controller层）
 */

import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { menuService } from "~/server/services";
import { menus, roleMenus } from "~/server/db/schema";

// 入参 Schema 定义
const createInputSchema = z.object({
  parentId: z.number().default(0),
  name: z.string().min(1, "菜单名称不能为空"),
  path: z.string().optional(),
  icon: z.string().optional(),
  component: z.string().optional(),
  permission: z.string().optional(),
  type: z.number().default(2),
  sort: z.number().default(0),
  status: z.number().default(1),
  visible: z.number().default(1),
});

const updateInputSchema = z.object({
  id: z.number(),
  parentId: z.number().optional(),
  name: z.string().min(1).optional(),
  path: z.string().optional(),
  icon: z.string().optional(),
  component: z.string().optional(),
  permission: z.string().optional(),
  type: z.number().optional(),
  sort: z.number().optional(),
  status: z.number().optional(),
  visible: z.number().optional(),
});

const idSchema = z.object({ id: z.number() });

export const menuRouter = createTRPCRouter({
  // 获取当前用户的菜单
  getUserMenus: protectedProcedure.query(async ({ ctx }) => {
    const roleId = ctx.session.user.roleId;
    if (!roleId) return [];

    const roleMenuList = await ctx.db.query.roleMenus.findMany({
      where: eq(roleMenus.roleId, roleId),
    });
    const menuIds = roleMenuList.map((rm) => rm.menuId);
    if (menuIds.length === 0) return [];

    const menuList = await ctx.db.query.menus.findMany({
      where: (menus, { inArray, and, eq }) =>
        and(
          inArray(menus.id, menuIds),
          eq(menus.status, 1),
          eq(menus.visible, 1),
        ),
      orderBy: [asc(menus.sort)],
    });
    return buildMenuTree(menuList);
  }),

  // 获取所有菜单（树形）
  list: protectedProcedure.query(({ ctx }) => menuService.getTree(ctx.db)),

  // 获取所有菜单（平铺）
  all: protectedProcedure.query(({ ctx }) => menuService.getAll(ctx.db)),

  // 创建菜单
  create: protectedProcedure
    .input(createInputSchema)
    .mutation(({ ctx, input }) => menuService.create(ctx.db, input)),

  // 更新菜单
  update: protectedProcedure
    .input(updateInputSchema)
    .mutation(({ ctx, input }) => menuService.update(ctx.db, input)),

  // 删除菜单
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      // 先删除角色菜单关联
      await ctx.db.delete(roleMenus).where(eq(roleMenus.menuId, input.id));
      // 再删除菜单
      return menuService.delete(ctx.db, input.id);
    }),
});

// 构建菜单树（用于用户菜单）
interface MenuItem {
  id: number;
  parentId: number | null;
  name: string;
  path: string | null;
  icon: string | null;
  type: number;
  sort: number;
  children?: MenuItem[];
}

function buildMenuTree(menus: MenuItem[]): MenuItem[] {
  const menuMap = new Map<number, MenuItem>();
  const tree: MenuItem[] = [];

  menus.forEach((menu) => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });

  menus.forEach((menu) => {
    const node = menuMap.get(menu.id)!;
    if (menu.parentId === 0 || menu.parentId === null) {
      tree.push(node);
    } else {
      const parent = menuMap.get(menu.parentId);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(node);
      }
    }
  });

  return tree;
}
