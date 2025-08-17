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

class A {
   do(body: string) {
      return 1;
   }
}
class B {
   do(body: number) {}
}
class C {
   async do(body: never) {}
}
class D {
   do(body: string) {}
}
class E {
   do(body: string) {}
}
const config = {
   a: A,
   b: {
      b: B,
      c: C,
   },
   a1: {
      b: {
         c: {
            d: {
               e: E,
            },
         },
      },
   },
} as const;

declare const linko: InferNestRpcRouterApp<typeof config>;

linko.b.c.do();

const baseUrl = "http://localhost:3000/api";

const final = `${baseUrl}/b/c/do`;
