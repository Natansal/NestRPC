import "reflect-metadata";
import { RPC_ARGS_COMPILER_METADATA, RPC_PARAM_RESOLVERS_METADATA } from "../constants";
import { NestRpcExecutionContext } from "../nestjs-rpc-execution-context";
import { ParamResolverFactory } from "../decorators/param.decorator";
import { NestRPCService } from "../rpc.service";
import { BadRequestException } from "@nestjs/common";

export interface RpcCompiledArgs {
   buildArgs: (...args: Parameters<ParamResolverFactory>) => Promise<unknown[]> | unknown[];
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
      resolve: ParamResolverFactory;
   }>;

   // Enforce reserved index 0 for the raw execution context
   if (resolvers.some((r) => r.index === 0)) {
      throw new Error(
         "Parameter index 0 is reserved for the execution context and cannot be decorated. Remove the decorator from the first parameter.",
      );
   }

   // Build an effective resolver list that includes the reserved index 0 factory
   const effectiveResolvers: Array<{ index: number; resolve: ParamResolverFactory }> = [
      { index: 0, resolve: NestRPCService.reservedMethodInputParamFactory },
      ...resolvers,
   ];

   const maxIndex = effectiveResolvers.reduce((max, r) => Math.max(max, r.index), -1);

   const buildArgs = async (context: NestRpcExecutionContext): Promise<unknown[]> => {
      const args: unknown[] = new Array(maxIndex + 1).fill(undefined);
      for (const { index, resolve } of effectiveResolvers) {
         const value = resolve(context);
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
 * @returns The method's return value.
 */
export async function executeRpcMethod<TClass extends object, TResult = unknown>(
   controllerInstance: TClass,
   methodName: keyof TClass,
   context: NestRpcExecutionContext,
): Promise<TResult> {
   const method = getRpcMethod(controllerInstance, methodName);
   const args = await getRpcMethodArguments(controllerInstance, methodName, context);
   return await (method.apply(controllerInstance, args) as Promise<TResult> | TResult);
}

/**
 * 🔎 Resolve a method function from a controller instance by name.
 *
 * @param controllerInstance - The instance that should contain the method.
 * @param methodName - The key/name of the method to retrieve.
 * @returns The resolved method function.
 * @throws Error if the property is missing or not a function.
 */
export function getRpcMethod<TClass extends object>(controllerInstance: TClass, methodName: keyof TClass) {
   const method: Function | undefined = (controllerInstance as any)[methodName];
   if (typeof method !== "function") {
      throw new BadRequestException(`Method '${methodName.toString()}' not found on controller instance`);
   }
   return method;
}

/**
 * 🧩 Build the ordered argument list for a controller method using RPC param resolvers.
 *
 * @param controllerInstance - Instance containing the decorated method.
 * @param methodName - Name of the method whose arguments should be resolved.
 * @param context - Execution context provided to param resolvers.
 * @returns A promise that resolves to the array of arguments in call order.
 */
export async function getRpcMethodArguments<TClass extends object>(
   controllerInstance: TClass,
   methodName: keyof TClass,
   context: NestRpcExecutionContext,
) {
   const method = getRpcMethod(controllerInstance, methodName);
   const { buildArgs } = getOrCompileArgsBuilder(method);
   const args = await buildArgs(context);
   return args;
}
