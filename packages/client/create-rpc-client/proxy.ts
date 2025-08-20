import type { RpcClientConfig } from "./types";
import { BatchQueue } from "./batch-queue";
import type { BatchResponse } from "@repo/shared";
import { RpcError } from "./rpc-error";
import { normalizeBaseUrl } from "./utils";

/**
 * 🪄 Create a nested proxy that mirrors the server's router structure and batches calls.
 *
 * A single `BatchQueue` instance is shared across the entire proxy tree so that
 * calls on different branches can still be batched into the same HTTP request.
 *
 * @param config - Fully normalized client configuration.
 * @param pathSegments - Accumulated path segments for the current proxy branch.
 * @param sharedQueue - Shared BatchQueue instance for batching across branches.
 */
export function createClientProxy(
   config: Required<RpcClientConfig>,
   pathSegments: string[] = [],
   sharedQueue?: BatchQueue,
) {
   const { baseUrl, apiPrefix, batch, fetchOptions } = config;
   const batchEnabled = typeof batch === "boolean" ? batch : batch.enabled;
   const batchConfig = typeof batch === "boolean" ? undefined : batch;

   const batchQueue =
      sharedQueue ??
      new BatchQueue({
         endpoint: `${normalizeBaseUrl(baseUrl)}/${apiPrefix}`,
         fetchOptions,
         enabled: batchEnabled,
         ...batchConfig,
      });

   return new Proxy((() => {}) as any as ((body: any) => Promise<any>) & Record<string, any>, {
      get(_, propertyKey: string | number | symbol) {
         if (typeof propertyKey !== "string") {
            throw new Error(
               `Invalid property name: Property name must be of type string, got: ${propertyKey.toString()}`,
            );
         }

         return createClientProxy(config, [...pathSegments, propertyKey], batchQueue);
      },
      async apply(_, __, args: any[]) {
         // Guard: no method selected
         if (pathSegments.length === 0) {
            throw new Error("No method selected. Access a method before calling, e.g., client.users.get(...)");
         }
         const result = await new Promise<BatchResponse>((resolve) => {
            batchQueue.add({
               callback: resolve,
               input: args[0],
               path: pathSegments,
            });
         });

         if (result.response) return result.response.data;
         throw new RpcError(result.error!);
      },
   });
}
