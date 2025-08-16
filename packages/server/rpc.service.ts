import { Injectable } from "@nestjs/common";
import { executeRpcMethod } from "./runtime/executor";
import type { NestRpcExecutionContext } from "./types";
import { ClassType } from "@repo/shared";
import { ModuleRef } from "@nestjs/core";
import { ParamResolverFactory } from "./decorators";

@Injectable()
export class NestRPCService {
   constructor(private readonly moduleRef: ModuleRef) {}

   static reservedMethodInputParamFactory: ParamResolverFactory = (ctx: NestRpcExecutionContext) => {
      const req = ctx.switchToHttp().getRequest();

      // Body: works for both Express and Fastify (if Nest body parser is enabled)
      const body: unknown = req.body || {};

      // URL / path - for both Express and Fastify
      const pathname: string = req.url || req.raw?.url || "";

      // TODO: for batch requests, we need to return the data for the specific context
      return body;
   };

   /**
    * ✨ Execute a method on a given controller instance using the custom RPC param injection.
    *
    * @param controllerInstance - 🧩 The target instance containing the method.
    * @param methodName - 🔧 The name of the method to invoke.
    * @param context - 📦 Context object available to param decorators.
    * @returns The result of the invoked method.
    */
   async execute<TClass extends object, TResult = unknown>(
      controllerClass: ClassType<TClass>,
      methodName: keyof TClass,
      context: NestRpcExecutionContext,
   ): Promise<TResult> {
      return await executeRpcMethod<TClass, TResult>(
         this.moduleRef.get(controllerClass, {
            strict: false,
         }),
         methodName,
         context,
      );
   }
}
