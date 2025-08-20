import { BatchQuery } from "../types";

// Batch queries when encoded looks like: 1:users.get,2:posts.list,3:users.posts.get

/**
 * 🔓 Decode a compact `calls` query string into structured batch items.
 *
 * @param callsStr - Encoded string from the `calls` query parameter.
 * @returns Array of `{ id, path }` objects.
 */
export function decodeBatchQuery(callsStr: string): BatchQuery[] {
   if (!callsStr) return [];

   return callsStr.split(",").map((call) => {
      const [id, path] = call.split(":");
      if (!id || !path) throw new Error(`Invalid batch query item: ${call}`);
      return { id, path: path.split(".") };
   });
}

/**
 * 🔐 Encode batch items into a compact `calls` query string.
 *
 * @param calls - Array of `{ id, path }` items.
 * @returns URL-encoded `calls` parameter value.
 */
export function encodeBatchQuery(calls: BatchQuery[]): string {
   return encodeURIComponent(calls.map((call) => `${call.id}:${call.path.join(".")}`).join(","));
}
