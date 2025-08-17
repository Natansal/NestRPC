import { Controller, type ExecutionContext, Get, Inject, NotFoundException, Param, Post, Req } from "@nestjs/common";
import { ExecutionCtx } from "./decorators/execution-context.decorator";
import { NestRPCService } from "./rpc.service";
import { NestRpcExecutionContext } from "./nestjs-rpc-execution-context";
import { ClassType, NestRpcRouterConfig } from "@repo/shared";
import { isRoute, isRouter } from "./runtime";

export interface DynamicControllerOptions {
   apiPrefix: string;
   routes: NestRpcRouterConfig;
}

/**
 * 🧩 Create a dynamic controller bound to the provided `apiPrefix`.
 *
 * @param options - ✅ Contains the `apiPrefix` to mount the controller under.
 * @returns The dynamically created controller class.
 */
export function createDynamicController(options: DynamicControllerOptions) {
   const { apiPrefix } = options;

   @Controller(apiPrefix)
   class DynamicController {
      constructor(@Inject(NestRPCService) readonly rpcService: NestRPCService) {}

      @Post("/*path")
      async handlePost(@ExecutionCtx() _ctx: ExecutionContext, @Param("path") _path: string[] | string) {
         const path: string[] = Array.isArray(_path) ? _path : _path.split("/").filter(Boolean);

         const { router, methodName } = this.getRouterAndMethodNameFromPath(path);

         const ctx = await this.getExecutionContext(_ctx, router, router.prototype[methodName]);

         return await this.runRoute(ctx, router, methodName);
      }

      async getExecutionContext(ctx: ExecutionContext, router: ClassType<any>, handler: Function) {
         return new NestRpcExecutionContext(ctx, router, handler, NestRPCService.reservedMethodInputParamFactory);
      }

      getRouterAndMethodNameFromPath(_path: string[]) {
         const path = [..._path];
         const methodName = path.pop();

         if (!methodName) {
            throw new NotFoundException("No method name provided in path");
         }

         let pointer: any = options.routes;

         // First: traverse the path to find the router
         for (let i = 0; i < path.length; i++) {
            const segment = path[i]!;
            pointer = pointer[segment];

            if (!pointer) {
               throw new NotFoundException(`Route segment '${segment}' not found`);
            }
         }

         // Second: validate we found a router
         if (!isRouter(pointer)) {
            throw new NotFoundException("Final path segment is not a router");
         }

         // Third: validate the method exists and is decorated
         const method = pointer.prototype[methodName];
         if (!method || !isRoute(method)) {
            throw new NotFoundException(`Method '${methodName}' not found or not decorated as route`);
         }

         return {
            router: pointer,
            methodName,
         };
      }

      async runRoute(ctx: NestRpcExecutionContext, router: ClassType<any>, methodName: string) {
         // TODO: implement guard checks here
         const result = await this.rpcService.execute(router, methodName, ctx);
         return result;
      }
   }

   return DynamicController;
}
