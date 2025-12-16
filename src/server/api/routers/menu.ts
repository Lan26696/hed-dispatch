import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { menus, roleMenus } from "~/server/db/schema";

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

  // 获取所有菜单（管理用）
  list: protectedProcedure.query(async ({ ctx }) => {
    const menuList = await ctx.db.query.menus.findMany({
      orderBy: [asc(menus.sort)],
    });
    return buildMenuTree(menuList);
  }),

  // 获取所有菜单（平铺）
  all: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.menus.findMany({ orderBy: [asc(menus.sort)] });
  }),

  // 创建菜单
  create: protectedProcedure
    .input(
      z.object({
        parentId: z.number().default(0),
        name: z.string().min(1),
        path: z.string().optional(),
        icon: z.string().optional(),
        type: z.number().default(2),
        sort: z.number().default(0),
        status: z.number().default(1),
        visible: z.number().default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(menus).values(input);
      return { success: true };
    }),

  // 更新菜单
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        parentId: z.number().optional(),
        name: z.string().min(1).optional(),
        path: z.string().optional(),
        icon: z.string().optional(),
        type: z.number().optional(),
        sort: z.number().optional(),
        status: z.number().optional(),
        visible: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await ctx.db.update(menus).set(data).where(eq(menus.id, id));
      return { success: true };
    }),

  // 删除菜单
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(roleMenus).where(eq(roleMenus.menuId, input.id));
      await ctx.db.delete(menus).where(eq(menus.id, input.id));
      return { success: true };
    }),
});

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
