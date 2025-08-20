import { ExecutionContext } from "@nestjs/common";
import { HttpArgumentsHost, RpcArgumentsHost, WsArgumentsHost } from "@nestjs/common/interfaces";
import { ClassType } from "@repo/shared";
import { NestRPCArgumentHost } from "./types";

/**
 * 🧠 NestRpcExecutionContext
 *
 * Wrapper around Nest's `ExecutionContext` that exposes Router/Handler typing
 * and the RPC input payload while delegating standard context methods.
 */
export class NestRpcExecutionContext implements ExecutionContext {
   constructor(
      private readonly eCtx: ExecutionContext,
      private readonly router: ClassType<any>,
      private readonly handler: Function,
      private readonly input: any,
   ) {}

   get _executionContext(): ExecutionContext {
      return this.eCtx;
   }

   getArgs<T extends Array<any> = any[]>(): T {
      return this.eCtx.getArgs<T>();
   }

   getArgByIndex<T = any>(index: number): T {
      return this.eCtx.getArgByIndex<T>(index);
   }

   /**
    * 🧭 The router class associated with the current RPC handler.
    */
   getClass<T = any>(): ClassType<T> {
      return this.router as ClassType<T>;
   }

   /**
    * 🛠️ The method (handler) being invoked for this RPC call.
    */
   getHandler(): Function {
      return this.handler;
   }

   /**
    * 🏷️ Always returns `"http-rpc"` for RPC execution type.
    */
   getType<TContext extends string = "http-rpc">(): TContext {
      return "http-rpc" as TContext;
   }

   switchToWs(): WsArgumentsHost {
      return this.eCtx.switchToWs();
   }

   switchToHttp(): HttpArgumentsHost {
      return this.eCtx.switchToHttp();
   }

   switchToRpc(): RpcArgumentsHost {
      return this.eCtx.switchToRpc();
   }

   /**
    * 📦 Specialized host exposing the RPC input via `getInput()` alongside HTTP interfaces.
    */
   switchToHttpRpc(): NestRPCArgumentHost {
      const that = this;
      return {
         ...this.eCtx.switchToHttp(),
         getInput<T = any>() {
            return that.input as T;
         },
      };
   }
}
