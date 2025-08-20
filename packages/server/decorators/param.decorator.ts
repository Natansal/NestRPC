import "reflect-metadata";
import { RPC_PARAM_RESOLVERS_METADATA } from "../constants";
import { NestRpcExecutionContext } from "../nestjs-rpc-execution-context";

/**
 * 🪄 Function that computes a parameter value for a route method.
 *
 * Receives the decoration-time input and the per-request execution context.
 */
export type ParamResolver<T extends any[] = []> = (
   data: T,
   context: NestRpcExecutionContext,
) => unknown | Promise<unknown>;

/**
 * 🏭 Zero-arg factory stored on a parameter that can resolve the value at call time.
 */
export type ParamResolverFactory = (context: NestRpcExecutionContext) => unknown | Promise<unknown>;

export interface ParamResolverEntry {
   index: number;
   resolve: ParamResolverFactory;
}

/**
 * 🧩 Factory to create custom parameter decorators for RPC methods inside the router.
 *
 * Example:
 * ```ts
 * // Provide developer input at decoration time
 * const ByKey = createRouterParamDecorator<[string]>(([key], ctx) => (ctx as any)[key]);
 *
 * class MyRouter {
 *   myMethod(@ByKey("user") user: any) {}
 * }
 * ```
 *
 * @param factory - ✨ Function that maps (developer input, context) to a parameter value.
 * @returns A decorator-factory you can call with input to produce a parameter decorator.
 */
export function createRouterParamDecorator<T extends any[] = []>(factory: ParamResolver<T>) {
   return function withInput(...data: T): ParameterDecorator {
      return function RouterParamDecorator(
         target: object,
         propertyKey: string | symbol | undefined,
         parameterIndex: number,
      ) {
         if (!propertyKey) return;
         const method = Reflect.getOwnPropertyDescriptor(target, propertyKey)?.value ?? (target as any)[propertyKey];
         const existing: ParamResolverEntry[] = Reflect.getMetadata(RPC_PARAM_RESOLVERS_METADATA, method) ?? [];

         const entry: ParamResolverEntry = {
            index: parameterIndex,
            resolve: (context) => factory(data, context),
         };
         const updated = [...existing, entry].sort((a, b) => a.index - b.index);
         Reflect.defineMetadata(RPC_PARAM_RESOLVERS_METADATA, updated, method);
      };
   };
}
