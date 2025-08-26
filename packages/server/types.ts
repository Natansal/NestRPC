import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { InferNestRpcRouterApp } from "@repo/shared";
import { Observable } from "rxjs";
import { NestRpcExecutionContext } from "./nestjs-rpc-execution-context";

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

/**
 * Interface defining the `canActivate()` function that must be implemented
 * by a guard.  Return value indicates whether or not the current request is
 * allowed to proceed.  Return can be either synchronous (`boolean`)
 * or asynchronous (`Promise<boolean>`).
 */
export interface CanActivate {
   /**
    * @param context Current execution context. Provides access to details about
    * the current request pipeline.
    *
    * @returns Value indicating whether or not the current request is allowed to
    * proceed.
    */
   canActivate(context: NestRpcExecutionContext): boolean | Promise<boolean>;
}

export { type InferNestRpcRouterApp };
