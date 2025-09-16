import { RpcRouterManifest } from "@repo/shared";
import { applyForRouters } from "./functions/apply-for-routers";

/**
 * 🧩 RpcConfigOptions
 *
 * Defines configuration for initializing the RPC module.
 *
 * - **apiPrefix**: Base path under which all RPC routes are mounted.
 */
export interface RpcConfigOptions {
   /**
    * 🛣️ API prefix under which the RPC controller is mounted.
    *
    * - Default when omitted in `nestRpcInit(...)`: "nestjs-rpc"
    */
   apiPrefix: string;
}

/**
 * 🚀 Initialize Nest RPC
 *
 * Bootstraps RPC routing for the provided `manifest` by wiring up NestJS controllers and
 * endpoints using the given configuration.
 *
 * @typeParam T - 📘 The shape of your `RpcRouterManifest`.
 * @param manifest - 🗺️ A manifest object mapping keys to routers or nested manifests.
 * @param options - ⚙️ Partial configuration, e.g., `apiPrefix` (defaults to "nestjs-rpc").
 * @returns void - ✅ Sets up controllers and routes via decorators; no runtime value.
 */
export function nestRpcInit<T extends RpcRouterManifest>(manifest: T, options: Partial<RpcConfigOptions> = {}): void {
   const { apiPrefix = "nestjs-rpc" } = options;
   applyForRouters(apiPrefix, manifest);
}
