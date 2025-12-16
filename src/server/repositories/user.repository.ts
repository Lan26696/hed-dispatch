/**
 * 用户数据访问层
 * 纯数据库操作，不包含业务逻辑
 */

import { eq, like, and, desc, sql } from "drizzle-orm";
import { type MySql2Database } from "drizzle-orm/mysql2";
import { users } from "~/server/db/schema";
import type * as schema from "~/server/db/schema";

type DB = MySql2Database<typeof schema>;

export interface UserFindManyOptions {
  keyword?: string;
  roleId?: number;
  status?: number;
  page: number;
  pageSize: number;
}

export interface UserCreateData {
  username: string;
  password: string;
  name?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  status?: number;
}

export interface UserUpdateData {
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  status?: number;
}

export const userRepository = {
  /**
   * 查询用户列表（分页）
   */
  async findMany(db: DB, options: UserFindManyOptions) {
    const { keyword, roleId, status, page, pageSize } = options;
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

    const list = await db.query.users.findMany({
      where,
      with: { role: true },
      orderBy: [desc(users.createdAt)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return list;
  },

  /**
   * 统计用户总数
   */
  async count(db: DB, options: Omit<UserFindManyOptions, "page" | "pageSize">) {
    const { keyword, roleId, status } = options;
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

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(where);

    return result[0]?.count ?? 0;
  },

  /**
   * 根据ID查询用户
   */
  async findById(db: DB, id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
      with: { role: true },
    });
  },

  /**
   * 根据用户名查询用户
   */
  async findByUsername(db: DB, username: string) {
    return db.query.users.findFirst({
      where: eq(users.username, username),
    });
  },

  /**
   * 创建用户
   */
  async create(db: DB, data: UserCreateData) {
    await db.insert(users).values(data);
  },

  /**
   * 更新用户
   */
  async update(db: DB, id: string, data: UserUpdateData) {
    await db.update(users).set(data).where(eq(users.id, id));
  },

  /**
   * 更新密码
   */
  async updatePassword(db: DB, id: string, password: string) {
    await db.update(users).set({ password }).where(eq(users.id, id));
  },

  /**
   * 删除用户
   */
  async delete(db: DB, id: string) {
    await db.delete(users).where(eq(users.id, id));
  },
};
