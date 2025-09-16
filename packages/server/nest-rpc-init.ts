import { RpcRouterManifest } from "@repo/shared";
import { applyForRouters } from "./functions/apply-for-routers";

export interface RpcConfigOptions {
   apiPrefix: string;
}

export function nestRpcInit<T extends RpcRouterManifest>(manifest: T, options: Partial<RpcConfigOptions> = {}): void {
   const { apiPrefix = "nestjs-rpc" } = options;
   applyForRouters(apiPrefix, manifest);
}
