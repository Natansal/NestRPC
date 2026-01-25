import { ClassType, RpcRouterManifest } from "@repo/shared";
import { RpcMethodOptions } from "./rpc-method-options.type";
import { AxiosResponse } from "axios";
import { PathSymbol } from "../rpc-client";

/**
 * 🧪 Map an instance type to a callable client surface where methods accept
 * a single `body` argument (if any) and return a `Promise`.
 *
 * - For methods whose first parameter is optional or `never`, the client body is optional.
 * - For methods with a required first parameter, the client body is required.
 * - Options per call are provided via `RpcMethodOptions` (see defaults there).
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
    ) => Promise<AxiosResponse<Awaited<TResponse>, any, {}>>
  : [TBody] extends [never]
    ? (
        body?: TBody | undefined,
        options?: RpcMethodOptions,
      ) => Promise<AxiosResponse<Awaited<TResponse>, any, {}>>
    : (
        body: TBody,
        options?: RpcMethodOptions,
      ) => Promise<AxiosResponse<Awaited<TResponse>, any, {}>>;
