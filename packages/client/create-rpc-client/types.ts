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
export interface RpcClientConfig {
   baseUrl: string;
   apiPrefix?: string;
   fetchOptions?: RequestInit;
   batch?:
      | boolean
      | ({
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

export interface BatchConfig {
   maxBatchSize?: number;
   debounceMs?: number;
   maxUrlSize?: number;
   endpoint: string;
   fetchOptions?: RequestInit;
   enabled?: boolean;
}
