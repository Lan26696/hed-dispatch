/**
 * 测试短信余额查询
 * 运行: npx tsx src/scripts/test-sms-balance.ts
 */
import "dotenv/config";
import { emaySmsService } from "../lib/services/emay-sms";

async function main() {
  console.log("🔍 查询短信账户余额...\n");

  console.log("配置信息:");
  console.log("  EMAY_APP_ID:", process.env.EMAY_APP_ID ? "已配置" : "未配置");
  console.log(
    "  EMAY_SECRET_KEY:",
    process.env.EMAY_SECRET_KEY ? "已配置" : "未配置",
  );
  console.log("  EMAY_HOST:", process.env.EMAY_HOST ?? "默认");
  console.log("  EMAY_PORT:", process.env.EMAY_PORT ?? "默认");
  console.log("");

  try {
    const result = await emaySmsService.getBalance();

    console.log("查询结果:");
    console.log("  成功:", result.success);
    console.log("  余额:", result.balance ?? "N/A");
    console.log("  代码:", result.code);
    console.log("  消息:", result.message);

    if (!result.success) {
      console.log("\n❌ 查询失败，请检查配置是否正确");
    } else {
      console.log(`\n✅ 当前余额: ${result.balance} 条`);
    }
  } catch (error) {
    console.error("❌ 查询异常:", error);
  }
}

main();
