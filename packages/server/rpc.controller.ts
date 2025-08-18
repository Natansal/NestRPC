import {
   BadRequestException,
   Body,
   Controller,
   type ExecutionContext,
   Get,
   HttpException,
   Inject,
   NotFoundException,
   Param,
   Post,
   Query,
   Req,
   UnauthorizedException,
} from "@nestjs/common";
import { ExecutionCtx } from "./decorators/execution-context.decorator";
import { NestRPCService } from "./rpc.service";
import { NestRpcExecutionContext } from "./nestjs-rpc-execution-context";
import {
   BatchCall,
   BatchItem,
   BatchQuery,
   BatchResponse,
   ClassType,
   decodeBatchQuery,
   encodeBatchQuery,
   NestRpcRouterConfig,
} from "@repo/shared";
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

      memoizedRouterAndMethodName: Map<string, ReturnType<typeof this.getRouterAndMethodNameFromPath>> = new Map();

      @Post()
      async handleBatch(
         @Body() body: BatchCall[],
         @ExecutionCtx() nestExecutionContext: ExecutionContext,
         @Query("calls") rawCalls: string,
      ) {
         if (typeof body === "undefined") {
            throw new Error("Received undefined body for rpc handler:( Please use a body parser");
         }

         const calls = decodeBatchQuery(rawCalls);

         if (calls.length === 0) {
            console.warn("Got empty batch request");
            return [];
         }

         if (body.length !== calls.length) {
            throw new Error("Body and routes length mismatch");
         }

         const results: BatchResponse[] = [];

         await Promise.all(
            body.map(async (bodyCall, i) => {
               const queryCall = calls.find((call) => call.id === bodyCall.id);

               if (!queryCall) {
                  throw new Error(`queryCall with id ${bodyCall.id} not found`);
               }

               const call = {
                  ...bodyCall,
                  ...queryCall,
               };

               const result = await this.handleRpcCall(call, nestExecutionContext);
               results[i] = result;
            }),
         );

         return results;
      }

      async handleRpcCall(call: BatchItem, _ctx: ExecutionContext): Promise<BatchResponse> {
         const { input, path, id } = call;

         try {
            const { router, methodName } = this.getRouterAndMethodNameFromPath(path);

            const ctx = new NestRpcExecutionContext(_ctx, router, router, input);

            const result = await this.runRoute(ctx, router, methodName);

            return { id, response: { data: result } };
         } catch (error) {
            return this.handleRpcError(call, error);
         }
      }

      handleRpcError(call: BatchItem, e: unknown): BatchResponse {
         if (!(e instanceof Error)) {
            return {
               id: call.id,
               error: {
                  code: 500,
                  message: e == null ? "Unknown error" : String(e),
                  name: "NonErrorThrow",
               },
            };
         }

         if (!(e instanceof HttpException)) {
            return {
               id: call.id,
               error: {
                  code: 500,
                  message: "Internal server error",
                  name: e.name || "Error",
               },
            };
         }

         const status = e.getStatus();
         const response = e.getResponse();

         return {
            id: call.id,
            error: {
               code: status,
               message: typeof response === "string" ? response : e.message,
               name: e.name,
            },
         };
      }

      getRouterAndMethodNameFromPath(_path: string[]): { router: ClassType<any>; methodName: string } {
         const existing = this.memoizedRouterAndMethodName.get(_path.join("."));
         if (existing) return existing;

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

         const result = {
            router: pointer,
            methodName,
         };

         this.memoizedRouterAndMethodName.set(_path.join("."), result);

         return result;
      }

      async runRoute(ctx: NestRpcExecutionContext, router: ClassType<any>, methodName: string) {
         // TODO: implement guard checks here
         const result = await this.rpcService.execute(router, methodName, ctx);
         return result;
      }
   }

   return DynamicController;
}
