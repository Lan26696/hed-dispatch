/**
 * 用户服务层
 * 业务逻辑处理
 */

import bcrypt from "bcryptjs";
import { type MySql2Database } from "drizzle-orm/mysql2";
import type * as schema from "~/server/db/schema";
import {
  userRepository,
  type UserFindManyOptions,
  type UserCreateData,
  type UserUpdateData,
} from "~/server/repositories";

type DB = MySql2Database<typeof schema>;

export interface UserListInput {
  keyword?: string;
  roleId?: number;
  status?: number;
  page?: number;
  pageSize?: number;
}

export interface UserCreateInput {
  username: string;
  password: string;
  name?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  status?: number;
}

export interface UserUpdateInput {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  status?: number;
}

export const userService = {
  /**
   * 获取用户列表（分页）
   */
  async list(db: DB, input: UserListInput) {
    const { page = 1, pageSize = 10, ...filters } = input;

    const [list, total] = await Promise.all([
      userRepository.findMany(db, { ...filters, page, pageSize }),
      userRepository.count(db, filters),
    ]);

    return { list, total, page, pageSize };
  },

  /**
   * 获取单个用户
   */
  async getById(db: DB, id: string) {
    return userRepository.findById(db, id);
  },

  /**
   * 创建用户
   */
  async create(db: DB, input: UserCreateInput) {
    // 检查用户名是否已存在
    const exists = await userRepository.findByUsername(db, input.username);
    if (exists) {
      throw new Error("用户名已存在");
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(input.password, 10);

    await userRepository.create(db, {
      ...input,
      password: hashedPassword,
    });

    return { success: true };
  },

  /**
   * 更新用户
   */
  async update(db: DB, input: UserUpdateInput) {
    const { id, ...data } = input;

    // 如果修改用户名，检查是否重复
    if (data.username) {
      const exists = await userRepository.findByUsername(db, data.username);
      if (exists && exists.id !== id) {
        throw new Error("用户名已存在");
      }
    }

    await userRepository.update(db, id, data);
    return { success: true };
  },

  /**
   * 重置密码
   */
  async resetPassword(db: DB, id: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await userRepository.updatePassword(db, id, hashedPassword);
    return { success: true };
  },

  /**
   * 删除用户
   */
  async delete(db: DB, id: string) {
    await userRepository.delete(db, id);
    return { success: true };
  },
};
