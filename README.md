# 恒德新能源 - 智能调度仿真平台

基于 Next.js 14 的 CNG 智能调度管理系统，用于燃气场站、槽车调度、司机管理等业务。

## 技术栈

| 类别   | 技术                     |
| ------ | ------------------------ |
| 框架   | Next.js 14 (App Router)  |
| 语言   | TypeScript               |
| 样式   | Tailwind CSS             |
| 数据库 | MySQL 8.0+ / Drizzle ORM |
| API    | tRPC                     |
| 认证   | NextAuth.js              |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`：

```env
AUTH_SECRET="your-secret-key"
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
```

> ⚠️ 密码特殊字符需 URL 编码：`@` → `%40`，`#` → `%23`

### 3. 初始化数据库

```bash
npm run db:push    # 同步表结构
npm run db:seed    # 初始化数据（可选）
```

### 4. 启动开发

```bash
npm run dev
```

访问 http://localhost:3000，默认账号：`admin` / `admin123`

## 项目结构

```
src/
├── app/                    # 页面视图层
│   ├── (admin)/            # 后台管理
│   │   ├── dispatch/       # 调度管理
│   │   ├── message/        # 消息管理
│   │   └── system/         # 系统管理
│   └── login/              # 登录页
│
├── components/             # 可复用组件
│   ├── ui/                 # 基础组件 (Button, Modal, Table...)
│   └── layout/             # 布局组件 (PageHeader, SearchBar...)
│
├── server/
│   ├── api/routers/        # Controller层 - 入参校验
│   ├── services/           # Service层 - 业务逻辑
│   ├── repositories/       # DAO层 - 数据访问
│   └── db/                 # 数据库配置
│
├── lib/
│   ├── utils/              # 工具函数
│   ├── constants/          # 常量定义
│   └── sms-sdk/            # 短信SDK
│
└── types/                  # 类型定义
```

## 分层架构

```
Router (入参校验) → Service (业务逻辑) → Repository (数据库操作)
```

| 层级       | 目录                   | 职责                   |
| ---------- | ---------------------- | ---------------------- |
| Controller | `server/api/routers/`  | 入参校验、调用 Service |
| Service    | `server/services/`     | 业务逻辑处理           |
| Repository | `server/repositories/` | 数据库 CRUD            |
| Component  | `components/`          | 可复用 UI 组件         |

## 常用命令

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run db:push      # 同步数据库
npm run db:seed      # 初始化数据
npm run db:studio    # 数据库可视化
npm run lint         # 代码检查
```

## 环境要求

- Node.js 18+
- MySQL 8.0.16+
