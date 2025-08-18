import { BatchQuery } from "../types";

// Batch queries when encoded looks like: 1:users.get,2:posts.list,3:users.posts.get

export function decodeBatchQuery(callsStr: string): BatchQuery[] {
   if (!callsStr) return [];

   return callsStr.split(",").map((call) => {
      const [id, path] = call.split(":");
      if (!id || !path) throw new Error(`Invalid batch query item: ${call}`);
      return { id, path: path.split(".") };
   });
}

export function encodeBatchQuery(calls: BatchQuery[]): string {
   return encodeURIComponent(calls.map((call) => `${call.id}:${call.path.join(".")}`).join(","));
}
