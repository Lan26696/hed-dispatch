/**
 * 短信测试 API
 * 用于测试亿美短信发送功能
 * 
 * POST /api/sms/test
 * 
 * 请求体:
 * {
 *   "mobile": "13800138000",      // 必填，手机号
 *   "content": "测试短信内容",     // 可选，短信内容（需包含签名）
 *   "type": "custom",             // 可选，类型：custom/verify/notify
 *   "code": "123456",             // type=verify 时必填
 *   "message": "通知消息",         // type=notify 时必填
 *   "signName": "测试"            // 可选，签名名称
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { emaySmsService } from '@/lib/services/emay-sms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, content, type = 'custom', code, message, signName = '测试' } = body;

    // 验证手机号
    if (!mobile) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '手机号不能为空' } },
        { status: 400 }
      );
    }

    // 简单的手机号格式验证
    if (!/^1[3-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '手机号格式不正确' } },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'verify':
        // 发送验证码短信
        if (!code) {
          return NextResponse.json(
            { success: false, error: { code: 'INVALID_INPUT', message: '验证码不能为空' } },
            { status: 400 }
          );
        }
        result = await emaySmsService.sendVerifyCode(mobile, code, signName);
        break;

      case 'notify':
        // 发送通知短信
        if (!message) {
          return NextResponse.json(
            { success: false, error: { code: 'INVALID_INPUT', message: '通知消息不能为空' } },
            { status: 400 }
          );
        }
        result = await emaySmsService.sendNotification(mobile, message, signName);
        break;

      case 'custom':
      default:
        // 发送自定义内容短信
        if (!content) {
          return NextResponse.json(
            { success: false, error: { code: 'INVALID_INPUT', message: '短信内容不能为空' } },
            { status: 400 }
          );
        }
        result = await emaySmsService.sendSms(mobile, content);
        break;
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          smsId: result.smsId,
          mobile,
          code: result.code,
          message: result.message,
        },
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: result.code, 
            message: result.message 
          } 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[SMS Test API] 错误:', error);
    const message = error instanceof Error ? error.message : '发送失败';
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sms/test
 * 获取账户余额和配置状态
 */
export async function GET() {
  try {
    // 检查配置
    const config = {
      appId: process.env.EMAY_APP_ID ? '已配置' : '未配置',
      secretKey: process.env.EMAY_SECRET_KEY ? '已配置' : '未配置',
      host: process.env.EMAY_HOST || '未配置（使用默认）',
      port: process.env.EMAY_PORT || '未配置（使用默认）',
      provider: process.env.SMS_PROVIDER || 'mock',
    };

    // 如果配置完整，查询余额
    let balance = null;
    if (process.env.EMAY_APP_ID && process.env.EMAY_SECRET_KEY) {
      const balanceResult = await emaySmsService.getBalance();
      console.log('balanceResult', balanceResult);
      if (balanceResult.success) {
        balance = balanceResult.balance;
      }
    }
    
    console.log('balance', balance);

    return NextResponse.json({
      success: true,
      data: {
        config,
        balance,
        tips: {
          sendCustom: 'POST /api/sms/test { "mobile": "手机号", "content": "【签名】短信内容" }',
          sendVerify: 'POST /api/sms/test { "mobile": "手机号", "type": "verify", "code": "123456", "signName": "签名" }',
          sendNotify: 'POST /api/sms/test { "mobile": "手机号", "type": "notify", "message": "通知内容", "signName": "签名" }',
        },
      },
    });
  } catch (error) {
    console.error('[SMS Test API] 获取状态错误:', error);
    const message = error instanceof Error ? error.message : '获取状态失败';
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}

