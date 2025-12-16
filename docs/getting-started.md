# 快速上手指南

## 环境要求

- Node.js 18+
- npm 9+ 或 pnpm
- MySQL 8.0+（推荐 8.0.16+）

## 1. 克隆项目

```bash
git clone <repository-url>
cd y
```

## 2. 安装依赖

```bash
npm install
```

## 3. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# NextAuth 密钥（可用 npx auth secret 生成）
AUTH_SECRET="your-secret-key"

# 数据库连接
DATABASE_URL="mysql://用户名:密码@主机:端口/数据库名"
```

### 数据库 URL 格式说明

```
mysql://用户名:密码@主机:端口/数据库名
```

**注意**：密码中的特殊字符需要 URL 编码：

- `@` → `%40`
- `#` → `%23`
- `?` → `%3F`
- `&` → `%26`

示例：密码 `Pass@123` 应写成 `Pass%40123`

## 4. 初始化数据库

```bash
# 推送 schema 到数据库
npm run db:push
```

如果遇到 `Unknown table 'check_constraints'` 错误，说明 MySQL 版本低于 8.0.16，需要升级 MySQL。

## 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 常用命令

| 命令                   | 说明                 |
| ---------------------- | -------------------- |
| `npm run dev`          | 启动开发服务器       |
| `npm run build`        | 构建生产版本         |
| `npm run start`        | 启动生产服务器       |
| `npm run db:push`      | 推送 schema 到数据库 |
| `npm run db:studio`    | 打开数据库可视化工具 |
| `npm run db:generate`  | 生成迁移文件         |
| `npm run db:migrate`   | 执行迁移             |
| `npm run lint`         | 代码检查             |
| `npm run format:write` | 格式化代码           |

## 项目结构

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── _components/     # 页面组件
│   │   ├── api/             # API 路由
│   │   ├── layout.tsx       # 根布局
│   │   └── page.tsx         # 首页
│   ├── server/
│   │   ├── api/             # tRPC API
│   │   │   ├── routers/     # API 路由定义
│   │   │   ├── root.ts      # 路由聚合
│   │   │   └── trpc.ts      # tRPC 配置
│   │   ├── auth/            # NextAuth 配置
│   │   └── db/              # 数据库
│   │       ├── index.ts     # 数据库连接
│   │       └── schema.ts    # 表结构定义
│   ├── trpc/                # tRPC 客户端
│   └── env.js               # 环境变量 schema
├── drizzle.config.ts        # Drizzle 配置
└── package.json
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **API**: tRPC
- **数据库**: MySQL + Drizzle ORM
- **认证**: NextAuth.js
- **样式**: Tailwind CSS
- **类型检查**: TypeScript
- **代码规范**: ESLint + Prettier

## 常见问题

### Q: 数据库连接失败？

检查：

1. MySQL 服务是否启动
2. DATABASE_URL 格式是否正确
3. 密码特殊字符是否已编码

### Q: `db:push` 报错 `check_constraints`？

MySQL 版本低于 8.0.16，需要升级 MySQL。

### Q: 如何添加新的数据表？

1. 在 `src/server/db/schema.ts` 中定义表结构
2. 运行 `npm run db:push` 同步到数据库
3. 在 tRPC router 中添加相关 API

详细用法参考 [Drizzle 使用指南](./drizzle-guide.md)
