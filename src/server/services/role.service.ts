/**
 * 角色服务层
 */

import { type MySql2Database } from "drizzle-orm/mysql2";
import type * as schema from "~/server/db/schema";
import {
  roleRepository,
  type RoleFindManyOptions,
  type RoleCreateData,
  type RoleUpdateData,
} from "~/server/repositories";

type DB = MySql2Database<typeof schema>;

export interface RoleListInput {
  keyword?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

export interface RoleCreateInput {
  name: string;
  code: string;
  description?: string;
  dataScope?: "all" | "dept" | "self";
  status?: number;
  menuIds?: number[];
  permissionIds?: number[];
}

export interface RoleUpdateInput {
  id: number;
  name?: string;
  code?: string;
  description?: string;
  dataScope?: "all" | "dept" | "self";
  status?: number;
  menuIds?: number[];
  permissionIds?: number[];
}

export const roleService = {
  /**
   * 获取角色列表
   */
  async list(db: DB, input: RoleListInput = {}) {
    const { page, pageSize, ...filters } = input;

    if (page && pageSize) {
      const [list, total] = await Promise.all([
        roleRepository.findMany(db, { ...filters, page, pageSize }),
        roleRepository.count(db, filters),
      ]);
      return { list, total, page, pageSize };
    }

    const list = await roleRepository.findMany(db, filters);
    return { list, total: list.length };
  },

  /**
   * 获取所有角色（下拉选择用）
   */
  async getAll(db: DB) {
    return roleRepository.findMany(db, { status: 1 });
  },

  /**
   * 获取单个角色
   */
  async getById(db: DB, id: number) {
    return roleRepository.findById(db, id);
  },

  /**
   * 创建角色
   */
  async create(db: DB, input: RoleCreateInput) {
    const { menuIds, permissionIds, ...data } = input;

    // 检查编码是否已存在
    const exists = await roleRepository.findByCode(db, data.code);
    if (exists) {
      throw new Error("角色编码已存在");
    }

    // 创建角色
    const roleId = await roleRepository.create(db, data);

    // 设置菜单权限
    if (menuIds && menuIds.length > 0) {
      await roleRepository.setMenus(db, roleId, menuIds);
    }

    // 设置操作权限
    if (permissionIds && permissionIds.length > 0) {
      await roleRepository.setPermissions(db, roleId, permissionIds);
    }

    return { success: true, id: roleId };
  },

  /**
   * 更新角色
   */
  async update(db: DB, input: RoleUpdateInput) {
    const { id, menuIds, permissionIds, ...data } = input;

    // 如果修改编码，检查是否重复
    if (data.code) {
      const exists = await roleRepository.findByCode(db, data.code);
      if (exists && exists.id !== id) {
        throw new Error("角色编码已存在");
      }
    }

    // 更新角色基本信息
    await roleRepository.update(db, id, data);

    // 更新菜单权限
    if (menuIds !== undefined) {
      await roleRepository.setMenus(db, id, menuIds);
    }

    // 更新操作权限
    if (permissionIds !== undefined) {
      await roleRepository.setPermissions(db, id, permissionIds);
    }

    return { success: true };
  },

  /**
   * 删除角色
   */
  async delete(db: DB, id: number) {
    // TODO: 检查是否有用户使用该角色
    await roleRepository.delete(db, id);
    return { success: true };
  },
};
