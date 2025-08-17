import type { InferNestRpcRouterApp, NestRpcRouterConfig } from "@repo/shared";

export interface RpcClientConfig {
   baseUrl: string;
   apiPrefix?: string;
   fetchOptions?: RequestInit;
}

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
 * @param config.apiPrefix - 🛣️ API prefix path (defaults to "/nest-rpc")
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
   const { baseUrl, apiPrefix = "/nestjs-rpc", fetchOptions = {} } = config;

   const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

   function createClientProxy(pathSegments: string[] = []): any {
      return new Proxy(() => {}, {
         get(_, propertyKey: string | symbol) {
            if (typeof propertyKey === "symbol") {
               throw new Error("Invalid property name");
            }

            if (propertyKey.startsWith("__") || propertyKey === "constructor" || propertyKey === "prototype") {
               return undefined;
            }

            return createClientProxy([...pathSegments, propertyKey]);
         },
         async apply(_, __, args: any[]) {
            const endpoint = `${normalizedBaseUrl}${apiPrefix}/${pathSegments.join("/")}`;

            let body: any = undefined;
            if (args.length > 0) {
               body = args[0];
            }

            try {
               const response = await fetch(endpoint, {
                  method: "POST",
                  headers: {
                     "Content-Type": "application/json",
                     ...fetchOptions.headers,
                  },
                  ...(body !== undefined && { body: JSON.stringify(body) }),
                  ...fetchOptions,
               });

               if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
               }

               const contentType = response.headers.get("content-type");
               if (contentType && contentType.includes("application/json")) {
                  return response.json();
               }
               const txt = await response.text();
               try {
                  return JSON.parse(txt);
               } catch {
                  return txt;
               }
            } catch (err) {
               throw new Error(`RPC call to ${endpoint} failed: ${err instanceof Error ? err.message : String(err)}`);
            }
         },
      });
   }

   return createClientProxy() as T;
}

export function createTypedRpcClient<T extends InferNestRpcRouterApp<NestRpcRouterConfig>>(config: RpcClientConfig): T {
   return createRpcClient<T>(config);
}
