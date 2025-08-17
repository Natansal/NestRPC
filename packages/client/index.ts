import type { InferNestRpcRouterApp, NestRpcRouterConfig } from "@repo/shared";

export interface RpcClientConfig {
  baseUrl: string;
  apiPrefix?: string;
  fetchOptions?: RequestInit;
}

export function createRpcClient<
  T extends InferNestRpcRouterApp<NestRpcRouterConfig>,
>(config: RpcClientConfig): T {
  const { baseUrl, apiPrefix = "/nest-rpc", fetchOptions = {} } = config;

  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;

  function makeProxy(path: string[]): any {
    return new Proxy(() => {}, {
      get(_, prop: string | symbol) {
        const propName = String(prop);

        if (
          propName.startsWith("__") ||
          propName === "constructor" ||
          propName === "prototype"
        ) {
          return undefined;
        }

        return makeProxy([...path, propName]);
      },
      async apply(_, __, args: any[]) {
        const endpoint = `${normalizedBaseUrl}${apiPrefix}/${path.join("/")}`;

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
            throw new Error(
              `HTTP ${response.status}: ${response.statusText} - ${errorText}`
            );
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
          throw new Error(
            `RPC call to ${endpoint} failed: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      },
    });
  }

  return makeProxy([]) as T;
}

export function createTypedRpcClient<
  T extends InferNestRpcRouterApp<NestRpcRouterConfig>,
>(config: RpcClientConfig): T {
  return createRpcClient<T>(config);
}
