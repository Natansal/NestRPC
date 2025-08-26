import { Body, Post } from "@nestjs/common";
import { asyncStorage } from "../rpc-module/rpc.module";
import { RpcRequest } from "../types/rpc-request.type";
import { ROUTE_METADATA } from "../reflect-keys.constant";

export interface RouteOptions {
   path?: string;
}

// export function Route(options: RouteOptions = {}): MethodDecorator {
//    const { path } = options;
//    return function (target, propertyKey, descriptor: PropertyDescriptor) {
//       Reflect.defineMetadata(ROUTE_METADATA, options, target, propertyKey);

//       const original = descriptor.value;

//       descriptor.value = function (...args: any[]) {
//          const store = asyncStorage.getStore();
//          const ctx = store?.executionContext;

//          if (!ctx) {
//             throw new Error(
//                "ExecutionContext not found in AsyncLocalStorage. Make sure a global interceptor is storing it.",
//             );
//          }

//          args.unshift((ctx.switchToHttp().getRequest().body as RpcRequest)?.param);

//          return original.apply(this, args);
//       };

//       return Post(path ?? propertyKey.toString())(target, propertyKey, descriptor);
//    };
// }

export function Route(options: RouteOptions = {}): MethodDecorator {
   return function (target, propertyKey, descriptor: PropertyDescriptor) {
      options.path ??= propertyKey.toString();

      Reflect.defineMetadata(ROUTE_METADATA, options, target, propertyKey);

      Body("param")(target, propertyKey, 0);

      return Post(options.path)(target, propertyKey, descriptor);
   };
}
