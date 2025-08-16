import { ClassType } from "./class.type";

export type Router = ClassType<any>;

export type NestRpcRouterConfig = {
   [key: string]: Router | NestRpcRouterConfig;
};

export type InstanceMethods<T> = {
   [K in keyof T as T[K] extends (...args: any) => any ? K : never]: T[K] extends (...args: infer A) => infer R ?
      A extends [infer First, ...any[]] ?
         [First] extends [never] ?
            () => Promise<Awaited<R>>
         :  (body: First) => Promise<Awaited<R>>
      :  () => Promise<Awaited<R>>
   :  never;
};

export type InferNestRpcRouterApp<T extends NestRpcRouterConfig> = {
   [K in keyof T]: T[K] extends Router ? InstanceMethods<InstanceType<T[K]>>
   : T[K] extends NestRpcRouterConfig ? InferNestRpcRouterApp<T[K]>
   : never;
};
