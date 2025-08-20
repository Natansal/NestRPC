/**
 * ⚙️ Configuration interface for RPC client
 *
 * Defines all the settings needed to configure an RPC client for making
 * type-safe remote procedure calls to a NestJS server.
 *
 * @param baseUrl - 🌐 The base URL of the server (e.g., "http://localhost:3000")
 * @param apiPrefix - 🛣️ Optional API prefix path (defaults to "/nestjs-rpc")
 * @param fetchOptions - 🔧 Optional default fetch options merged into every request
 * @param batch - 📦 Optional batching configuration - can be boolean for simple enable/disable
 *                   or object with detailed batching settings
 */
/**
 * ⚙️ RPC client configuration
 *
 * Defines all options for creating a type-safe RPC client.
 *
 * - Defaults:
 *   - `apiPrefix` ➜ "/nestjs-rpc"
 *   - `fetchOptions` ➜ `{}`
 *   - `batch` ➜ `{ enabled: true, maxBatchSize: 20, debounceMs: 50, maxUrlSize: 2048 }`
 *
 * @example
 * ```ts
 * const client = createRpcClient<typeof appRouter>({
 *   baseUrl: "http://localhost:3000",
 *   apiPrefix: "/api/rpc", // optional
 *   fetchOptions: { headers: { Authorization: "Bearer …" } }, // optional
 *   batch: { enabled: true, maxBatchSize: 10 }, // optional
 * });
 * ```
 */
export interface RpcClientConfig {
   /**
    * 🌐 Base URL of your server (e.g. `"http://localhost:3000"`).
    */
   baseUrl: string;
   /**
    * 🛣️ API prefix under which the RPC controller is mounted.
    *
    * - Default: "/nestjs-rpc"
    */
   apiPrefix?: string;
   /**
    * 🔧 Default `fetch` options merged into every request (headers, credentials, signal, etc.).
    *
    * - Default: `{}`
    */
   fetchOptions?: RequestInit;
   /**
    * 📦 Batching configuration. Set to `false` to disable batching entirely, or
    * provide an object to tune batching behavior.
    *
    * - When `true` or omitted, batching is enabled with defaults
    * - Default object values: `{ enabled: true, maxBatchSize: 20, debounceMs: 50, maxUrlSize: 2048 }`
    */
   batch?:
      | boolean
      | ({
           /** ✅ Whether batching is enabled (default: `true`). */
           enabled: boolean;
        } & Omit<BatchConfig, "endpoint" | "fetchOptions">);
}

/**
 * 🔗 Configuration interface for batch request handling
 *
 * Controls how multiple RPC calls are grouped together into single HTTP requests
 * for improved performance and reduced network overhead.
 *
 * @param maxBatchSize - 📊 Maximum number of calls to batch together (optional)
 * @param debounceMs - ⏱️ Milliseconds to wait before sending batch (optional)
 * @param maxUrlSize - 📏 Maximum URL length for GET requests (optional)
 * @param endpoint - 🎯 Full endpoint URL where batch requests are sent
 * @param fetchOptions - 🔧 Default fetch options for batch requests (optional)
 */

/**
 * 🔗 Batch request configuration
 *
 * Controls how multiple RPC calls are grouped and sent in a single HTTP request.
 */
export interface BatchConfig {
   /**
    * 📊 Maximum number of calls to include in one batch.
    * - Default: `20`
    */
   maxBatchSize?: number;
   /**
    * ⏱️ Time window (in milliseconds) to wait for more calls before flushing.
    * - Default: `50`
    */
   debounceMs?: number;
   /**
    * 📏 Maximum allowed URL length for GET query construction (safety guard).
    * - Default: `2048`
    */
   maxUrlSize?: number;
   /**
    * 🎯 Full endpoint URL the client should POST batches to (including prefix).
    * - Example: `"http://localhost:3000/nestjs-rpc"`
    */
   endpoint: string;
   /**
    * 🧰 Default `fetch` options used for batch requests.
    * - Default: `{}`
    */
   fetchOptions?: RequestInit;
   /**
    * ✅ Enable/disable batching at runtime.
    * - Default: `true`
    */
   enabled?: boolean;
}
