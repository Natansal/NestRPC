import {
  createEndpointUrl,
  handleHttpResponse,
  normalizeBaseUrl,
} from "./utils";
import type { RpcClientConfig } from "./types";

/**
 * Makes an HTTP request to execute an RPC method
 */
export async function executeRpcCall(
  endpoint: string,
  body: any,
  fetchOptions: RequestInit
): Promise<any> {
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

    return await handleHttpResponse(response);
  } catch (err) {
    throw new Error(
      `RPC call to ${endpoint} failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/**
 * Creates an RPC call with the given configuration
 */
export function createRpcCall(config: RpcClientConfig) {
  const { baseUrl, apiPrefix = "/nestjs-rpc", fetchOptions = {} } = config;
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  return (pathSegments: string[], body: any) => {
    const endpoint = createEndpointUrl(
      normalizedBaseUrl,
      apiPrefix,
      pathSegments
    );
    return executeRpcCall(endpoint, body, fetchOptions);
  };
}
