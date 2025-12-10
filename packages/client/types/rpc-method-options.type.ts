import { RpcClientConfig } from "./rpc-client-config.type";

/**
 * 🧰 RpcMethodOptions
 *
 * Per-call overrides for the RPC client. Lets you customize the HTTP request
 * for a specific method invocation, while falling back to the client defaults.
 *
 * - `axiosInstance`: 🌐 Provide a custom Axios instance just for this call.
 *   - Default: inherits from `RpcClient.$config.axiosInstance` (default `axios`).
 * - `requestOptions`: ✉️ Merge additional Axios request options (headers, signal, etc.).
 *   - Default: merges into `RpcClient.$config.requestOptions` (default `{}`).
 */
export interface RpcMethodOptions extends Pick<RpcClientConfig, "axiosInstance" | "requestOptions"> {
   file?: File;
   files?: File[];
}
