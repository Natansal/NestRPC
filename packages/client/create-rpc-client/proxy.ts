import type { RpcClientConfig } from "./types";
import { createRpcCall } from "./http-client";

/**
 * Creates a proxy object that mimics the server's router structure
 */
export function createClientProxy(
  config: RpcClientConfig,
  pathSegments: string[] = []
): any {
  const rpcCall = createRpcCall(config);

  return new Proxy(() => {}, {
    get(_, propertyKey: string | symbol) {
      if (typeof propertyKey === "symbol") {
        throw new Error("Invalid property name");
      }

      // Skip internal properties
      if (
        propertyKey.startsWith("__") ||
        propertyKey === "constructor" ||
        propertyKey === "prototype"
      ) {
        return undefined;
      }

      return createClientProxy(config, [...pathSegments, propertyKey]);
    },
    async apply(_, __, args: any[]) {
      const body = args.length > 0 ? args[0] : undefined;
      return rpcCall(pathSegments, body);
    },
  });
}
