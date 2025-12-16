/**
 * 亿美短信 SDK HTTP 客户端
 * 封装与亿美短信平台的 HTTP 通信
 */

import { ResultModel, ResultCode } from "./types";
import {
  aesEncrypt,
  aesDecrypt,
  gzipCompress,
  gzipDecompress,
  md5,
} from "./crypto";

/**
 * HTTP 请求选项
 */
interface HttpRequestOptions {
  /** 请求超时时间（毫秒） */
  timeout?: number;
}

/**
 * 远程签名标识
 */
const REMOTE_SIGN = "SDK";

/**
 * 发送加密 HTTP 请求
 * 请求数据经过 JSON -> GZIP -> AES 加密
 * 响应数据经过 AES 解密 -> GZIP 解压 -> JSON 解析
 *
 * @param appId - 亿美服务账号
 * @param secretKey - 亿美服务密码
 * @param url - 请求 URL
 * @param data - 请求数据
 * @param options - 请求选项
 * @returns 响应结果
 */
export async function sendEncryptedRequest<T>(
  appId: string,
  secretKey: string,
  url: string,
  data: object,
  options: HttpRequestOptions = {}
): Promise<ResultModel<T>> {
  const { timeout = 30000 } = options;
  let code: string = ResultCode.SYSTEM;
  let result: T | null = null;

  try {
    // 1. 将请求数据转为 JSON 字符串
    const jsonString = JSON.stringify(data);
    const jsonBytes = Buffer.from(jsonString, "utf-8");

    // 2. GZIP 压缩
    const compressedBytes = await gzipCompress(jsonBytes);

    // 3. AES 加密
    const secretKeyBuffer = Buffer.from(secretKey, "utf-8");
    const encryptedBytes = aesEncrypt(compressedBytes, secretKeyBuffer);

    if (!encryptedBytes) {
      console.error("[HTTP] AES 加密失败");
      return { code, result };
    }

    // 4. 发送 HTTP 请求
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          appId: appId,
          encode: "UTF-8",
          gzip: "on",
          remoteSign: REMOTE_SIGN,
        },
        body: new Uint8Array(encryptedBytes),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status !== 200) {
        console.error("[HTTP] 请求失败，状态码:", response.status);
        return { code, result };
      }

      // 5. 获取响应头中的结果码
      code = response.headers.get("result") || ResultCode.SYSTEM;

      if (code === ResultCode.SUCCESS) {
        // 6. 获取响应体
        const responseBytes = Buffer.from(await response.arrayBuffer());

        // 7. AES 解密
        const decryptedBytes = aesDecrypt(responseBytes, secretKeyBuffer);
        if (!decryptedBytes) {
          console.error("[HTTP] AES 解密失败");
          return { code: ResultCode.SYSTEM, result };
        }

        // 8. GZIP 解压
        const decompressedBytes = await gzipDecompress(decryptedBytes);

        // 9. JSON 解析
        const responseJson = decompressedBytes.toString("utf-8");
        result = JSON.parse(responseJson) as T;
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("[HTTP] 请求超时");
      } else {
        console.error("[HTTP] 请求错误:", fetchError);
      }
      return { code, result };
    }
  } catch (error) {
    console.error("[HTTP] 处理错误:", error);
    return { code, result };
  }

  return { code, result };
}

/**
 * 发送表单 HTTP 请求
 * 用于简单的 GET/POST 表单请求（如状态报告重新获取）
 *
 * @param url - 请求 URL
 * @param params - 表单参数
 * @param options - 请求选项
 * @returns 响应结果
 */
export async function sendFormRequest<T>(
  url: string,
  params: Record<string, string>,
  options: HttpRequestOptions = {}
): Promise<ResultModel<T>> {
  const { timeout = 30000 } = options;
  let code: string = ResultCode.SYSTEM;
  let result: T | null = null;

  try {
    // 构建表单数据
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status !== 200) {
        console.error("[HTTP] 表单请求失败，状态码:", response.status);
        return { code, result };
      }

      code = ResultCode.SUCCESS;
      const responseText = await response.text();

      if (responseText) {
        try {
          result = JSON.parse(responseText) as T;
        } catch {
          // 如果不是 JSON，直接返回文本
          result = responseText as unknown as T;
        }
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("[HTTP] 表单请求超时");
      } else {
        console.error("[HTTP] 表单请求错误:", fetchError);
      }
      return { code, result };
    }
  } catch (error) {
    console.error("[HTTP] 表单处理错误:", error);
    return { code, result };
  }

  return { code, result };
}

/**
 * 生成签名
 * 签名规则: MD5(appId + secretKey + timestamp)
 *
 * @param appId - 亿美服务账号
 * @param secretKey - 亿美服务密码
 * @param timestamp - 时间戳 (yyyyMMddHHmmss)
 * @returns MD5 签名
 */
export function generateSign(
  appId: string,
  secretKey: string,
  timestamp: string
): string {
  return md5(appId + secretKey + timestamp);
}

/**
 * 格式化日期为指定格式
 *
 * @param date - 日期对象
 * @param format - 格式字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date,
  format: string = "yyyyMMddHHmmss"
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return format
    .replace("yyyy", String(year))
    .replace("MM", month)
    .replace("dd", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}
