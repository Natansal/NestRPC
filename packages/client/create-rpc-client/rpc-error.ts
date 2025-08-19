import type { BatchResponse } from "@repo/shared";

/**
 * ❗ RpcError: standardized error for client-side handling
 *
 * Wraps server-provided errors and network/parse errors into a single shape.
 */
export class RpcError extends Error {
   public readonly code: number;
   public readonly message: string;
   public readonly name: string;

   constructor(payload: Required<BatchResponse>["error"]) {
      super(payload.message);

      this.code = payload.code;
      this.message = payload.message;
      this.name = payload.name;

      // ensures correct prototype chain
      Object.setPrototypeOf(this, RpcError.prototype);
   }

   static fromFetchError(err: unknown): RpcError {
      if (err instanceof DOMException && err.name === "AbortError") {
         return new RpcError({
            code: -1,
            name: "AbortError",
            message: "The request was aborted",
         });
      }

      return new RpcError({
         code: -2,
         name: "NetworkError",
         message: err instanceof Error ? err.message : "Network request failed",
      });
   }

   static fromInvalidJson(err: unknown, response: Response) {
      return new RpcError({
         code: -3, // custom code for invalid JSON
         name: "InvalidJson",
         message: `Failed to parse JSON response from ${response.url}: ${err instanceof Error ? err.message : String(err)}`,
      });
   }
}
