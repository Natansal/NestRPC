import type { RpcRouterManifest } from "@repo/shared";

export function defineManifest<T extends RpcRouterManifest>(routers: T): T {
   return routers;
}
