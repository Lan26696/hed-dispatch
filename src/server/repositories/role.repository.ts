/**
 * 角色数据访问层
 */

import { eq, like, and, desc, sql, inArray } from "drizzle-orm";
import { type MySql2Database } from "drizzle-orm/mysql2";
import { roles, roleMenus, rolePermissions } from "~/server/db/schema";
import type * as schema from "~/server/db/schema";

type DB = MySql2Database<typeof schema>;

export interface RoleFindManyOptions {
  keyword?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

export interface RoleCreateData {
  name: string;
  code: string;
  description?: string;
  dataScope?: "all" | "dept" | "self";
  status?: number;
}

export interface RoleUpdateData {
  name?: string;
  code?: string;
  description?: string;
  dataScope?: "all" | "dept" | "self";
  status?: number;
}

export const roleRepository = {
  /**
   * 查询角色列表
   */
  async findMany(db: DB, options: RoleFindManyOptions = {}) {
    const { keyword, status, page, pageSize } = options;
    const conditions = [];

    if (keyword) {
      conditions.push(like(roles.name, `%${keyword}%`));
    }
    if (status !== undefined) {
      conditions.push(eq(roles.status, status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const query = db.query.roles.findMany({
      where,
      with: {
        roleMenus: { with: { menu: true } },
        rolePermissions: { with: { permission: true } },
      },
      orderBy: [desc(roles.createdAt)],
    });

    if (page && pageSize) {
      return db.query.roles.findMany({
        where,
        with: {
          roleMenus: { with: { menu: true } },
          rolePermissions: { with: { permission: true } },
        },
        orderBy: [desc(roles.createdAt)],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
    }

    return query;
  },

  /**
   * 统计角色总数
   */
  async count(
    db: DB,
    options: Omit<RoleFindManyOptions, "page" | "pageSize"> = {},
  ) {
    const { keyword, status } = options;
    const conditions = [];

    if (keyword) {
      conditions.push(like(roles.name, `%${keyword}%`));
    }
    if (status !== undefined) {
      conditions.push(eq(roles.status, status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(roles)
      .where(where);

    return result[0]?.count ?? 0;
  },

  /**
   * 根据ID查询角色
   */
  async findById(db: DB, id: number) {
    return db.query.roles.findFirst({
      where: eq(roles.id, id),
      with: {
        roleMenus: { with: { menu: true } },
        rolePermissions: { with: { permission: true } },
      },
    });
  },

  /**
   * 根据编码查询角色
   */
  async findByCode(db: DB, code: string) {
    return db.query.roles.findFirst({
      where: eq(roles.code, code),
    });
  },

  /**
   * 创建角色
   */
  async create(db: DB, data: RoleCreateData) {
    const result = await db.insert(roles).values(data);
    return result[0].insertId;
  },

  /**
   * 更新角色
   */
  async update(db: DB, id: number, data: RoleUpdateData) {
    await db.update(roles).set(data).where(eq(roles.id, id));
  },

  /**
   * 删除角色
   */
  async delete(db: DB, id: number) {
    await db.delete(roles).where(eq(roles.id, id));
  },

  /**
   * 设置角色菜单
   */
  async setMenus(db: DB, roleId: number, menuIds: number[]) {
    // 先删除原有关联
    await db.delete(roleMenus).where(eq(roleMenus.roleId, roleId));

    // 批量插入新关联
    if (menuIds.length > 0) {
      await db
        .insert(roleMenus)
        .values(menuIds.map((menuId) => ({ roleId, menuId })));
    }
  },

  /**
   * 设置角色权限
   */
  async setPermissions(db: DB, roleId: number, permissionIds: number[]) {
    // 先删除原有关联
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    // 批量插入新关联
    if (permissionIds.length > 0) {
      await db
        .insert(rolePermissions)
        .values(
          permissionIds.map((permissionId) => ({ roleId, permissionId })),
        );
    }
  },
};
