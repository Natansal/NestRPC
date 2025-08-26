import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { executeRpcMethod, getRpcMethodArguments } from "./runtime/executor";
import type { NestRpcExecutionContext } from "./nestjs-rpc-execution-context";
import { ClassType } from "@repo/shared";
import { ModuleRef } from "@nestjs/core";
import { ParamResolverFactory } from "./decorators/param.decorator";
import { CanActivate } from "./types";
import { RPC_GUARDS_METADATA } from "./constants";

@Injectable()
export class NestRPCService {
   constructor(@Inject(ModuleRef) private readonly moduleRef: ModuleRef) {}

   static reservedMethodInputParamFactory: ParamResolverFactory = (ctx: NestRpcExecutionContext) => {
      return ctx.switchToHttpRpc().getInput();
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

   async runGuards<TClass extends object>(
      controllerClass: ClassType<TClass>,
      methodName: keyof TClass,
      context: NestRpcExecutionContext,
   ) {
      // Merge method-level + class-level guards
      const guards: CanActivate[] = [
         ...(Reflect.getMetadata(RPC_GUARDS_METADATA, controllerClass.prototype, methodName.toString()) ?? []),
         ...(Reflect.getMetadata(RPC_GUARDS_METADATA, controllerClass) ?? []),
      ];

      for (const guard of guards) {
         const instance: CanActivate =
            typeof guard === "function" ? this.moduleRef.get(guard, { strict: false }) : guard;

         const ok = await instance.canActivate(context);
         if (!ok) throw new ForbiddenException();
      }
   }
}
