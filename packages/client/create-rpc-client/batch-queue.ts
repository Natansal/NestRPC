import type { BatchItem, BatchQuery, BatchResponse } from "@repo/shared";
import { encodeBatchQuery } from "@repo/shared";
import { executeRpcCall } from "./http-client";
import { RpcError } from "./rpc-error";
import { BatchConfig } from "./types";

interface BatchQueueItem extends BatchItem {
   callback: (res: BatchResponse) => void;
}

/**
 * 🧵 BatchQueue
 *
 * Queues RPC calls, batches them by size/time, sends a single HTTP request, and
 * dispatches individual responses back to their original call sites.
 */
export class BatchQueue {
   private queue: BatchQueueItem[] = [];
   private timeout: ReturnType<typeof setTimeout> | null = null;
   private readonly config: Required<BatchConfig>;
   private nextId: number = 1;

   constructor(config: BatchConfig) {
      const {
         maxBatchSize = 20,
         debounceMs = 50,
         maxUrlSize = 2048,
         fetchOptions = {},
         enabled = true,
         ...rest
      } = config;

      this.config = { maxBatchSize, debounceMs, maxUrlSize, fetchOptions, enabled, ...rest };
   }

   private flush = () => {
      this.clearTimeout();

      const batch = this.queue.splice(0, this.config.maxBatchSize);
      if (batch.length === 0) return;

      this.executeBatch(batch);

      // If items remain in queue, flush immediately
      if (this.queue.length > 0) this.flush();
   };

   public add(_item: Omit<BatchQueueItem, "id">): void {
      const id = (this.nextId++).toString();
      const item = { ..._item, id };

      // If batching is disabled, execute immediately without queuing
      if (!this.config.enabled) {
         this.executeBatch([item]);
         return;
      }

      this.queue.push(item);

      // check if oversized
      if (this.buildUrl(this.queue).length > this.config.maxUrlSize || this.queue.length > this.config.maxBatchSize) {
         this.queue.pop();

         if (this.buildUrl([item]).length > this.config.maxUrlSize) {
            throw new Error(`Single item too large for query`);
         }

         this.flush();
         this.add(_item);
         return;
      }

      this.setTimeout();
   }

   private buildUrl(batch: BatchQuery[]) {
      return `${this.config.endpoint}?calls=${encodeBatchQuery(batch)}`;
   }

   private clearTimeout() {
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = null;
   }

   private setTimeout() {
      this.clearTimeout();
      this.timeout = setTimeout(this.flush, this.config.debounceMs);
   }

   private async executeBatch(batch: BatchQueueItem[]) {
      const body = batch.map((b) => ({ id: b.id, input: b.input }));
      const url = this.buildUrl(batch.map((b) => ({ id: b.id, path: b.path })));

      try {
         const responses = await executeRpcCall(url, body, this.config.fetchOptions);
         const byId = new Map(responses.map((r) => [r.id, r] as const));
         for (const item of batch) {
            const res = byId.get(item.id);
            if (res) {
               item.callback(res);
            } else {
               item.callback({
                  id: item.id,
                  error: { code: 500, name: "MissingResponse", message: "No response for call id" },
               });
            }
         }
      } catch (e) {
         const err = e instanceof RpcError ? e : RpcError.fromFetchError(e);
         for (const item of batch) {
            item.callback({ id: item.id, error: { code: err.code, name: err.name, message: err.message } });
         }
      }
   }
}
