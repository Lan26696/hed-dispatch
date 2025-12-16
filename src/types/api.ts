/**
 * API 相关类型定义
 * 用于 Router 层的输入输出
 */

import type { PaginationInput } from "./common";

// ============ 用户模块 ============

export interface UserListInput extends PaginationInput {
  keyword?: string;
  roleId?: number;
  status?: number;
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

// ============ 角色模块 ============

export interface RoleCreateInput {
  name: string;
  code: string;
  description?: string;
  status?: number;
}

export interface RoleUpdateInput {
  id: number;
  name?: string;
  code?: string;
  description?: string;
  status?: number;
}

export interface AssignMenusInput {
  roleId: number;
  menuIds: number[];
}

export interface AssignPermissionsInput {
  roleId: number;
  permissionIds: number[];
}

// ============ 菜单模块 ============

export interface MenuCreateInput {
  parentId: number;
  name: string;
  path?: string;
  icon?: string;
  type: number;
  sort?: number;
  status?: number;
  visible?: number;
}

export interface MenuUpdateInput {
  id: number;
  parentId?: number;
  name?: string;
  path?: string;
  icon?: string;
  type?: number;
  sort?: number;
  status?: number;
  visible?: number;
}

// ============ 短信模块 ============

export interface SmsTemplateCreateInput {
  name: string;
  code: string;
  content: string;
  variables?: Array<{ key: string; label: string }>;
  description?: string;
}

export interface SmsTemplateUpdateInput {
  id: string;
  name?: string;
  code?: string;
  content?: string;
  variables?: Array<{ key: string; label: string }>;
  description?: string;
  status?: string;
}

export interface SmsSendInput {
  templateId: string;
  mobile: string;
  variables?: Record<string, string>;
}

// ============ 调度模块 ============

export interface DispatchOrderCreateInput {
  fromStationId: string;
  toStationId: string;
  driverId: string;
  vehicleId: string;
  planVolume: number;
  planTime: Date;
  remark?: string;
}

export interface DispatchOrderUpdateInput {
  id: string;
  status?: string;
  actualVolume?: number;
  loadPressure?: number;
  loadTime?: Date;
  departTime?: Date;
  arriveTime?: Date;
  completeTime?: Date;
}
