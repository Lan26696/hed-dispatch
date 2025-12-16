import { relations } from "drizzle-orm";
import {
  index,
  mysqlTableCreator,
  primaryKey,
  varchar,
  int,
  tinyint,
  text,
  timestamp,
  decimal,
  json,
  mysqlEnum,
  date,
} from "drizzle-orm/mysql-core";

/** 系统表前缀 */
export const createSysTable = mysqlTableCreator((name) => `sys_${name}`);
/** 业务表前缀 */
export const createBizTable = mysqlTableCreator((name) => `biz_${name}`);

// ==================== 系统表 ====================

/** 用户表 */
export const users = createSysTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  avatar: varchar("avatar", { length: 255 }),
  status: tinyint("status").notNull().default(1),
  roleId: int("role_id").references(() => roles.id),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
  accounts: many(accounts),
  sessions: many(sessions),
}));

/** 角色表 */
export const roles = createSysTable("role", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  /** 数据范围：all-全部数据, dept-本部门, self-仅本人 */
  dataScope: mysqlEnum("data_scope", ["all", "dept", "self"])
    .notNull()
    .default("self"),
  status: tinyint("status").notNull().default(1),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  roleMenus: many(roleMenus),
  rolePermissions: many(rolePermissions),
}));

/** 权限操作类型 */
export type PermissionAction = "read" | "create" | "update" | "delete";

/** 权限表 - 定义系统中所有可控制的资源和操作 */
export const permissions = createSysTable("permission", {
  id: int("id").primaryKey().autoincrement(),
  /** 资源标识，如 station, driver, vehicle */
  resource: varchar("resource", { length: 50 }).notNull(),
  /** 操作类型：read-读取, create-创建, update-更新, delete-删除 */
  action: mysqlEnum("action", ["read", "create", "update", "delete"]).notNull(),
  /** 权限名称，如 查看场站 */
  name: varchar("name", { length: 100 }).notNull(),
  /** 权限描述 */
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

/** 角色-权限关联表 */
export const rolePermissions = createSysTable(
  "role_permission",
  {
    roleId: int("role_id")
      .notNull()
      .references(() => roles.id),
    permissionId: int("permission_id")
      .notNull()
      .references(() => permissions.id),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

/** 菜单表 */
export const menus = createSysTable("menu", {
  id: int("id").primaryKey().autoincrement(),
  parentId: int("parent_id").default(0),
  name: varchar("name", { length: 50 }).notNull(),
  path: varchar("path", { length: 255 }),
  icon: varchar("icon", { length: 100 }),
  component: varchar("component", { length: 255 }),
  permission: varchar("permission", { length: 100 }),
  type: tinyint("type").notNull().default(1),
  visible: tinyint("visible").notNull().default(1),
  sort: int("sort").notNull().default(0),
  status: tinyint("status").notNull().default(1),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const menusRelations = relations(menus, ({ many }) => ({
  roleMenus: many(roleMenus),
}));

/** 角色-菜单关联表 */
export const roleMenus = createSysTable(
  "role_menu",
  {
    roleId: int("role_id")
      .notNull()
      .references(() => roles.id),
    menuId: int("menu_id")
      .notNull()
      .references(() => menus.id),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.menuId] })],
);

export const roleMenusRelations = relations(roleMenus, ({ one }) => ({
  role: one(roles, { fields: [roleMenus.roleId], references: [roles.id] }),
  menu: one(menus, { fields: [roleMenus.menuId], references: [menus.id] }),
}));

// ==================== NextAuth 相关表 ====================

export const accounts = createSysTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createSysTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createSysTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// ==================== 业务表 ====================

/** 场站表 */
export const stations = createBizTable("station", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).unique(),
  address: varchar("address", { length: 255 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  gasSource: json("gas_source").$type<string[]>(),
  totalPlan: decimal("total_plan", { precision: 12, scale: 2 }).default("0"),
  contactPerson: varchar("contact_person", { length: 50 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  stationType: mysqlEnum("station_type", [
    "decompression",
    "mother",
    "filling",
    "distribution",
    "storage",
    "other",
  ])
    .notNull()
    .default("filling"),
  status: mysqlEnum("status", ["active", "inactive", "maintenance"])
    .notNull()
    .default("active"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const stationsRelations = relations(stations, ({ many }) => ({
  dailyPlans: many(dailyPlans),
  reservations: many(reservations),
  dispatchOrders: many(dispatchOrders),
}));

/** 司机表 */
export const drivers = createBizTable("driver", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  idCard: varchar("id_card", { length: 20 }),
  licenseNumber: varchar("license_number", { length: 50 }),
  licenseType: varchar("license_type", { length: 10 }),
  company: varchar("company", { length: 100 }),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  status: mysqlEnum("status", ["available", "busy", "offline", "inactive"])
    .notNull()
    .default("available"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const driversRelations = relations(drivers, ({ one, many }) => ({
  user: one(users, { fields: [drivers.userId], references: [users.id] }),
  vehicles: many(vehicles),
  reservations: many(reservations),
  dispatchOrders: many(dispatchOrders),
}));

/** 车辆表 */
export const vehicles = createBizTable("vehicle", {
  id: varchar("id", { length: 50 }).primaryKey(),
  plate: varchar("plate", { length: 20 }).notNull().unique(),
  type: mysqlEnum("type", ["CNG_Trailer", "PNG_Pipe", "Other"])
    .notNull()
    .default("CNG_Trailer"),
  capacity: decimal("capacity", { precision: 10, scale: 2 }).default("0"),
  driverId: varchar("driver_id", { length: 50 }).references(() => drivers.id),
  status: mysqlEnum("status", ["available", "busy", "maintenance", "inactive"])
    .notNull()
    .default("available"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  driver: one(drivers, {
    fields: [vehicles.driverId],
    references: [drivers.id],
  }),
  reservations: many(reservations),
  dispatchOrders: many(dispatchOrders),
}));

/** 日计划表 */
export const dailyPlans = createBizTable("daily_plan", {
  id: varchar("id", { length: 50 }).primaryKey(),
  planDate: date("plan_date").notNull(),
  stationId: varchar("station_id", { length: 50 })
    .notNull()
    .references(() => stations.id),
  direction: mysqlEnum("direction", ["upstream", "downstream"]).notNull(),
  planVolume: decimal("plan_volume", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  actualVolume: decimal("actual_volume", { precision: 12, scale: 2 }).default(
    "0",
  ),
  hourlyPlans: json("hourly_plans").$type<Record<string, number>>(),
  status: mysqlEnum("status", ["draft", "confirmed", "completed"])
    .notNull()
    .default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
  createdBy: varchar("created_by", { length: 50 }),
});

export const dailyPlansRelations = relations(dailyPlans, ({ one }) => ({
  station: one(stations, {
    fields: [dailyPlans.stationId],
    references: [stations.id],
  }),
}));

/** 预约表 */
export const reservations = createBizTable("reservation", {
  id: varchar("id", { length: 50 }).primaryKey(),
  stationId: varchar("station_id", { length: 50 })
    .notNull()
    .references(() => stations.id),
  driverId: varchar("driver_id", { length: 50 })
    .notNull()
    .references(() => drivers.id),
  vehicleId: varchar("vehicle_id", { length: 50 })
    .notNull()
    .references(() => vehicles.id),
  appointmentTime: timestamp("appointment_time").notNull(),
  plannedQuantity: decimal("planned_quantity", {
    precision: 10,
    scale: 2,
  }).default("0"),
  actualQuantity: decimal("actual_quantity", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "arrived",
    "loading",
    "completed",
    "cancelled",
  ])
    .notNull()
    .default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const reservationsRelations = relations(
  reservations,
  ({ one, many }) => ({
    station: one(stations, {
      fields: [reservations.stationId],
      references: [stations.id],
    }),
    driver: one(drivers, {
      fields: [reservations.driverId],
      references: [drivers.id],
    }),
    vehicle: one(vehicles, {
      fields: [reservations.vehicleId],
      references: [vehicles.id],
    }),
    dispatchOrders: many(dispatchOrders),
  }),
);

/** 调度单表 */
export const dispatchOrders = createBizTable("dispatch_order", {
  id: varchar("id", { length: 50 }).primaryKey(),
  orderNo: varchar("order_no", { length: 50 }),
  reservationId: varchar("reservation_id", { length: 50 }).references(
    () => reservations.id,
  ),
  stationId: varchar("station_id", { length: 50 })
    .notNull()
    .references(() => stations.id),
  driverId: varchar("driver_id", { length: 50 })
    .notNull()
    .references(() => drivers.id),
  vehicleId: varchar("vehicle_id", { length: 50 })
    .notNull()
    .references(() => vehicles.id),
  scheduledTime: timestamp("scheduled_time").notNull(),
  actualArrivalTime: timestamp("actual_arrival_time"),
  actualDepartureTime: timestamp("actual_departure_time"),
  loadAmount: decimal("load_amount", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", [
    "scheduled",
    "notified",
    "arrived",
    "loading",
    "completed",
    "cancelled",
  ])
    .notNull()
    .default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const dispatchOrdersRelations = relations(dispatchOrders, ({ one }) => ({
  reservation: one(reservations, {
    fields: [dispatchOrders.reservationId],
    references: [reservations.id],
  }),
  station: one(stations, {
    fields: [dispatchOrders.stationId],
    references: [stations.id],
  }),
  driver: one(drivers, {
    fields: [dispatchOrders.driverId],
    references: [drivers.id],
  }),
  vehicle: one(vehicles, {
    fields: [dispatchOrders.vehicleId],
    references: [vehicles.id],
  }),
}));

/** 模板变量类型 */
export type TemplateVariable = {
  key: string; // 变量名，如 driver_name
  label: string; // 中文别名，如 司机姓名
};

/** 短信模板表 */
export const smsTemplates = createBizTable("sms_template", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  content: text("content").notNull(),
  variables: json("variables").$type<TemplateVariable[]>(),
  status: mysqlEnum("status", ["active", "inactive", "pending"])
    .notNull()
    .default("pending"),
  description: varchar("description", { length: 255 }),
  createdBy: varchar("created_by", { length: 50 }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

/** 短信发送记录表 */
export const smsRecords = createBizTable("sms_record", {
  id: varchar("id", { length: 50 }).primaryKey(),
  templateId: varchar("template_id", { length: 50 }).references(
    () => smsTemplates.id,
  ),
  templateCode: varchar("template_code", { length: 50 }),
  templateName: varchar("template_name", { length: 100 }),
  mobile: varchar("mobile", { length: 20 }).notNull(),
  content: text("content").notNull(),
  variables: json("variables").$type<Record<string, string>>(),
  smsId: varchar("sms_id", { length: 100 }),
  status: mysqlEnum("status", ["pending", "success", "failed"])
    .notNull()
    .default("pending"),
  errorMsg: varchar("error_msg", { length: 255 }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  sentAt: timestamp("sent_at"),
  createdBy: varchar("created_by", { length: 50 }),
});

export const smsRecordsRelations = relations(smsRecords, ({ one }) => ({
  template: one(smsTemplates, {
    fields: [smsRecords.templateId],
    references: [smsTemplates.id],
  }),
}));
