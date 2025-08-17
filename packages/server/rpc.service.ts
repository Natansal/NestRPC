import { Inject, Injectable } from "@nestjs/common";
import { executeRpcMethod, getRpcMethodArguments } from "./runtime/executor";
import type { NestRpcExecutionContext } from "./nestjs-rpc-execution-context";
import { ClassType } from "@repo/shared";
import { ModuleRef } from "@nestjs/core";
import { ParamResolverFactory } from "./decorators";

@Injectable()
export class NestRPCService {
   constructor(@Inject(ModuleRef) private readonly moduleRef: ModuleRef) {}

   static reservedMethodInputParamFactory: ParamResolverFactory = (ctx: NestRpcExecutionContext) => {
      const req = ctx.switchToHttp().getRequest();

      // Body: works for both Express and Fastify (if Nest body parser is enabled)
      const body: unknown = req.body;

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
      return await executeRpcMethod<TClass, TResult>(this.getRouterInstance(controllerClass), methodName, context);
   }

   getRouterInstance<T extends Record<PropertyKey, any> = any>(controllerClass: ClassType<T>) {
      return this.moduleRef.get(controllerClass, {
         strict: false,
      }) as T;
   }

   getRouterMethod<T extends Record<PropertyKey, any> = any>(controllerClass: ClassType<T>, methodName: keyof T) {
      const method = this.getRouterInstance(controllerClass);
      return method[methodName];
   }

   async getRouteArguments<T extends Record<PropertyKey, any> = any>(
      controllerClass: ClassType<T>,
      methodName: keyof T,
      context: NestRpcExecutionContext,
   ) {
      return await getRpcMethodArguments(this.getRouterInstance(controllerClass), methodName, context);
   }
}
