import type { RpcClientConfig } from "./types";
import { createRpcCall } from "./http-client";

/**
 * Creates a proxy object that mimics the server's router structure
 */
export function createClientProxy(config: RpcClientConfig, pathSegments: string[] = []) {
   const rpcCall = createRpcCall(config);

   return new Proxy((() => {}) as any as ((body: any) => Promise<any>) & Record<string, any>, {
      get(_, propertyKey: string | number | symbol) {
         if (typeof propertyKey !== "string") {
            throw new Error(
               `Invalid property name: Property name must be of type string, got: ${propertyKey.toString()}`,
            );
         }

         return createClientProxy(config, [...pathSegments, propertyKey]);
      },
      async apply(_, __, args: any[]) {
         const body = args[0];
         return rpcCall(pathSegments, body);
      },
   });
}
