import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import {
  InferNestRpcRouterApp as InferSharedType,
  NestRpcRouterConfig,
} from "@repo/shared";

export interface NestRPCArgumentHost extends HttpArgumentsHost {
  getInput<T = any>(): T;
}

export type InferNestRpcRouterApp<T extends NestRpcRouterConfig> =
  InferSharedType<T>;
