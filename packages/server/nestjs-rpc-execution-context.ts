import { ExecutionContext } from "@nestjs/common";
import { HttpArgumentsHost, RpcArgumentsHost, WsArgumentsHost } from "@nestjs/common/interfaces";
import { ClassType } from "@repo/shared";
import { NestRPCArgumentHost } from "./types";

export class NestRpcExecutionContext implements ExecutionContext {
   constructor(
      private readonly eCtx: ExecutionContext,
      private readonly router: ClassType<any>,
      private readonly handler: Function,
      private readonly getInput: (ctx: NestRpcExecutionContext) => any,
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

   getClass<T = any>(): ClassType<T> {
      return this.router as ClassType<T>;
   }

   getHandler(): Function {
      return this.handler;
   }

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

   switchToHttpRpc(): NestRPCArgumentHost {
      const that = this;
      return {
         ...this.eCtx.switchToHttp(),
         getInput<T = any>() {
            return that.getInput(that) as T;
         },
      };
   }
}
