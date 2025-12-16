/**
 * 数据库初始化脚本
 * 运行: npx tsx src/server/db/seed.ts
 * 支持增量更新，重复运行不会报错
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { sql } from "drizzle-orm";
// Note: Using raw SQL for seeding to support ON DUPLICATE KEY UPDATE

const pool = createPool({ uri: process.env.DATABASE_URL });
const db = drizzle(pool);

async function seed() {
  console.log("🌱 开始初始化数据...\n");

  // ==================== 系统表数据 ====================
  console.log("📦 初始化系统表数据...");

  // 1. 角色数据（含数据范围）
  console.log("  - 角色数据...");
  await db.execute(sql`
    INSERT INTO sys_role (id, name, code, description, data_scope, status, created_at)
    VALUES 
      (1, '超级管理员', 'admin', '拥有所有权限', 'all', 1, NOW()),
      (2, '普通用户', 'user', '普通用户权限', 'self', 1, NOW()),
      (3, '调度员', 'dispatcher', '负责调度管理', 'all', 1, NOW()),
      (4, '场站管理员', 'station_admin', '负责场站管理', 'dept', 1, NOW()),
      (5, '司机', 'driver', '执行运输任务', 'self', 1, NOW())
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      description = VALUES(description),
      data_scope = VALUES(data_scope),
      updated_at = NOW()
  `);

  // 2. 菜单数据
  console.log("  - 菜单数据...");
  await db.execute(sql`
    INSERT INTO sys_menu (id, parent_id, name, path, icon, type, sort, status, created_at)
    VALUES 
      (1, 0, '首页', '/', 'home', 2, 1, 1, NOW()),
      (2, 0, '调度管理', '/dispatch', 'truck', 1, 2, 1, NOW()),
      (3, 2, '调度看板', '/dispatch/board', 'dashboard', 2, 1, 1, NOW()),
      (4, 2, '调度单管理', '/dispatch/orders', 'list', 2, 2, 1, NOW()),
      (5, 2, '预约管理', '/dispatch/reservations', 'calendar', 2, 3, 1, NOW()),
      (6, 0, '基础数据', '/base', 'database', 1, 3, 1, NOW()),
      (7, 6, '场站管理', '/base/stations', 'building', 2, 1, 1, NOW()),
      (8, 6, '司机管理', '/base/drivers', 'users', 2, 2, 1, NOW()),
      (9, 6, '车辆管理', '/base/vehicles', 'car', 2, 3, 1, NOW()),
      (10, 0, '计划管理', '/plan', 'chart', 1, 4, 1, NOW()),
      (11, 10, '日计划', '/plan/daily', 'calendar', 2, 1, 1, NOW()),
      (17, 0, '消息通知', '/message', 'message', 1, 5, 1, NOW()),
      (18, 17, '短信模板', '/message/templates', 'template', 2, 1, 1, NOW()),
      (19, 17, '发送记录', '/message/records', 'record', 2, 2, 1, NOW()),
      (12, 0, '系统管理', '/system', 'settings', 1, 99, 1, NOW()),
      (13, 12, '用户管理', '/system/users', 'users', 2, 1, 1, NOW()),
      (14, 12, '角色管理', '/system/roles', 'shield', 2, 2, 1, NOW()),
      (15, 12, '菜单管理', '/system/menus', 'menu', 2, 3, 1, NOW())
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      path = VALUES(path),
      icon = VALUES(icon),
      sort = VALUES(sort),
      updated_at = NOW()
  `);

  // 3. 权限数据（CRUD 细粒度权限）
  console.log("  - 权限数据...");
  await db.execute(sql`
    INSERT INTO sys_permission (id, resource, action, name, description, created_at)
    VALUES 
      -- 场站权限
      (1, 'station', 'read', '查看场站', '查看场站列表和详情', NOW()),
      (2, 'station', 'create', '创建场站', '新增场站信息', NOW()),
      (3, 'station', 'update', '编辑场站', '修改场站信息', NOW()),
      (4, 'station', 'delete', '删除场站', '删除场站数据', NOW()),
      -- 司机权限
      (5, 'driver', 'read', '查看司机', '查看司机列表和详情', NOW()),
      (6, 'driver', 'create', '创建司机', '新增司机信息', NOW()),
      (7, 'driver', 'update', '编辑司机', '修改司机信息', NOW()),
      (8, 'driver', 'delete', '删除司机', '删除司机数据', NOW()),
      -- 车辆权限
      (9, 'vehicle', 'read', '查看车辆', '查看车辆列表和详情', NOW()),
      (10, 'vehicle', 'create', '创建车辆', '新增车辆信息', NOW()),
      (11, 'vehicle', 'update', '编辑车辆', '修改车辆信息', NOW()),
      (12, 'vehicle', 'delete', '删除车辆', '删除车辆数据', NOW()),
      -- 调度权限
      (13, 'dispatch', 'read', '查看调度', '查看调度单列表和详情', NOW()),
      (14, 'dispatch', 'create', '创建调度', '新增调度单', NOW()),
      (15, 'dispatch', 'update', '编辑调度', '修改调度单', NOW()),
      (16, 'dispatch', 'delete', '删除调度', '删除调度单', NOW()),
      -- 预约权限
      (17, 'reservation', 'read', '查看预约', '查看预约列表和详情', NOW()),
      (18, 'reservation', 'create', '创建预约', '新增预约', NOW()),
      (19, 'reservation', 'update', '编辑预约', '修改预约', NOW()),
      (20, 'reservation', 'delete', '删除预约', '取消预约', NOW()),
      -- 日计划权限
      (21, 'daily_plan', 'read', '查看日计划', '查看日计划列表和详情', NOW()),
      (22, 'daily_plan', 'create', '创建日计划', '新增日计划', NOW()),
      (23, 'daily_plan', 'update', '编辑日计划', '修改日计划', NOW()),
      (24, 'daily_plan', 'delete', '删除日计划', '删除日计划', NOW()),
      -- 短信权限
      (25, 'sms_template', 'read', '查看短信模板', '查看短信模板列表', NOW()),
      (26, 'sms_template', 'create', '创建短信模板', '新增短信模板', NOW()),
      (27, 'sms_template', 'update', '编辑短信模板', '修改短信模板', NOW()),
      (28, 'sms_template', 'delete', '删除短信模板', '删除短信模板', NOW()),
      (29, 'sms_record', 'read', '查看发送记录', '查看短信发送记录', NOW()),
      (30, 'sms_record', 'create', '发送短信', '发送短信', NOW()),
      -- 用户管理权限
      (31, 'user', 'read', '查看用户', '查看用户列表和详情', NOW()),
      (32, 'user', 'create', '创建用户', '新增用户', NOW()),
      (33, 'user', 'update', '编辑用户', '修改用户信息', NOW()),
      (34, 'user', 'delete', '删除用户', '删除用户', NOW()),
      -- 角色管理权限
      (35, 'role', 'read', '查看角色', '查看角色列表和详情', NOW()),
      (36, 'role', 'create', '创建角色', '新增角色', NOW()),
      (37, 'role', 'update', '编辑角色', '修改角色权限', NOW()),
      (38, 'role', 'delete', '删除角色', '删除角色', NOW()),
      -- 菜单管理权限
      (39, 'menu', 'read', '查看菜单', '查看菜单列表', NOW()),
      (40, 'menu', 'create', '创建菜单', '新增菜单', NOW()),
      (41, 'menu', 'update', '编辑菜单', '修改菜单', NOW()),
      (42, 'menu', 'delete', '删除菜单', '删除菜单', NOW())
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      description = VALUES(description)
  `);

  // 4. 角色-菜单关联
  console.log("  - 角色菜单关联...");
  await db.execute(sql`
    INSERT IGNORE INTO sys_role_menu (role_id, menu_id)
    VALUES 
      (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9),
      (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 17), (1, 18), (1, 19),
      (2, 1),
      (3, 1), (3, 2), (3, 3), (3, 4), (3, 5),
      (4, 1), (4, 6), (4, 7), (4, 8), (4, 9),
      (5, 1), (5, 2), (5, 3), (5, 5)
  `);

  // 5. 角色-权限关联
  console.log("  - 角色权限关联...");
  await db.execute(sql`
    INSERT IGNORE INTO sys_role_permission (role_id, permission_id)
    VALUES 
      -- 超级管理员：所有权限
      (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
      (1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17), (1, 18), (1, 19), (1, 20),
      (1, 21), (1, 22), (1, 23), (1, 24), (1, 25), (1, 26), (1, 27), (1, 28), (1, 29), (1, 30),
      (1, 31), (1, 32), (1, 33), (1, 34), (1, 35), (1, 36), (1, 37), (1, 38), (1, 39), (1, 40), (1, 41), (1, 42),
      -- 调度员：调度、预约、查看场站/司机/车辆、发送短信
      (3, 1), (3, 5), (3, 9), (3, 13), (3, 14), (3, 15), (3, 17), (3, 18), (3, 19), (3, 29), (3, 30),
      -- 场站管理员：场站CRUD、查看司机/车辆、查看调度/预约
      (4, 1), (4, 2), (4, 3), (4, 5), (4, 9), (4, 13), (4, 17), (4, 21),
      -- 司机：查看场站、查看自己的预约和调度
      (5, 1), (5, 13), (5, 17), (5, 18)
  `);

  // 6. 管理员用户
  console.log("  - 管理员用户...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await db.execute(sql`
    INSERT INTO sys_user (id, username, password, name, email, role_id, status, created_at)
    VALUES (UUID(), 'admin', ${hashedPassword}, '管理员', 'admin@hengde.com', 1, 1, NOW())
    ON DUPLICATE KEY UPDATE
      password = ${hashedPassword},
      name = VALUES(name),
      email = VALUES(email),
      role_id = VALUES(role_id),
      updated_at = NOW()
  `);

  // ==================== 业务表数据 ====================
  console.log("\n📦 初始化业务表数据...");

  // 5. 场站数据
  console.log("  - 场站数据...");
  await db.execute(sql`
    INSERT INTO biz_station (id, name, code, address, gas_source, total_plan, contact_person, contact_phone, station_type, status, created_at)
    VALUES 
      ('ST_YUANJING', '远景气源站', 'YJ-001', '陕西省榆林市远景工业园', '["CNG", "PNG"]', 48000, '张站长', '13900001001', 'mother', 'active', NOW()),
      ('ST_DANING', '大宁配送站', 'DN-001', '陕西省延安市大宁县', '["CNG"]', 20000, '李站长', '13900001002', 'distribution', 'active', NOW()),
      ('ST_HENGFENG', '恒丰加气站', 'HF-001', '陕西省西安市高新区', '["CNG", "LNG"]', 16000, '王站长', '13900001003', 'filling', 'active', NOW()),
      ('ST_PENGAO', '鹏奥储气站', 'PA-001', '陕西省咸阳市经开区', '["CNG"]', 12000, '赵站长', '13900001004', 'storage', 'active', NOW()),
      ('ST_DONGCHENG', '东城解压站', 'DC-001', '陕西省西安市东城区', '["PNG"]', 8000, '刘站长', '13900001005', 'decompression', 'active', NOW()),
      ('ST_GAOXIN', '高新母站', 'GX-001', '陕西省西安市高新区66号', '["CNG", "LNG"]', 25000, '陈站长', '13900001006', 'mother', 'active', NOW())
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      total_plan = VALUES(total_plan),
      station_type = VALUES(station_type),
      updated_at = NOW()
  `);

  // 6. 司机数据
  console.log("  - 司机数据...");
  await db.execute(sql`
    INSERT INTO biz_driver (id, name, phone, id_card, license_number, license_type, company, status, created_at)
    VALUES 
      ('DRV_001', '张三', '13900000001', '610000199001010001', 'A2123456', 'A2', '恒德运输一队', 'available', NOW()),
      ('DRV_002', '李四', '13900000002', '610000199002020002', 'A2234567', 'A2', '恒德运输二队', 'available', NOW()),
      ('DRV_003', '王五', '13900000003', '610000199003030003', 'A2345678', 'A2', '恒德运输一队', 'available', NOW()),
      ('DRV_004', '赵六', '13900000004', '610000199004040004', 'A2456789', 'A2', '恒德运输二队', 'busy', NOW()),
      ('DRV_005', '孙七', '13900000005', '610000199005050005', 'A2567890', 'A2', '恒德运输三队', 'available', NOW()),
      ('DRV_006', '周八', '13900000006', '610000199006060006', 'A2678901', 'A2', '恒德运输三队', 'available', NOW())
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      company = VALUES(company),
      status = VALUES(status),
      updated_at = NOW()
  `);

  // 7. 车辆数据
  console.log("  - 车辆数据...");
  await db.execute(sql`
    INSERT INTO biz_vehicle (id, plate, type, capacity, driver_id, status, created_at)
    VALUES 
      ('VEH_001', '陕A12345', 'CNG_Trailer', 25, 'DRV_001', 'available', NOW()),
      ('VEH_002', '陕A23456', 'CNG_Trailer', 30, 'DRV_002', 'available', NOW()),
      ('VEH_003', '陕A34567', 'CNG_Trailer', 35, 'DRV_003', 'available', NOW()),
      ('VEH_004', '陕A45678', 'CNG_Trailer', 28, 'DRV_004', 'busy', NOW()),
      ('VEH_005', '陕A56789', 'CNG_Trailer', 32, 'DRV_005', 'available', NOW()),
      ('VEH_006', '陕A67890', 'CNG_Trailer', 30, 'DRV_006', 'available', NOW())
    ON DUPLICATE KEY UPDATE
      capacity = VALUES(capacity),
      driver_id = VALUES(driver_id),
      status = VALUES(status),
      updated_at = NOW()
  `);

  // 8. 短信模板数据（使用新格式：变量带中文标签）
  console.log("  - 短信模板数据...");
  await db.execute(sql`
    INSERT INTO biz_sms_template (id, name, code, content, variables, status, description, created_by, created_at)
    VALUES 
      ('SMS_001', '调度确认通知', 'DISPATCH_CONFIRM', '【恒德能源】尊敬的{driver_name}司机，您的调度单{order_no}已确认，请于{time}到达{station_name}进行装卸。', '[{"key":"driver_name","label":"司机姓名"},{"key":"order_no","label":"调度单号"},{"key":"time","label":"时间"},{"key":"station_name","label":"场站名称"}]', 'active', '司机收到调度任务后的确认通知', 'system', NOW()),
      ('SMS_002', '计划调整通知', 'PLAN_ADJUST', '【恒德能源】{driver_name}司机，因{reason}，您的预约时间调整为{new_time}，请及时确认。', '[{"key":"driver_name","label":"司机姓名"},{"key":"reason","label":"原因"},{"key":"new_time","label":"新时间"}]', 'active', '调度计划变更时通知司机', 'system', NOW()),
      ('SMS_003', '站点协调通知', 'STATION_COORDINATE', '【恒德能源】管理员您好，{station_name}今日{direction}计划存在偏差{deviation}m³，请及时协调调度。', '[{"key":"station_name","label":"场站名称"},{"key":"direction","label":"方向"},{"key":"deviation","label":"偏差量"}]', 'active', '场站计划偏差提醒管理员', 'system', NOW()),
      ('SMS_004', '装卸完成通知', 'LOAD_COMPLETE', '【恒德能源】{driver_name}司机，调度单{order_no}装卸已完成，装卸量{amount}m³。感谢您的配合！', '[{"key":"driver_name","label":"司机姓名"},{"key":"order_no","label":"调度单号"},{"key":"amount","label":"装卸量"}]', 'active', '装卸完成后发送给司机的确认', 'system', NOW()),
      ('SMS_005', '预约成功通知', 'RESERVATION_SUCCESS', '【恒德能源】{driver_name}司机，您已成功预约{station_name}，预约时间{appointment_time}，预计装卸量{quantity}m³。', '[{"key":"driver_name","label":"司机姓名"},{"key":"station_name","label":"场站名称"},{"key":"appointment_time","label":"预约时间"},{"key":"quantity","label":"计划量"}]', 'active', '司机预约成功后的确认短信', 'system', NOW())
    ON DUPLICATE KEY UPDATE
      content = VALUES(content),
      variables = VALUES(variables),
      status = VALUES(status),
      updated_at = NOW()
  `);

  // 9. 日计划数据（今日）
  console.log("  - 日计划数据...");
  await db.execute(sql`
    INSERT INTO biz_daily_plan (id, plan_date, station_id, direction, plan_volume, actual_volume, status, notes, created_by, created_at)
    VALUES 
      (CONCAT('PLAN_', DATE_FORMAT(CURDATE(), '%Y%m%d'), '_YJ_UP'), CURDATE(), 'ST_YUANJING', 'upstream', 48000, 16500, 'confirmed', '今日上游供气计划', 'system', NOW()),
      (CONCAT('PLAN_', DATE_FORMAT(CURDATE(), '%Y%m%d'), '_DN_DOWN'), CURDATE(), 'ST_DANING', 'downstream', 20000, 6700, 'confirmed', '今日下游用气计划', 'system', NOW()),
      (CONCAT('PLAN_', DATE_FORMAT(CURDATE(), '%Y%m%d'), '_HF_DOWN'), CURDATE(), 'ST_HENGFENG', 'downstream', 16000, 5800, 'confirmed', '今日下游用气计划', 'system', NOW()),
      (CONCAT('PLAN_', DATE_FORMAT(CURDATE(), '%Y%m%d'), '_PA_DOWN'), CURDATE(), 'ST_PENGAO', 'downstream', 12000, 2200, 'confirmed', '今日下游用气计划', 'system', NOW())
    ON DUPLICATE KEY UPDATE
      plan_volume = VALUES(plan_volume),
      actual_volume = VALUES(actual_volume),
      status = VALUES(status),
      updated_at = NOW()
  `);

  console.log("\n✅ 数据初始化完成！");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("默认管理员账号: admin");
  console.log("默认管理员密码: admin123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  await pool.end();
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ 初始化失败:", e);
  process.exit(1);
});
