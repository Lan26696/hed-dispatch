import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { rolePermissions, roles } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// 资源分组配置
const RESOURCE_GROUPS = [
  {
    name: "基础数据",
    resources: [
      { key: "station", label: "场站管理" },
      { key: "driver", label: "司机管理" },
      { key: "vehicle", label: "车辆管理" },
    ],
  },
  {
    name: "调度管理",
    resources: [
      { key: "dispatch", label: "调度单" },
      { key: "reservation", label: "预约管理" },
      { key: "daily_plan", label: "日计划" },
    ],
  },
  {
    name: "消息通知",
    resources: [
      { key: "sms_template", label: "短信模板" },
      { key: "sms_record", label: "发送记录" },
    ],
  },
  {
    name: "系统管理",
    resources: [
      { key: "user", label: "用户管理" },
      { key: "role", label: "角色管理" },
      { key: "menu", label: "菜单管理" },
    ],
  },
];

const ACTION_LABELS: Record<string, string> = {
  read: "查看",
  create: "新增",
  update: "编辑",
  delete: "删除",
};

export const permissionRouter = createTRPCRouter({
  // 获取所有权限（按资源分组）
  list: protectedProcedure.query(async ({ ctx }) => {
    const allPermissions = await ctx.db.query.permissions.findMany();

    // 按资源分组
    const grouped = RESOURCE_GROUPS.map((group) => ({
      ...group,
      resources: group.resources.map((resource) => ({
        ...resource,
        permissions: allPermissions
          .filter((p) => p.resource === resource.key)
          .map((p) => ({
            ...p,
            actionLabel: ACTION_LABELS[p.action] ?? p.action,
          })),
      })),
    }));

    return grouped;
  }),

  // 获取角色的权限
  getRolePermissions: protectedProcedure
    .input(z.object({ roleId: z.number() }))
    .query(async ({ ctx, input }) => {
      const rps = await ctx.db.query.rolePermissions.findMany({
        where: eq(rolePermissions.roleId, input.roleId),
      });
      return rps.map((rp) => rp.permissionId);
    }),

  // 更新角色权限
  updateRolePermissions: protectedProcedure
    .input(
      z.object({
        roleId: z.number(),
        permissionIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 删除旧权限
      await ctx.db
        .delete(rolePermissions)
        .where(eq(rolePermissions.roleId, input.roleId));

      // 添加新权限
      if (input.permissionIds.length > 0) {
        await ctx.db.insert(rolePermissions).values(
          input.permissionIds.map((permissionId) => ({
            roleId: input.roleId,
            permissionId,
          })),
        );
      }

      return { success: true };
    }),

  // 更新角色数据范围
  updateRoleDataScope: protectedProcedure
    .input(
      z.object({
        roleId: z.number(),
        dataScope: z.enum(["all", "dept", "self"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(roles)
        .set({ dataScope: input.dataScope })
        .where(eq(roles.id, input.roleId));

      return { success: true };
    }),

  // 获取资源分组配置
  getResourceGroups: protectedProcedure.query(() => {
    return RESOURCE_GROUPS;
  }),

  // 检查当前用户是否有某个权限
  check: protectedProcedure
    .input(
      z.object({
        resource: z.string(),
        action: z.enum(["read", "create", "update", "delete"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(
          (await import("~/server/db/schema")).users.id,
          ctx.session.user.id,
        ),
        with: {
          role: {
            with: {
              rolePermissions: {
                with: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user?.role) return false;

      // 超级管理员拥有所有权限
      if (user.role.code === "admin") return true;

      // 检查是否有对应权限
      const hasPermission = user.role.rolePermissions?.some(
        (rp) =>
          rp.permission.resource === input.resource &&
          rp.permission.action === input.action,
      );

      return hasPermission ?? false;
    }),
});
