import { NestRpcRouterConfig } from "@repo/shared";

export function defineAppRouter<T extends NestRpcRouterConfig>(router: T): T {
   return router;
}
