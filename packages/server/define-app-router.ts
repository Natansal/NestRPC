import { NestRpcRouterConfig } from "@repo/shared";

export function defineAppRouter<T extends NestRpcRouterConfig>(config: T): T {
   return config;
}
