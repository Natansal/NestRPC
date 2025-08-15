import { Inject, Injectable } from "@nestjs/common";
import { RPC_MODULE_OPTIONS } from "./constants";
import type { NestRPCModuleOptions } from "./rpc.module";
import { executeRpcMethod } from "./runtime/executor";
import type { NestRpcExecutionContext } from "./types";

@Injectable()
export class NestRPCService {
   constructor(
      @Inject(RPC_MODULE_OPTIONS)
      private readonly options: NestRPCModuleOptions<any>,
   ) {}

   /**
    * ✨ Execute a method on a given controller instance using the custom RPC param injection.
    *
    * @param controllerInstance - 🧩 The target instance containing the method.
    * @param methodName - 🔧 The name of the method to invoke.
    * @param context - 📦 Context object available to param decorators.
    * @returns The result of the invoked method.
    */
   async execute<TResult>(
      controllerInstance: object,
      methodName: string,
      context: NestRpcExecutionContext,
      providedArgs: unknown[] = [],
   ): Promise<TResult> {
      return await executeRpcMethod<TResult>(controllerInstance, methodName, context, providedArgs);
   }
}
