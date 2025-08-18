import type { InferNestRpcRouterApp, NestRpcRouterConfig } from "@repo/shared";
import type { RpcClientConfig } from "./types";
import { createClientProxy } from "./proxy";

/**
 * 🚀 Creates an RPC client proxy that mimics the server's router structure
 * and makes HTTP calls to execute remote methods.
 *
 * This function creates a type-safe proxy object that allows you to call
 * remote methods as if they were local functions. The proxy automatically
 * handles HTTP requests, serialization, and routing based on the method
 * call chain.
 *
 * @template T - 🎯 The inferred router type from the server configuration
 * @param config - ⚙️ Configuration object for the RPC client
 * @param config.baseUrl - 🌐 Base URL of the server (e.g., "http://localhost:3000")
 * @param config.apiPrefix - 🛣️ API prefix path (defaults to "/nestjs-rpc")
 * @param config.fetchOptions - 🔧 Custom fetch options to merge with requests
 *
 * @returns 🎭 A proxy object that mimics the server's router structure
 *
 * @example
 * ```typescript
 * // Create a client for a server with user and post routes
 * const client = createRpcClient<typeof serverRouter>({
 *   baseUrl: "http://localhost:3000",
 *   apiPrefix: "/api/rpc"
 * });
 *
 * // Call remote methods as if they were local
 * const user = await client.users.getUser({ id: 123 });
 * const posts = await client.posts.listPosts({ limit: 10 });
 *
 * // Nested routing is supported
 * const userPosts = await client.users.posts.getUserPosts({ userId: 123 });
 * ```
 *
 * @example
 * ```typescript
 * // With custom fetch options
 * const client = createRpcClient<typeof serverRouter>({
 *   baseUrl: "https://api.example.com",
 *   fetchOptions: {
 *     headers: { "Authorization": "Bearer token" },
 *     timeout: 5000
 *   }
 * });
 * ```
 */
export function createRpcClient<T extends InferNestRpcRouterApp<NestRpcRouterConfig>>(config: RpcClientConfig): T {
   return createClientProxy(config) as T;
}
