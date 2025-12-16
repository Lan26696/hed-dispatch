import { menuRouter } from "~/server/api/routers/menu";
import { userRouter } from "~/server/api/routers/user";
import { roleRouter } from "~/server/api/routers/role";
import { permissionRouter } from "~/server/api/routers/permission";
import { smsTemplateRouter } from "~/server/api/routers/smsTemplate";
import { smsRecordRouter } from "~/server/api/routers/smsRecord";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  menu: menuRouter,
  user: userRouter,
  role: roleRouter,
  permission: permissionRouter,
  smsTemplate: smsTemplateRouter,
  smsRecord: smsRecordRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
