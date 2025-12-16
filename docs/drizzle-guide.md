# Drizzle ORM 使用指南

## 什么是 Drizzle？

Drizzle 是一个轻量级、类型安全的 TypeScript ORM，具有以下特点：

- 完整的 TypeScript 类型推断
- SQL-like 的查询语法
- 零依赖，性能优秀
- 支持多种数据库（MySQL、PostgreSQL、SQLite）

## 项目配置

### 配置文件

`drizzle.config.ts` - Drizzle Kit 配置：

```typescript
import { type Config } from "drizzle-kit";
import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts", // Schema 定义文件
  dialect: "mysql", // 数据库类型
  dbCredentials: {
    url: env.DATABASE_URL, // 数据库连接 URL
  },
  tablesFilter: ["sys_*"], // 表名过滤（可选）
} satisfies Config;
```

### 数据库连接

`src/server/db/index.ts` - 数据库连接实例：

```typescript
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { env } from "~/env";
import * as schema from "./schema";

const conn = createPool({ uri: env.DATABASE_URL });
export const db = drizzle(conn, { schema, mode: "default" });
```

## Schema 定义

### 基本结构

`src/server/db/schema.ts` 中定义表结构：

```typescript
import { mysqlTableCreator } from "drizzle-orm/mysql-core";

// 多项目 schema 前缀（所有表名会加上 y_ 前缀）
export const createTable = mysqlTableCreator((name) => `y_${name}`);

// 定义表
export const posts = createTable(
  "post", // 实际表名: y_post
  (d) => ({
    id: d.bigint({ mode: "number" }).primaryKey().autoincrement(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp()
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp().onUpdateNow(),
  }),
  (t) => [
    index("name_idx").on(t.name), // 索引
  ],
);
```

### 常用字段类型

```typescript
// 数字
d.int();
d.bigint({ mode: "number" });
d.decimal({ precision: 10, scale: 2 });

// 字符串
d.varchar({ length: 255 });
d.text();
d.char({ length: 10 });

// 时间
d.timestamp();
d.datetime();
d.date();

// 其他
d.boolean();
d.json();
```

### 定义关系

```typescript
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

## 常用命令

```bash
# 生成迁移文件
npm run db:generate

# 执行迁移
npm run db:migrate

# 直接推送 schema 到数据库（开发用）
npm run db:push

# 打开 Drizzle Studio（数据库可视化）
npm run db:studio
```

## 查询示例

### 基础查询

```typescript
import { db } from "~/server/db";
import { posts, users } from "~/server/db/schema";
import { eq, and, like, desc } from "drizzle-orm";

// 查询所有
const allPosts = await db.query.posts.findMany();

// 条件查询
const post = await db.query.posts.findFirst({
  where: eq(posts.id, 1),
});

// 带关系查询
const postsWithAuthor = await db.query.posts.findMany({
  with: {
    author: true,
  },
});

// 复杂条件
const filteredPosts = await db.query.posts.findMany({
  where: and(like(posts.name, "%keyword%"), eq(posts.createdById, userId)),
  orderBy: desc(posts.createdAt),
  limit: 10,
});
```

### 插入数据

```typescript
// 单条插入
await db.insert(posts).values({
  name: "New Post",
  createdById: userId,
});

// 批量插入
await db.insert(posts).values([
  { name: "Post 1", createdById: userId },
  { name: "Post 2", createdById: userId },
]);

// 插入并返回
const [newPost] = await db
  .insert(posts)
  .values({
    name: "New Post",
    createdById: userId,
  })
  .$returningId();
```

### 更新数据

```typescript
await db.update(posts).set({ name: "Updated Name" }).where(eq(posts.id, 1));
```

### 删除数据

```typescript
await db.delete(posts).where(eq(posts.id, 1));
```

## 在 tRPC 中使用

```typescript
// src/server/api/routers/post.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { posts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const postRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.posts.findMany({
      where: eq(posts.createdById, ctx.session.user.id),
    });
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        name: input.name,
        createdById: ctx.session.user.id,
      });
    }),
});
```

## 注意事项

1. **MySQL 版本**：`drizzle-kit push` 需要 MySQL 8.0.16+，低版本会报 `check_constraints` 错误
2. **表前缀**：本项目使用 `y_` 前缀，注意 `tablesFilter` 配置
3. **密码特殊字符**：DATABASE_URL 中的特殊字符需要 URL 编码（如 `@` → `%40`）
4. **开发环境**：使用 `db:push` 快速同步；生产环境使用 `db:generate` + `db:migrate`

## 参考资料

- [Drizzle ORM 官方文档](https://orm.drizzle.team/)
- [Drizzle Kit 文档](https://orm.drizzle.team/kit-docs/overview)
