import type { RpcClientConfig } from "./types";
import { createClientProxy } from "./proxy";

/**
 * 🚀 Create a type-safe RPC client proxy that mirrors your server router and performs HTTP calls.
 *
 * The returned proxy lets you call remote methods as if they were local functions.
 * Requests are automatically serialized, batched, and routed based on the method chain you access.
 *
 * Defaults applied when omitted:
 * - `apiPrefix` ➜ "/nestjs-rpc"
 * - `fetchOptions` ➜ `{}`
 * - `batch` ➜ `{ enabled: true, maxBatchSize: 20, debounceMs: 50, maxUrlSize: 2048 }`
 *
 * @typeParam T - 🎯 Inferred app client surface from your server router config.
 * @param config - ⚙️ Client configuration object
 * @param config.baseUrl - 🌐 Base URL of your server (e.g. "http://localhost:3000")
 * @param config.apiPrefix - 🛣️ Controller mount path; Default: "/nestjs-rpc"
 * @param config.fetchOptions - 🔧 Default fetch options merged into every request; Default: `{}`
 * @param config.batch - 📦 Batching config: `false` disables, `true` enables with defaults, or provide an object to tune
 *   - Default object values: `{ enabled: true, maxBatchSize: 20, debounceMs: 50, maxUrlSize: 2048 }`
 * @returns 🎭 A proxy object that mimics the server's router structure
 *
 * @example
 * ```ts
 * // Basic
 * const client = createRpcClient<typeof appRouter>({ baseUrl: "http://localhost:3000" });
 * const user = await client.users.get({ id: "123" });
 * ```
 *
 * @example
 * ```ts
 * // Custom fetch and batching
 * const client = createRpcClient<typeof appRouter>({
 *   baseUrl: "https://api.example.com",
 *   fetchOptions: { headers: { Authorization: "Bearer token" } },
 *   batch: { enabled: true, maxBatchSize: 10, debounceMs: 25 },
 * });
 * ```
 */
export function createRpcClient<T>(config: RpcClientConfig): T {
   const normalized: Required<RpcClientConfig> = {
      baseUrl: config.baseUrl,
      apiPrefix: config.apiPrefix ?? "/nestjs-rpc",
      fetchOptions: config.fetchOptions ?? {},
      batch: config.batch ?? {
         enabled: true,
         maxBatchSize: 20,
         debounceMs: 50,
         maxUrlSize: 2048,
      },
   };
   return createClientProxy(normalized) as T;
}
