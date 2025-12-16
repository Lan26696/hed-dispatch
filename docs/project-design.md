# 恒德新能源 - 智能调度仿真平台

## 项目概述

本项目是一个基于 Next.js 的 CNG（压缩天然气）智能调度管理系统，用于管理燃气场站、槽车调度、司机管理等业务。

## 技术栈

| 类别     | 技术选型                           |
| -------- | ---------------------------------- |
| 框架     | Next.js 14 (App Router)            |
| 语言     | TypeScript                         |
| 样式     | Tailwind CSS                       |
| 数据库   | MySQL 8.0+                         |
| ORM      | Drizzle ORM                        |
| API      | tRPC                               |
| 认证     | NextAuth.js (Credentials Provider) |
| 短信服务 | 亿美软通 SMS SDK                   |

## 项目结构

```
src/
├── app/                          # 【视图层】Next.js App Router
│   ├── (admin)/                  # 后台管理路由组
│   │   ├── layout.tsx            # 后台布局（侧边栏+顶栏）
│   │   ├── page.tsx              # 工作台/仪表盘
│   │   ├── dispatch/             # 调度管理
│   │   │   └── board/            # 调度看板
│   │   ├── message/              # 消息管理
│   │   │   ├── templates/        # 短信模板
│   │   │   └── records/          # 发送记录
│   │   └── system/               # 系统管理
│   │       ├── users/            # 用户管理
│   │       ├── roles/            # 角色管理
│   │       └── menus/            # 菜单管理
│   ├── login/                    # 登录页
│   └── _components/              # 页面级组件
│
├── components/                   # 【组件层】可复用UI组件
│   ├── ui/                       # 基础UI组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Pagination.tsx
│   │   ├── Tag.tsx
│   │   ├── Card.tsx
│   │   └── index.ts
│   ├── layout/                   # 布局组件
│   │   ├── PageHeader.tsx
│   │   ├── SearchBar.tsx
│   │   └── index.ts
│   └── index.ts                  # 统一导出
│
├── server/                       # 【服务端】
│   ├── api/                      # Controller层（tRPC路由）
│   │   ├── routers/              # 各业务路由
│   │   │   ├── user.ts
│   │   │   ├── role.ts
│   │   │   ├── menu.ts
│   │   │   ├── smsTemplate.ts
│   │   │   └── smsRecord.ts
│   │   ├── root.ts
│   │   └── trpc.ts
│   │
│   ├── services/                 # 【Service层】业务逻辑
│   │   ├── user.service.ts
│   │   ├── role.service.ts
│   │   ├── menu.service.ts
│   │   ├── sms.service.ts
│   │   └── index.ts
│   │
│   ├── repositories/             # 【DAO层】数据访问
│   │   ├── user.repository.ts
│   │   ├── role.repository.ts
│   │   ├── menu.repository.ts
│   │   ├── sms.repository.ts
│   │   └── index.ts
│   │
│   ├── db/                       # 数据库配置
│   │   ├── schema.ts             # Drizzle 表结构
│   │   ├── seed.ts               # 种子数据
│   │   └── index.ts              # 数据库连接
│   │
│   └── auth/                     # 认证配置
│
├── lib/                          # 【工具库】
│   ├── utils/                    # 通用工具函数
│   │   ├── date.ts
│   │   ├── format.ts
│   │   ├── validate.ts
│   │   └── index.ts
│   ├── constants/                # 常量定义
│   │   ├── status.ts
│   │   ├── config.ts
│   │   └── index.ts
│   ├── services/                 # 外部服务封装
│   │   └── emay-sms.ts
│   └── sms-sdk/                  # 亿美软通 SDK
│
├── types/                        # 【类型定义】
│   ├── api.ts                    # API相关类型
│   ├── models.ts                 # 数据模型类型
│   ├── common.ts                 # 通用类型
│   └── index.ts
│
├── styles/                       # 样式文件
│   └── globals.css
│
└── trpc/                         # tRPC 客户端配置
```

## 分层架构说明

| 层级       | 目录                       | 职责                      |
| ---------- | -------------------------- | ------------------------- |
| View       | `src/app/`                 | 页面渲染、用户交互        |
| Component  | `src/components/`          | 可复用UI组件              |
| Controller | `src/server/api/routers/`  | 入参校验、调用Service     |
| Service    | `src/server/services/`     | 业务逻辑处理              |
| Repository | `src/server/repositories/` | 数据库操作                |
| Utils      | `src/lib/`                 | 工具函数、常量、第三方SDK |
| Types      | `src/types/`               | TypeScript类型定义        |

## 数据库设计

### 表命名规范

- **系统表**：`sys_` 前缀（用户、角色、菜单、权限等）
- **业务表**：`biz_` 前缀（场站、司机、车辆、调度单等）

### 系统表

| 表名                | 说明                |
| ------------------- | ------------------- |
| sys_user            | 用户表              |
| sys_role            | 角色表              |
| sys_menu            | 菜单表              |
| sys_permission      | 权限表（资源+操作） |
| sys_role_menu       | 角色-菜单关联       |
| sys_role_permission | 角色-权限关联       |

### 业务表

| 表名               | 说明                                       |
| ------------------ | ------------------------------------------ |
| biz_station        | 场站表（母站/配送站/加气站/储气站/解压站） |
| biz_driver         | 司机表                                     |
| biz_vehicle        | 车辆表（槽车）                             |
| biz_daily_plan     | 日计划表                                   |
| biz_reservation    | 预约表                                     |
| biz_dispatch_order | 调度单表                                   |
| biz_sms_template   | 短信模板表                                 |
| biz_sms_record     | 短信发送记录表                             |

## 权限系统设计

### RBAC 模型

采用基于角色的访问控制（RBAC），支持：

1. **操作权限**：精确到 CRUD（读/写/改/删）
2. **数据范围**：
   - `all` - 全部数据
   - `dept` - 本部门数据
   - `self` - 仅本人数据
3. **菜单权限**：控制可见菜单

### 权限表结构

```typescript
// 权限定义
sys_permission: {
  resource: string,      // 资源标识，如 "user", "role"
  action: string,        // 操作类型：read/create/update/delete
  resourceLabel: string, // 资源中文名
  actionLabel: string,   // 操作中文名
}

// 角色数据范围
sys_role: {
  dataScope: "all" | "dept" | "self"
}
```

## 认证方案

### NextAuth Credentials Provider

使用用户名密码登录，JWT 策略存储会话：

```typescript
// src/server/auth/config.ts
export const authConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        username: { type: "text" },
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        // 验证用户名密码
        // 返回用户信息
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: ({ token, user }) => {
      /* 扩展 token */
    },
    session: ({ session, token }) => {
      /* 扩展 session */
    },
  },
};
```

### 默认账号

- 用户名：`admin`
- 密码：`admin123`

## UI 设计规范

### 主题：深空蓝 · 科技暗黑

| 元素      | 颜色值                       |
| --------- | ---------------------------- |
| 主背景    | `#0a0f1a`                    |
| 卡片/面板 | `#0f172a`                    |
| 边框      | `slate-700/50`               |
| 主色调    | `cyan-500` → `blue-600` 渐变 |
| 成功状态  | `emerald-400/500`            |
| 警告状态  | `amber-400/500`              |
| 错误状态  | `red-400/500`                |
| 标题文字  | `slate-100`                  |
| 正文文字  | `slate-300`                  |
| 次要文字  | `slate-500`                  |

### 组件样式

```css
/* 卡片 */
.card {
  @apply rounded-2xl border border-slate-700/50 bg-[#0f172a];
}

/* 主按钮 */
.btn-primary {
  @apply rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30;
}

/* 输入框 */
.input {
  @apply rounded-xl border border-slate-700 bg-slate-800 text-slate-300 focus:border-cyan-500/50;
}

/* 状态标签 */
.tag-success {
  @apply border-emerald-500/30 bg-emerald-500/10 text-emerald-400;
}
.tag-warning {
  @apply border-amber-500/30 bg-amber-500/10 text-amber-400;
}
.tag-error {
  @apply border-red-500/30 bg-red-500/10 text-red-400;
}
```

## 短信服务集成

### 亿美软通 SDK

```typescript
// src/lib/sms-sdk/
├── client.ts      // 主客户端
├── http-client.ts // HTTP 请求封装
├── crypto.ts      // 加密工具
├── types.ts       // 类型定义
└── index.ts       // 导出

// 使用示例
import { EmaySmsService } from "~/lib/services/emay-sms";

const sms = new EmaySmsService();
await sms.sendSms("13800138000", "您的验证码是123456");
await sms.getBalance(); // 查询余额
```

### 模板变量

支持中文别名的模板变量：

```typescript
// 模板内容
"尊敬的{driver_name}司机，您的调度单{order_no}已确认";

// 变量定义
variables: [
  { key: "driver_name", label: "司机姓名" },
  { key: "order_no", label: "调度单号" },
];
```

## CNG 调度业务

### 场站类型

| 类型          | 说明                                |
| ------------- | ----------------------------------- |
| mother        | 气源母站 - 从管网取气压缩，供应下游 |
| distribution  | 配送站 - 区域中转                   |
| filling       | 加气站 - 为车辆加气                 |
| storage       | 储气站 - 储存调节                   |
| decompression | 解压站 - 解压后输入城市管网         |

### 调度单流程

```
1. 创建调度单（选择起点母站、终点站、槽车、计划运量）
2. 待发车 → 司机确认
3. 装气（记录装车压力、实际装载量）
4. 发车 → 运输中（GPS追踪）
5. 到达 → 卸气
6. 完成
```

### 关键参数

| 参数     | 说明       | 典型值         |
| -------- | ---------- | -------------- |
| 槽车容量 | 单车装载量 | 8000-12000 Nm³ |
| 装车压力 | 出站压力   | 20-25 MPa      |
| 运输距离 | 单程里程   | 10-350 km      |
| 运量单位 | 标准立方米 | Nm³            |

## 环境配置

### .env 示例

```bash
# 数据库（注意特殊字符需URL编码，如 @ → %40）
DATABASE_URL="mysql://user:pass%40word@localhost:3306/dbname"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# 亿美软通短信
EMAY_APP_ID="your-app-id"
EMAY_SECRET_KEY="your-secret-key"
EMAY_HOST="bjmtn.b2m.cn"
EMAY_PORT="443"
```

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 数据库推送
npm run db:push

# 执行种子数据
npm run db:seed

# 构建生产版本
npm run build
```

## 注意事项

1. **数据库密码特殊字符**：需要 URL 编码（`@` → `%40`）
2. **MySQL 版本**：需要 8.0.16+ 以支持 `drizzle-kit push`
3. **种子数据**：使用 `ON DUPLICATE KEY UPDATE` 支持增量更新
4. **外键冲突**：如遇 db:push 失败，先执行 `reset-db.sql`
