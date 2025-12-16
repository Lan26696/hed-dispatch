/**
 * 菜单数据访问层
 */

import { eq, desc, asc } from "drizzle-orm";
import { type MySql2Database } from "drizzle-orm/mysql2";
import { menus } from "~/server/db/schema";
import type * as schema from "~/server/db/schema";

type DB = MySql2Database<typeof schema>;

export interface MenuCreateData {
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

export interface MenuUpdateData {
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

export const menuRepository = {
  /**
   * 查询所有菜单（树形结构用）
   */
  async findAll(db: DB) {
    return db.query.menus.findMany({
      orderBy: [asc(menus.sort), desc(menus.createdAt)],
    });
  },

  /**
   * 根据ID查询菜单
   */
  async findById(db: DB, id: number) {
    return db.query.menus.findFirst({
      where: eq(menus.id, id),
    });
  },

  /**
   * 查询子菜单
   */
  async findByParentId(db: DB, parentId: number) {
    return db.query.menus.findMany({
      where: eq(menus.parentId, parentId),
      orderBy: [asc(menus.sort)],
    });
  },

  /**
   * 创建菜单
   */
  async create(db: DB, data: MenuCreateData) {
    const result = await db.insert(menus).values(data);
    return result[0].insertId;
  },

  /**
   * 更新菜单
   */
  async update(db: DB, id: number, data: MenuUpdateData) {
    await db.update(menus).set(data).where(eq(menus.id, id));
  },

  /**
   * 删除菜单
   */
  async delete(db: DB, id: number) {
    await db.delete(menus).where(eq(menus.id, id));
  },

  /**
   * 检查是否有子菜单
   */
  async hasChildren(db: DB, id: number) {
    const children = await db.query.menus.findFirst({
      where: eq(menus.parentId, id),
    });
    return !!children;
  },
};
