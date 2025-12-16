import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";

/**
 * NextAuth 类型扩展
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      roleId: number | null;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    roleId: number | null;
  }
}

/**
 * NextAuth 配置
 */
export const authConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.username, credentials.username as string),
        });

        if (user?.status !== 1) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          roleId: user.roleId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.roleId = user.roleId;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        username: token.username as string,
        roleId: token.roleId as number | null,
      },
    }),
  },
} satisfies NextAuthConfig;
