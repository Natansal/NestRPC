import { Inject, Injectable } from "@nestjs/common";
import { executeRpcMethod } from "./runtime/executor";
import type { NestRpcExecutionContext } from "./types";
import { ClassType } from "@repo/shared";
import { ModuleRef } from "@nestjs/core";

@Injectable()
export class NestRPCService {
   constructor(private readonly moduleRef: ModuleRef) {}

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
      providedArgs: unknown[] = [],
   ): Promise<TResult> {
      return await executeRpcMethod<TClass, TResult>(
         this.moduleRef.get(controllerClass, {
            strict: false,
         }),
         methodName,
         context,
         providedArgs,
      );
   }
}
