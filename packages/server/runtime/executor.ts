import "reflect-metadata";
import { RPC_ARGS_COMPILER_METADATA, RPC_PARAM_RESOLVERS_METADATA } from "../constants";
import { NestRpcExecutionContext } from "../types";

export interface RpcCompiledArgs {
   buildArgs: (providedArgs: unknown[], context: NestRpcExecutionContext) => Promise<unknown[]> | unknown[];
}

/**
 * ⚙️ Compile and cache an argument builder for a given method.
 *
 * @param method - The function to compile metadata for.
 * @returns A compiled builder that assembles arguments in call order.
 */
function getOrCompileArgsBuilder(method: Function): RpcCompiledArgs {
   const existing = Reflect.getMetadata(RPC_ARGS_COMPILER_METADATA, method) as RpcCompiledArgs | undefined;
   if (existing) return existing;

   const resolvers = (Reflect.getMetadata(RPC_PARAM_RESOLVERS_METADATA, method) ?? []) as Array<{
      index: number;
      resolve: (data: unknown[], ctx: NestRpcExecutionContext) => unknown | Promise<unknown>;
   }>;

   const maxIndex = resolvers.reduce((max, r) => Math.max(max, r.index), -1);

   const buildArgs = async (providedArgs: unknown[] = [], context: NestRpcExecutionContext): Promise<unknown[]> => {
      const args: unknown[] = new Array(Math.max(maxIndex + 1, providedArgs.length)).fill(undefined);
      // Place provided args first (callers may pass some args explicitly)
      for (let i = 0; i < providedArgs.length; i++) args[i] = providedArgs[i];
      // Apply resolver results at their indexes
      for (const { index, resolve } of resolvers) {
         const value = resolve(providedArgs, context);
         args[index] = value instanceof Promise ? await value : value;
      }
      return args;
   };

   const compiled: RpcCompiledArgs = { buildArgs };
   Reflect.defineMetadata(RPC_ARGS_COMPILER_METADATA, compiled, method);
   return compiled;
}

/**
 * 🚀 Execute a controller method with RPC param injection.
 *
 * @param controllerInstance - Instance containing the decorated method.
 * @param methodName - Name of the method to call.
 * @param context - Context object passed to param resolvers.
 * @param providedArgs - Optional explicit arguments to pass by position.
 * @returns The method's return value.
 */
export async function executeRpcMethod<TClass extends object, TResult = unknown>(
   controllerInstance: TClass,
   methodName: keyof TClass,
   context: NestRpcExecutionContext,
   providedArgs: unknown[] = [],
): Promise<TResult> {
   const method: Function | undefined = (controllerInstance as any)[methodName];
   if (typeof method !== "function") {
      throw new Error(`Method '${methodName.toString()}' not found on controller instance`);
   }
   const { buildArgs } = getOrCompileArgsBuilder(method);
   const args = await buildArgs(providedArgs, context);
   return await (method.apply(controllerInstance, args) as Promise<TResult> | TResult);
}
