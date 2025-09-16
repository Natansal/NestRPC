import { ClassType, RpcRouterManifest } from "@repo/shared";
import { RpcMethodOptions } from "./rpc-method-options.type";
import { AxiosResponse } from "axios";

/**
 * 🧪 Map an instance type to a callable client surface where methods accept
 * a single `body` argument (if any) and return a `Promise`.
 */
export type InstanceMethods<T> = {
   [K in keyof T as T[K] extends (...args: any) => any ? K : never]: T[K] extends (...args: infer A) => infer R ?
      undefined extends A[0] ?
         (body?: A[0], options?: RpcMethodOptions) => Promise<AxiosResponse<Awaited<R>, A[0] | undefined, {}>>
      : [A[0]] extends [never] ?
         (body?: A[0], options?: RpcMethodOptions) => Promise<AxiosResponse<Awaited<R>, A[0] | undefined, {}>>
      :  (body: A[0], options?: RpcMethodOptions) => Promise<AxiosResponse<Awaited<R>, A[0], {}>>
   :  never;
};

/**
 * 🧠 Infer the client application type from a router configuration map.
 * Use this when creating a client proxy.
 */
export type InferNestRpcRouterApp<T extends RpcRouterManifest = RpcRouterManifest> = {
   [K in keyof T]: T[K] extends ClassType<any> ? InstanceMethods<InstanceType<T[K]>>
   : T[K] extends RpcRouterManifest ? InferNestRpcRouterApp<T[K]>
   : never;
};
