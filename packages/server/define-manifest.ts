import type { RpcRouterManifest } from "@repo/shared";

/**
 * 🗺️ defineManifest
 *
 * Helper to declare a strongly-typed RPC router manifest. It simply returns the
 * provided object while preserving its type information.
 *
 * @typeParam T - 📘 The concrete manifest type extending `RpcRouterManifest`.
 * @param routers - 🧩 An object mapping keys to router classes or nested manifests.
 * @returns T - 🔁 The same manifest object, unchanged, with full type inference.
 */
export function defineManifest<T extends RpcRouterManifest>(routers: T): T {
   return routers;
}
