import { ClassType, RpcRouterManifest } from "@repo/shared";
import { RpcMethodOptions } from "./rpc-method-options.type";
import { AxiosResponse } from "axios";
import { PathSymbol } from "../rpc-client";

/**
 * 🧪 Map an instance type to a callable client surface where methods accept
 * a single `body` argument (if any) and return a `Promise`.
 *
 * This type extracts all methods from an instance type and transforms them
 * into RPC methods that:
 * - Accept the first parameter as `body`
 * - Make the body optional if the original parameter was optional/never/void
 * - Return a Promise<AxiosResponse> with the method's return type
 * - Include the PathSymbol for route identification
 *
 * @template T - The instance type (e.g., InstanceType<UserRouter>)
 *
 * @example
 * ```ts
 * @Router()
 * class UserRouter {
 *   @Route()
 *   async getUserById(id: string): Promise<User> { ... }
 *
 *   @Route()
 *   async listUsers(): Promise<User[]> { ... }
 * }
 *
 * type UserRouterInstance = InstanceType<UserRouter>;
 * type UserRouterMethods = InstanceMethods<UserRouterInstance>;
 *
 * // UserRouterMethods['getUserById'] is now:
 * // RpcMethod<{id: string}, User> & { [PathSymbol]: string[] }
 *
 * // UserRouterMethods['listUsers'] is now:
 * // RpcMethod<void, User[]> & { [PathSymbol]: string[] }
 * ```
 */
export type InstanceMethods<T> = {
  [K in keyof T as T[K] extends (...args: any) => any
    ? K
    : never]: T[K] extends (...args: infer A) => infer R
    ? RpcMethod<A[0], R> & { [PathSymbol]: string[] }
    : never;
} & { [PathSymbol]: string[] };

/**
 * 🧠 Infer the client application type from a router configuration map.
 * Use this when creating a client proxy.
 *
 * @typeParam T - 📘 A `RpcRouterManifest` mapping keys to router classes or nested manifests.
 */
export type InferNestRpcRouterApp<
  T extends RpcRouterManifest = RpcRouterManifest,
> = {
  [K in keyof T]: T[K] extends ClassType<any>
    ? InstanceMethods<InstanceType<T[K]>>
    : T[K] extends RpcRouterManifest
      ? InferNestRpcRouterApp<T[K]>
      : never;
} & { [PathSymbol]: string[] };

/**
 * 🧪 Takes a body type and a response type and returns a function that takes
 * a single `body` argument (if any) and return a `Promise`.
 *
 * - For methods whose first parameter is optional or `never`, the client body is optional.
 * - For methods with a required first parameter, the client body is required.
 * - Options per call are provided via `RpcMethodOptions` (see defaults there).
 *
 */
export type RpcMethod<TBody, TResponse> = undefined extends TBody
  ? (
      body?: TBody | undefined,
      options?: RpcMethodOptions,
    ) => Promise<AxiosResponse<Awaited<TResponse>, unknown, {}>>
  : [TBody] extends [never]
    ? (
        body?: TBody | undefined,
        options?: RpcMethodOptions,
      ) => Promise<AxiosResponse<Awaited<TResponse>, unknown, {}>>
    : (
        body: TBody,
        options?: RpcMethodOptions,
      ) => Promise<AxiosResponse<Awaited<TResponse>, unknown, {}>>;

/**
 * 🔍 Extract the response data type from an RPC method.
 *
 * This utility type extracts the `data` property from the `AxiosResponse`
 * returned by an RPC method, making it easy to get the actual return type.
 *
 * @template T - An RPC method function type
 * @example
 * ```ts
 * type GetUserResponse = MethodResponse<typeof rpc.user.getUserById>;
 * // GetUserResponse is the User type returned by getUserById
 * ```
 */
export type MethodResponse<
  T extends (...arg: unknown[]) => Promise<AxiosResponse<unknown>>,
> = Awaited<ReturnType<T>>["data"];

/**
 * 🔍 Extract the body parameter type from an RPC method.
 *
 * This utility type extracts the first parameter (body) from an RPC method,
 * making it easy to get the expected input type.
 *
 * @template T - An RPC method function type
 * @example
 * ```ts
 * type CreateUserBody = MethodBody<typeof rpc.user.createUser>;
 * // CreateUserBody is the body type expected by createUser
 * ```
 */
export type MethodBody<
  T extends (...arg: unknown[]) => Promise<AxiosResponse<unknown>>,
> = Parameters<T>[0];
