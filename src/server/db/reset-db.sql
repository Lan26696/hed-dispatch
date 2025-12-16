-- =============================================
-- 重置数据库脚本
-- 运行方式: mysql -u root -p device_api < reset-db.sql
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;

-- 删除所有业务表
DROP TABLE IF EXISTS biz_sms_record;
DROP TABLE IF EXISTS biz_sms_template;
DROP TABLE IF EXISTS biz_dispatch_order;
DROP TABLE IF EXISTS biz_reservation;
DROP TABLE IF EXISTS biz_daily_plan;
DROP TABLE IF EXISTS biz_vehicle;
DROP TABLE IF EXISTS biz_driver;
DROP TABLE IF EXISTS biz_station;

-- 删除所有系统表
DROP TABLE IF EXISTS sys_role_menu;
DROP TABLE IF EXISTS sys_verification_token;
DROP TABLE IF EXISTS sys_session;
DROP TABLE IF EXISTS sys_account;
DROP TABLE IF EXISTS sys_menu;
DROP TABLE IF EXISTS sys_user;
DROP TABLE IF EXISTS sys_role;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Database reset completed!' AS message;
