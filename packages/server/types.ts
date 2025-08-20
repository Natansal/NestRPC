import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { InferNestRpcRouterApp } from "@repo/shared";

/**
 * 🧩 Extended HTTP argument host for NestRPC
 *
 * Augments Nest's `HttpArgumentsHost` with access to the RPC input payload.
 */
export interface NestRPCArgumentHost extends HttpArgumentsHost {
   /**
    * 📦 Retrieve the deserialized RPC input for the current method.
    * - If the call is a batch, returns the input for the specific call (not the entire batch.
    */
   getInput<T = any>(): T;
}

export { type InferNestRpcRouterApp };
