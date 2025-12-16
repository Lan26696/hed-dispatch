/**
 * 通用类型定义
 */

// 状态类型
export type Status = "active" | "inactive" | "pending";
export type EnableStatus = 0 | 1;

// 分页输入
export interface PaginationInput {
  page: number;
  pageSize: number;
}

// 分页结果
export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// API 响应
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

// 选项类型（用于下拉框等）
export interface Option<T = string | number> {
  label: string;
  value: T;
}

// 树形结构
export interface TreeNode<T = unknown> {
  id: number;
  parentId: number | null;
  children?: TreeNode<T>[];
  data?: T;
}

// 数据库类型（简化引用）
export type { MySql2Database } from "drizzle-orm/mysql2";
