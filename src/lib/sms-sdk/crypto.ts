/**
 * 亿美短信 SDK 加密工具
 * 实现 AES 加密/解密 和 GZIP 压缩/解压
 */

import crypto from 'crypto';
import zlib from 'zlib';

/**
 * AES 加密算法常量
 */
const AES_ALGORITHM = 'aes-128-ecb';

/**
 * AES 加密
 * 使用 AES/ECB/PKCS5Padding 算法（PKCS5 在 Node.js 中等同于 PKCS7）
 * 
 * @param content - 待加密内容
 * @param password - 密钥（必须是16字节）
 * @returns 加密后的数据
 */
export function aesEncrypt(content: Buffer, password: Buffer): Buffer | null {
  if (!content || !password) {
    return null;
  }
  
  try {
    // 确保密钥是16字节（128位）
    const key = normalizeKey(password);
    
    // 创建加密器，ECB 模式不需要 IV
    const cipher = crypto.createCipheriv(AES_ALGORITHM, key, null);
    
    // 加密数据
    const encrypted = Buffer.concat([
      cipher.update(content),
      cipher.final()
    ]);
    
    return encrypted;
  } catch (error) {
    console.error('[AES] 加密错误:', error);
    return null;
  }
}

/**
 * AES 解密
 * 使用 AES/ECB/PKCS5Padding 算法
 * 
 * @param content - 待解密内容
 * @param password - 密钥（必须是16字节）
 * @returns 解密后的数据
 */
export function aesDecrypt(content: Buffer, password: Buffer): Buffer | null {
  if (!content || !password) {
    return null;
  }
  
  try {
    // 确保密钥是16字节（128位）
    const key = normalizeKey(password);
    
    // 创建解密器，ECB 模式不需要 IV
    const decipher = crypto.createDecipheriv(AES_ALGORITHM, key, null);
    
    // 解密数据
    const decrypted = Buffer.concat([
      decipher.update(content),
      decipher.final()
    ]);
    
    return decrypted;
  } catch (error) {
    console.error('[AES] 解密错误:', error);
    return null;
  }
}

/**
 * 规范化密钥长度
 * AES-128 需要 16 字节密钥
 * 
 * @param key - 原始密钥
 * @returns 16字节的密钥
 */
function normalizeKey(key: Buffer): Buffer {
  if (key.length === 16) {
    return key;
  }
  
  if (key.length > 16) {
    // 截取前16字节
    return key.subarray(0, 16);
  }
  
  // 不足16字节则填充0
  const normalizedKey = Buffer.alloc(16, 0);
  key.copy(normalizedKey);
  return normalizedKey;
}

/**
 * GZIP 压缩
 * 
 * @param data - 待压缩数据
 * @returns 压缩后的数据
 */
export function gzipCompress(data: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zlib.gzip(data, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * GZIP 解压
 * 
 * @param data - 待解压数据
 * @returns 解压后的数据
 */
export function gzipDecompress(data: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zlib.gunzip(data, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * 同步版 GZIP 压缩
 * 
 * @param data - 待压缩数据
 * @returns 压缩后的数据
 */
export function gzipCompressSync(data: Buffer): Buffer {
  return zlib.gzipSync(data);
}

/**
 * 同步版 GZIP 解压
 * 
 * @param data - 待解压数据
 * @returns 解压后的数据
 */
export function gzipDecompressSync(data: Buffer): Buffer {
  return zlib.gunzipSync(data);
}

/**
 * MD5 哈希
 * 
 * @param data - 待哈希数据
 * @returns MD5 哈希值（小写十六进制字符串）
 */
export function md5(data: string | Buffer): string {
  return crypto.createHash('md5').update(data).digest('hex');
}
