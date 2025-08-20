import { ClassType } from "./class.type";

type Router = ClassType<any>;

/**
 * 🗺️ Declarative configuration for mapping keys to routers or nested configs.
 */
export type NestRpcRouterConfig = {
   [key: string]: Router | NestRpcRouterConfig;
};

/**
 * 🧪 Map an instance type to a callable client surface where methods accept
 * a single `body` argument (if any) and return a `Promise`.
 */
export type InstanceMethods<T> = {
   [K in keyof T as T[K] extends (...args: any) => any ? K : never]: T[K] extends (...args: infer A) => infer R ?
      A extends [infer First, ...any[]] ?
         [First] extends [never] ?
            () => Promise<Awaited<R>>
         :  (body: First) => Promise<Awaited<R>>
      :  () => Promise<Awaited<R>>
   :  never;
};

/**
 * 🧠 Infer the client application type from a router configuration map.
 * Use this when creating a client proxy.
 */
export type InferNestRpcRouterApp<T extends NestRpcRouterConfig> = {
   [K in keyof T]: T[K] extends Router ? InstanceMethods<InstanceType<T[K]>>
   : T[K] extends NestRpcRouterConfig ? InferNestRpcRouterApp<T[K]>
   : never;
};
