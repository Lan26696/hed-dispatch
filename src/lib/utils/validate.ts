/**
 * 校验工具函数
 */

/**
 * 校验手机号
 */
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 校验邮箱
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 校验身份证号
 */
export function isValidIdCard(idCard: string): boolean {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(
    idCard,
  );
}

/**
 * 校验车牌号
 */
export function isValidPlateNo(plateNo: string): boolean {
  // 普通车牌：省份简称 + 字母 + 5位字母数字
  // 新能源车牌：省份简称 + 字母 + 6位字母数字
  return /^[\u4e00-\u9fa5][A-Z][·]?[A-Z0-9]{5,6}$/.test(plateNo);
}

/**
 * 校验用户名（字母开头，允许字母数字下划线，4-20位）
 */
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/.test(username);
}

/**
 * 校验密码强度
 * @returns 0-弱 1-中 2-强
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  return Math.min(strength, 2);
}
