-- =============================================
-- 业务表
-- =============================================

-- 场站表
CREATE TABLE IF NOT EXISTS biz_stations (
id VARCHAR(50) PRIMARY KEY COMMENT '场站ID',
name VARCHAR(100) NOT NULL COMMENT '场站名称',
code VARCHAR(50) UNIQUE COMMENT '场站编码',
address VARCHAR(255) COMMENT '地址',
longitude DECIMAL(10, 7) COMMENT '经度',
latitude DECIMAL(10, 7) COMMENT '纬度',
gas_source JSON COMMENT '气源构成',
total_plan DECIMAL(12, 2) DEFAULT 0 COMMENT '日计划量(m³)',
contact_person VARCHAR(50) COMMENT '联系人',
contact_phone VARCHAR(20) COMMENT '联系电话',
station_type ENUM('decompression', 'mother', 'filling', 'distribution', 'storage', 'other') NOT NULL DEFAULT 'filling' COMMENT '场站类型：解压站/母站/加气站/配送中心/储气站/其他',
status ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active' COMMENT '状态',
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
INDEX idx_name (name),
INDEX idx_code (code),
INDEX idx_status (status),
INDEX idx_station_type (station_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场站信息表';

-- 司机表
CREATE TABLE IF NOT EXISTS biz_drivers (
id VARCHAR(50) PRIMARY KEY COMMENT '司机ID',
name VARCHAR(50) NOT NULL COMMENT '姓名',
phone VARCHAR(20) NOT NULL COMMENT '手机号',
id_card VARCHAR(20) COMMENT '身份证号',
license_number VARCHAR(50) COMMENT '驾驶证号',
license_type VARCHAR(10) COMMENT '驾照类型',
company VARCHAR(100) COMMENT '所属公司',
user_id VARCHAR(50) COMMENT '关联用户ID',
status ENUM('available', 'busy', 'offline', 'inactive') NOT NULL DEFAULT 'available' COMMENT '状态',
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
INDEX idx_phone (phone),
INDEX idx_status (status),
FOREIGN KEY (user_id) REFERENCES sys_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='司机信息表';

-- 车辆表
CREATE TABLE IF NOT EXISTS biz_vehicles (
id VARCHAR(50) PRIMARY KEY COMMENT '车辆ID',
plate VARCHAR(20) NOT NULL UNIQUE COMMENT '车牌号',
type ENUM('CNG_Trailer', 'PNG_Pipe', 'Other') NOT NULL DEFAULT 'CNG_Trailer' COMMENT '车辆类型',
capacity DECIMAL(10, 2) DEFAULT 0 COMMENT '容量(m³)',
driver_id VARCHAR(50) COMMENT '绑定司机ID',
status ENUM('available', 'busy', 'maintenance', 'inactive') NOT NULL DEFAULT 'available' COMMENT '状态',
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
INDEX idx_plate (plate),
INDEX idx_status (status),
FOREIGN KEY (driver_id) REFERENCES biz_drivers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆信息表';

-- 日计划表（上游/下游）
CREATE TABLE IF NOT EXISTS biz_daily_plans (
id VARCHAR(50) PRIMARY KEY COMMENT '计划ID',
plan_date DATE NOT NULL COMMENT '计划日期',
station_id VARCHAR(50) NOT NULL COMMENT '场站ID',
direction ENUM('upstream', 'downstream') NOT NULL COMMENT '方向：上游/下游',
plan_volume DECIMAL(12, 2) NOT NULL DEFAULT 0 COMMENT '计划量(m³)',
actual_volume DECIMAL(12, 2) DEFAULT 0 COMMENT '实际完成量(m³)',
hourly_plans JSON COMMENT '小时计划分布',
status ENUM('draft', 'confirmed', 'completed') NOT NULL DEFAULT 'draft' COMMENT '状态',
notes TEXT COMMENT '备注',
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
created_by VARCHAR(50) COMMENT '创建人',
UNIQUE KEY uk_station_date_direction (station_id, plan_date, direction),
INDEX idx_plan_date (plan_date),
INDEX idx_station_id (station_id),
INDEX idx_direction (direction),
INDEX idx_status (status),
FOREIGN KEY (station_id) REFERENCES biz_stations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日计划表';

-- 预约表
CREATE TABLE IF NOT EXISTS biz_reservations (
id VARCHAR(50) PRIMARY KEY COMMENT '预约ID',
station_id VARCHAR(50) NOT NULL COMMENT '场站ID',
driver_id VARCHAR(50) NOT NULL COMMENT '司机ID',
vehicle_id VARCHAR(50) NOT NULL COMMENT '车辆ID',
appointment_time DATETIME NOT NULL COMMENT '预约时间',
planned_quantity DECIMAL(10, 2) DEFAULT 0 COMMENT '计划装卸量(m³)',
actual_quantity DECIMAL(10, 2) COMMENT '实际装卸量(m³)',
status ENUM('pending', 'confirmed', 'arrived', 'loading', 'completed', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT '状态',
notes TEXT COMMENT '备注',
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
INDEX idx_station_id (station_id),
INDEX idx_driver_id (driver_id),
INDEX idx_appointment_time (appointment_time),
INDEX idx_status (status),
FOREIGN KEY (station_id) REFERENCES biz_stations(id) ON DELETE CASCADE,
FOREIGN KEY (driver_id) REFERENCES biz_drivers(id) ON DELETE CASCADE,
FOREIGN KEY (vehicle_id) REFERENCES biz_vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预约信息表';

-- 调度单表
CREATE TABLE IF NOT EXISTS biz_dispatch_orders (
id VARCHAR(50) PRIMARY KEY COMMENT '调度单ID',
order_no VARCHAR(50) COMMENT '调度单号',
reservation_id VARCHAR(50) COMMENT '关联预约ID',
station_id VARCHAR(50) NOT NULL COMMENT '场站ID',
driver_id VARCHAR(50) NOT NULL COMMENT '司机ID',
vehicle_id VARCHAR(50) NOT NULL COMMENT '车辆ID',
scheduled_time DATETIME NOT NULL COMMENT '计划时间',
actual_arrival_time DATETIME COMMENT '实际到达时间',
actual_departure_time DATETIME COMMENT '实际离开时间',
load_amount DECIMAL(10, 2) COMMENT '装卸量(m³)',
status ENUM('scheduled', 'notified', 'arrived', 'loading', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled' COMMENT '状态',
notes TEXT COMMENT '备注',
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
INDEX idx_order_no (order_no),
INDEX idx_station_id (station_id),
INDEX idx_scheduled_time (scheduled_time),
INDEX idx_status (status),
FOREIGN KEY (reservation_id) REFERENCES biz_reservations(id) ON DELETE SET NULL,
FOREIGN KEY (station_id) REFERENCES biz_stations(id) ON DELETE CASCADE,
FOREIGN KEY (driver_id) REFERENCES biz_drivers(id) ON DELETE CASCADE,
FOREIGN KEY (vehicle_id) REFERENCES biz_vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='调度单表';

-- 短信模板表
CREATE TABLE IF NOT EXISTS sms_templates (
id VARCHAR(50) PRIMARY KEY COMMENT '模板ID',
name VARCHAR(100) NOT NULL COMMENT '模板名称',
code VARCHAR(50) NOT NULL UNIQUE COMMENT '模板编码',
content TEXT NOT NULL COMMENT '模板内容',
variables JSON COMMENT '变量列表',
status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending' COMMENT '状态：已启用/已禁用/待审核',
description VARCHAR(255) COMMENT '模板描述',
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
created_by VARCHAR(50) COMMENT '创建人',
INDEX idx_code (code),
INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='短信模板表';

-- 插入示例场站数据
INSERT INTO biz_stations (id, name, code, address, gas_source, total_plan, contact_person, contact_phone, station_type, status) VALUES
('station-001', '东城CNG加气站', 'DC-001', '东城区工业园区1号', '["CNG", "PNG"]', 5000, '张经理', '13900001001', 'filling', 'active'),
('station-002', '西城CNG储配站', 'XC-001', '西城区物流园区5号', '["CNG"]', 8000, '李经理', '13900001002', 'storage', 'active'),
('station-003', '南区解压站', 'NQ-001', '南区开发区8号', '["CNG", "PNG"]', 6500, '王经理', '13900001003', 'decompression', 'active'),
('station-004', '北郊LNG储备站', 'BJ-001', '北郊新区产业园15号', '["LNG"]', 12000, '赵经理', '13900001004', 'storage', 'active'),
('station-005', '高新区加气母站', 'GX-001', '高新技术开发区66号', '["CNG", "LNG"]', 9500, '刘经理', '13900001005', 'mother', 'active'),
('station-006', '经开区配送中心', 'JK-001', '经济开发区物流港3号', '["CNG"]', 7200, '陈经理', '13900001006', 'distribution', 'active')
ON DUPLICATE KEY UPDATE
total_plan = VALUES(total_plan),
station_type = VALUES(station_type),
updated_at = CURRENT_TIMESTAMP;

-- 插入示例司机数据
INSERT INTO biz_drivers (id, name, phone, id_card, license_number, license_type, company, status) VALUES
('driver-001', '张三', '13900000001', '610000199001010001', 'A2123456', 'A2', '恒德运输一队', 'available'),
('driver-002', '李四', '13900000002', '610000199002020002', 'A2234567', 'A2', '恒德运输二队', 'available'),
('driver-003', '王五', '13900000003', '610000199003030003', 'A2345678', 'A2', '恒德运输一队', 'available'),
('driver-004', '赵六', '13900000004', '610000199004040004', 'A2456789', 'A2', '恒德运输二队', 'available'),
('driver-005', '孙七', '13900000005', '610000199005050005', 'A2567890', 'A2', '恒德运输三队', 'available'),
('driver-006', '周八', '13900000006', '610000199006060006', 'A2678901', 'A2', '恒德运输三队', 'busy')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 插入示例车辆数据
INSERT INTO biz_vehicles (id, plate, type, capacity, driver_id, status) VALUES
('vehicle-001', '陕A12345', 'CNG_Trailer', 25, 'driver-001', 'available'),
('vehicle-002', '陕A23456', 'CNG_Trailer', 30, 'driver-002', 'available'),
('vehicle-003', '陕A34567', 'CNG_Trailer', 35, 'driver-003', 'available'),
('vehicle-004', '陕A45678', 'CNG_Trailer', 28, 'driver-004', 'available'),
('vehicle-005', '陕A56789', 'CNG_Trailer', 32, 'driver-005', 'available'),
('vehicle-006', '陕A67890', 'CNG_Trailer', 30, 'driver-006', 'busy')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 插入示例调度单数据（当前结算周期内）
INSERT INTO biz_dispatch_orders (id, order_no, station_id, driver_id, vehicle_id, scheduled_time, actual_arrival_time, actual_departure_time, load_amount, status, notes) VALUES
-- 东城站调度单
('dispatch-001', 'DD2024121401', 'station-001', 'driver-001', 'vehicle-001', DATE_ADD(CURDATE(), INTERVAL 9 HOUR), DATE_ADD(CURDATE(), INTERVAL 9.5 HOUR), DATE_ADD(CURDATE(), INTERVAL 10.5 HOUR), 25, 'completed', '正常完成'),
('dispatch-002', 'DD2024121402', 'station-001', 'driver-002', 'vehicle-002', DATE_ADD(CURDATE(), INTERVAL 11 HOUR), DATE_ADD(CURDATE(), INTERVAL 11.2 HOUR), DATE_ADD(CURDATE(), INTERVAL 12.2 HOUR), 28, 'completed', '正常完成'),
('dispatch-003', 'DD2024121403', 'station-001', 'driver-003', 'vehicle-003', DATE_ADD(CURDATE(), INTERVAL 14 HOUR), NULL, NULL, 30, 'scheduled', '等待执行'),
-- 西城站调度单
('dispatch-004', 'DD2024121404', 'station-002', 'driver-004', 'vehicle-004', DATE_ADD(CURDATE(), INTERVAL 10 HOUR), DATE_ADD(CURDATE(), INTERVAL 10.3 HOUR), DATE_ADD(CURDATE(), INTERVAL 11.5 HOUR), 35, 'completed', '正常完成'),
('dispatch-005', 'DD2024121405', 'station-002', 'driver-001', 'vehicle-001', DATE_ADD(CURDATE(), INTERVAL 13 HOUR), DATE_ADD(CURDATE(), INTERVAL 13.2 HOUR), NULL, 30, 'loading', '装卸中'),
('dispatch-006', 'DD2024121406', 'station-002', 'driver-005', 'vehicle-005', DATE_ADD(CURDATE(), INTERVAL 15 HOUR), NULL, NULL, 32, 'notified', '已通知司机'),
('dispatch-007', 'DD2024121407', 'station-002', 'driver-002', 'vehicle-002', DATE_ADD(CURDATE(), INTERVAL 17 HOUR), NULL, NULL, 28, 'scheduled', '等待执行'),
-- 南区站调度单
('dispatch-008', 'DD2024121408', 'station-003', 'driver-003', 'vehicle-003', DATE_ADD(CURDATE(), INTERVAL 9 HOUR), DATE_ADD(CURDATE(), INTERVAL 9.1 HOUR), DATE_ADD(CURDATE(), INTERVAL 10 HOUR), 32, 'completed', '正常完成'),
('dispatch-009', 'DD2024121409', 'station-003', 'driver-006', 'vehicle-006', DATE_ADD(CURDATE(), INTERVAL 12 HOUR), DATE_ADD(CURDATE(), INTERVAL 12.5 HOUR), NULL, 30, 'arrived', '已到达场站'),
('dispatch-010', 'DD2024121410', 'station-003', 'driver-004', 'vehicle-004', DATE_ADD(CURDATE(), INTERVAL 16 HOUR), NULL, NULL, 28, 'scheduled', '等待执行'),
-- 北郊站调度单
('dispatch-011', 'DD2024121411', 'station-004', 'driver-001', 'vehicle-001', DATE_ADD(CURDATE(), INTERVAL 8.5 HOUR), DATE_ADD(CURDATE(), INTERVAL 8.8 HOUR), DATE_ADD(CURDATE(), INTERVAL 10 HOUR), 38, 'completed', '正常完成'),
('dispatch-012', 'DD2024121412', 'station-004', 'driver-002', 'vehicle-002', DATE_ADD(CURDATE(), INTERVAL 11.5 HOUR), DATE_ADD(CURDATE(), INTERVAL 11.8 HOUR), DATE_ADD(CURDATE(), INTERVAL 13 HOUR), 35, 'completed', '正常完成'),
('dispatch-013', 'DD2024121413', 'station-004', 'driver-005', 'vehicle-005', DATE_ADD(CURDATE(), INTERVAL 14 HOUR), NULL, NULL, 40, 'notified', '已通知司机'),
-- 高新区站调度单
('dispatch-014', 'DD2024121414', 'station-005', 'driver-003', 'vehicle-003', DATE_ADD(CURDATE(), INTERVAL 9.5 HOUR), DATE_ADD(CURDATE(), INTERVAL 9.8 HOUR), DATE_ADD(CURDATE(), INTERVAL 11 HOUR), 33, 'completed', '正常完成'),
('dispatch-015', 'DD2024121415', 'station-005', 'driver-004', 'vehicle-004', DATE_ADD(CURDATE(), INTERVAL 13.5 HOUR), DATE_ADD(CURDATE(), INTERVAL 13.8 HOUR), NULL, 28, 'loading', '装卸中'),
-- 经开区站调度单
('dispatch-016', 'DD2024121416', 'station-006', 'driver-006', 'vehicle-006', DATE_ADD(CURDATE(), INTERVAL 10.5 HOUR), DATE_ADD(CURDATE(), INTERVAL 10.8 HOUR), DATE_ADD(CURDATE(), INTERVAL 12 HOUR), 30, 'completed', '正常完成'),
('dispatch-017', 'DD2024121417', 'station-006', 'driver-005', 'vehicle-005', DATE_ADD(CURDATE(), INTERVAL 14.5 HOUR), NULL, NULL, 32, 'scheduled', '等待执行')
ON DUPLICATE KEY UPDATE
status = VALUES(status),
load_amount = VALUES(load_amount),
updated_at = CURRENT_TIMESTAMP;

-- 插入短信模板默认数据
INSERT INTO sms_templates (id, name, code, content, variables, status, description, created_by) VALUES
('sms-tpl-001', '调度确认通知', 'DISPATCH_CONFIRM',
'【恒德能源】尊敬的{driver_name}司机，您的调度单{order_no}已确认，请于{time}到达{station_name}进行装卸。客服电话：400-xxx-xxxx',
'["driver_name", "order_no", "time", "station_name"]', 'active', '司机收到调度任务后的确认通知', 'system'),
('sms-tpl-002', '计划调整通知', 'PLAN_ADJUST',
'【恒德能源】{driver_name}司机，因{reason}，您的预约时间调整为{new_time}，请及时确认。回复1确认，回复2取消。',
'["driver_name", "reason", "new_time"]', 'active', '调度计划变更时通知司机', 'system'),
('sms-tpl-003', '站点协调通知', 'STATION_COORDINATE',
'【恒德能源】管理员您好，{station_name}今日{direction}计划存在偏差{deviation}m³，请及时协调调度。',
'["station_name", "direction", "deviation"]', 'active', '场站计划偏差提醒管理员', 'system'),
('sms-tpl-004', '装卸完成通知', 'LOAD_COMPLETE',
'【恒德能源】{driver_name}司机，调度单{order_no}装卸已完成，装卸量{amount}m³。感谢您的配合！',
'["driver_name", "order_no", "amount"]', 'pending', '装卸完成后发送给司机的确认', 'system'),
('sms-tpl-005', '预约成功通知', 'RESERVATION_SUCCESS',
'【恒德能源】{driver_name}司机，您已成功预约{station_name}，预约时间{appointment_time}，预计装卸量{quantity}m³。请准时到达。',
'["driver_name", "station_name", "appointment_time", "quantity"]', 'active', '司机预约成功后的确认短信', 'system'),
('sms-tpl-006', '到站提醒', 'ARRIVAL_REMINDER',
'【恒德能源】{driver_name}司机，您即将到达{station_name}，预计{eta}分钟后到站。请注意行车安全。',
'["driver_name", "station_name", "eta"]', 'active', '司机即将到达场站时的提醒', 'system')
ON DUPLICATE KEY UPDATE
content = VALUES(content),
variables = VALUES(variables),
updated_at = NOW();

-- 插入今日日计划数据（上游供气+下游用气）
-- 注意：实际运行时应该使用 CURDATE() 获取当天日期
INSERT INTO biz_daily_plans (id, plan_date, station_id, direction, plan_volume, actual_volume, status, notes, created_by) VALUES
-- 远景站（上游气源站）- 今日总供气计划
('plan-today-yuanjing-up', CURDATE(), 'ST_YUANJING', 'upstream', 48000.00, 16500.00, 'confirmed', '今日上游供气计划', 'system'),
-- 大宁站（下游用气站）
('plan-today-daning-down', CURDATE(), 'ST_DANING', 'downstream', 20000.00, 6700.00, 'confirmed', '今日下游用气计划', 'system'),
-- 恒丰站（下游用气站）
('plan-today-hengfeng-down', CURDATE(), 'ST_HENGFENG', 'downstream', 16000.00, 5800.00, 'confirmed', '今日下游用气计划', 'system'),
-- 鹏奥站（下游用气站）
('plan-today-pengao-down', CURDATE(), 'ST_PENGAO', 'downstream', 12000.00, 2200.00, 'confirmed', '今日下游用气计划', 'system')
ON DUPLICATE KEY UPDATE
plan_volume = VALUES(plan_volume),
actual_volume = VALUES(actual_volume),
status = VALUES(status),
updated_at = NOW();
