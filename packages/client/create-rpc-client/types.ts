/**
 * Configuration interface for RPC client
 */
export interface RpcClientConfig {
  baseUrl: string;
  apiPrefix?: string;
  fetchOptions?: RequestInit;
}

/**
 * HTTP response handler result
 */
export interface HttpResponseResult {
  data: any;
  contentType: string;
}
