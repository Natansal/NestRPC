import { HttpArgumentsHost } from "@nestjs/common/interfaces";

export interface NestRPCArgumentHost extends HttpArgumentsHost {
   getInput<T = any>(): T;
}
