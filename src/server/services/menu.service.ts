/**
 * 菜单服务层
 */

import { type MySql2Database } from "drizzle-orm/mysql2";
import type * as schema from "~/server/db/schema";
import {
  menuRepository,
  type MenuCreateData,
  type MenuUpdateData,
} from "~/server/repositories";

type DB = MySql2Database<typeof schema>;

export interface MenuCreateInput {
  parentId?: number;
  name: string;
  path?: string;
  icon?: string;
  component?: string;
  permission?: string;
  type?: number;
  visible?: number;
  sort?: number;
  status?: number;
}

export interface MenuUpdateInput {
  id: number;
  parentId?: number;
  name?: string;
  path?: string;
  icon?: string;
  component?: string;
  permission?: string;
  type?: number;
  visible?: number;
  sort?: number;
  status?: number;
}

interface MenuTreeNode {
  id: number;
  parentId: number | null;
  name: string;
  path: string | null;
  icon: string | null;
  component: string | null;
  permission: string | null;
  type: number;
  visible: number;
  sort: number;
  status: number;
  createdAt: Date;
  updatedAt: Date | null;
  children?: MenuTreeNode[];
}

export const menuService = {
  /**
   * 获取菜单树
   */
  async getTree(db: DB) {
    const menus = await menuRepository.findAll(db);
    return buildTree(menus as MenuTreeNode[]);
  },

  /**
   * 获取所有菜单（平铺）
   */
  async getAll(db: DB) {
    return menuRepository.findAll(db);
  },

  /**
   * 获取单个菜单
   */
  async getById(db: DB, id: number) {
    return menuRepository.findById(db, id);
  },

  /**
   * 创建菜单
   */
  async create(db: DB, input: MenuCreateInput) {
    const menuId = await menuRepository.create(db, input);
    return { success: true, id: menuId };
  },

  /**
   * 更新菜单
   */
  async update(db: DB, input: MenuUpdateInput) {
    const { id, ...data } = input;

    // 不能将自己设为父级
    if (data.parentId === id) {
      throw new Error("不能将自己设为父级菜单");
    }

    await menuRepository.update(db, id, data);
    return { success: true };
  },

  /**
   * 删除菜单
   */
  async delete(db: DB, id: number) {
    // 检查是否有子菜单
    const hasChildren = await menuRepository.hasChildren(db, id);
    if (hasChildren) {
      throw new Error("存在子菜单，无法删除");
    }

    await menuRepository.delete(db, id);
    return { success: true };
  },
};

/**
 * 构建菜单树
 */
function buildTree(menus: MenuTreeNode[], parentId = 0): MenuTreeNode[] {
  return menus
    .filter((menu) => (menu.parentId ?? 0) === parentId)
    .map((menu) => ({
      ...menu,
      children: buildTree(menus, menu.id),
    }))
    .sort((a, b) => a.sort - b.sort);
}
