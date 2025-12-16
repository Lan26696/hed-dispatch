/**
 * 格式化工具函数
 */

/**
 * 格式化数字（千分位）
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "-";
  return num.toLocaleString("zh-CN");
}

/**
 * 格式化容量（Nm³）
 * @param volume 容量值
 * @param unit 是否显示单位
 */
export function formatVolume(
  volume: number | null | undefined,
  unit = true,
): string {
  if (volume === null || volume === undefined) return "-";
  const formatted =
    volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : volume.toString();
  return unit ? `${formatted} Nm³` : formatted;
}

/**
 * 格式化压力（MPa）
 */
export function formatPressure(pressure: number | null | undefined): string {
  if (pressure === null || pressure === undefined) return "-";
  return `${pressure.toFixed(1)} MPa`;
}

/**
 * 格式化距离（km）
 */
export function formatDistance(distance: number | null | undefined): string {
  if (distance === null || distance === undefined) return "-";
  return `${distance} km`;
}

/**
 * 格式化百分比
 */
export function formatPercent(
  value: number | null | undefined,
  decimals = 0,
): string {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(decimals)}%`;
}

/**
 * 格式化手机号（隐藏中间4位）
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "-";
  if (phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}

/**
 * 截断文本
 */
export function truncate(
  text: string | null | undefined,
  maxLength: number,
): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
