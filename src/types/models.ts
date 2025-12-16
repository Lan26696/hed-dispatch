/**
 * 数据模型类型定义
 * 与数据库表结构对应
 */

import type { EnableStatus, Status } from "./common";

// ============ 系统模块 ============

export interface User {
  id: string;
  username: string;
  password: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  roleId: number | null;
  status: EnableStatus;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description: string | null;
  dataScope: "all" | "dept" | "self";
  status: EnableStatus;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Menu {
  id: number;
  parentId: number;
  name: string;
  path: string | null;
  icon: string | null;
  type: number; // 1=目录, 2=菜单
  sort: number;
  status: EnableStatus;
  visible: EnableStatus;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Permission {
  id: number;
  resource: string;
  action: string;
  resourceLabel: string;
  actionLabel: string;
  createdAt: Date;
}

// ============ 消息模块 ============

export interface SmsTemplate {
  id: string;
  name: string;
  code: string;
  content: string;
  variables: TemplateVariable[] | null;
  description: string | null;
  status: Status;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface TemplateVariable {
  key: string;
  label: string;
}

export interface SmsRecord {
  id: string;
  templateId: string | null;
  templateCode: string | null;
  templateName: string | null;
  mobile: string;
  content: string;
  variables: Record<string, string> | null;
  status: "pending" | "success" | "failed";
  smsId: string | null;
  errorMsg: string | null;
  sentAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
}

// ============ 业务模块 ============

export type StationType =
  | "mother"
  | "distribution"
  | "filling"
  | "storage"
  | "decompression";

export interface Station {
  id: string;
  name: string;
  code: string;
  address: string | null;
  gasTypes: string[] | null;
  capacity: number | null;
  manager: string | null;
  phone: string | null;
  type: StationType;
  status: Status;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  idCard: string | null;
  licenseNo: string | null;
  licenseType: string | null;
  status: Status;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Vehicle {
  id: string;
  plateNo: string;
  type: string | null;
  capacity: number | null;
  status: Status;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface DispatchOrder {
  id: string;
  orderNo: string;
  fromStationId: string;
  toStationId: string;
  driverId: string;
  vehicleId: string;
  planVolume: number;
  actualVolume: number | null;
  loadPressure: number | null;
  status:
    | "pending"
    | "loading"
    | "delivering"
    | "unloading"
    | "completed"
    | "cancelled";
  planTime: Date;
  loadTime: Date | null;
  departTime: Date | null;
  arriveTime: Date | null;
  completeTime: Date | null;
  remark: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}
