/**
 * 批量短信发送 API
 * 
 * POST /api/sms/batch
 * 
 * 请求体（批量相同内容）:
 * {
 *   "type": "same",
 *   "mobiles": ["13800138001", "13800138002"],
 *   "content": "【签名】短信内容"
 * }
 * 
 * 请求体（个性化内容）:
 * {
 *   "type": "personal",
 *   "messages": [
 *     { "mobile": "13800138001", "content": "【签名】张三，您的验证码是..." },
 *     { "mobile": "13800138002", "content": "【签名】李四，您的验证码是..." }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { emaySmsService } from '@/lib/services/emay-sms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'same', mobiles, content, messages } = body;

    if (type === 'same') {
      // 批量发送相同内容
      if (!mobiles || !Array.isArray(mobiles) || mobiles.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_INPUT', message: '手机号列表不能为空' } },
          { status: 400 }
        );
      }

      if (!content) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_INPUT', message: '短信内容不能为空' } },
          { status: 400 }
        );
      }

      // 验证手机号格式
      const invalidMobiles = mobiles.filter((m: string) => !/^1[3-9]\d{9}$/.test(m));
      if (invalidMobiles.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'INVALID_INPUT', 
              message: `以下手机号格式不正确: ${invalidMobiles.join(', ')}` 
            } 
          },
          { status: 400 }
        );
      }

      const result = await emaySmsService.sendBatchSms(mobiles, content);

      return NextResponse.json({
        success: result.success,
        data: {
          successCount: result.successCount,
          failCount: result.failCount,
          results: result.results,
          code: result.code,
          message: result.message,
        },
      });

    } else if (type === 'personal') {
      // 个性化发送
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_INPUT', message: '消息列表不能为空' } },
          { status: 400 }
        );
      }

      // 验证消息格式
      for (const msg of messages) {
        if (!msg.mobile || !msg.content) {
          return NextResponse.json(
            { success: false, error: { code: 'INVALID_INPUT', message: '每条消息必须包含 mobile 和 content' } },
            { status: 400 }
          );
        }
        if (!/^1[3-9]\d{9}$/.test(msg.mobile)) {
          return NextResponse.json(
            { success: false, error: { code: 'INVALID_INPUT', message: `手机号格式不正确: ${msg.mobile}` } },
            { status: 400 }
          );
        }
      }

      const result = await emaySmsService.sendPersonalitySms(messages);

      return NextResponse.json({
        success: result.success,
        data: {
          successCount: result.successCount,
          failCount: result.failCount,
          results: result.results,
          code: result.code,
          message: result.message,
        },
      });

    } else {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '无效的发送类型，请使用 same 或 personal' } },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[SMS Batch API] 错误:', error);
    const message = error instanceof Error ? error.message : '发送失败';
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}

