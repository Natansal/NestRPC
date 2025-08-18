import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { InferNestRpcRouterApp } from "@repo/shared";

export interface NestRPCArgumentHost extends HttpArgumentsHost {
   getInput<T = any>(): T;
}

export { type InferNestRpcRouterApp };
