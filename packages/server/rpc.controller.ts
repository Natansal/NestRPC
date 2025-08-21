import {
   BadRequestException,
   Body,
   Controller,
   type ExecutionContext,
   HttpException,
   Inject,
   LoggerService,
   NotFoundException,
   Post,
   Query,
} from "@nestjs/common";
import { ExecutionCtx } from "./decorators/execution-context.decorator";
import { NestRPCService } from "./rpc.service";
import { NestRpcExecutionContext } from "./nestjs-rpc-execution-context";
import { BatchCall, BatchItem, BatchResponse, ClassType, decodeBatchQuery, NestRpcRouterConfig } from "@repo/shared";
import { isRoute, isRouter } from "./runtime";

export interface DynamicControllerOptions {
   apiPrefix: string;
   routes: NestRpcRouterConfig;
   logger: LoggerService;
}

/**
 * 🧩 Create a dynamic controller bound to the provided `apiPrefix`.
 *
 * @param options - ✅ Dynamic controller options.
 * @returns The dynamically created controller class.
 */
export function createDynamicController(options: DynamicControllerOptions) {
   const { apiPrefix, logger } = options;

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
            throw new BadRequestException(
               "RPC handler received empty or undefined body. Please ensure a valid body is sent.",
            );
         }

         const calls = decodeBatchQuery(rawCalls);

         if (calls.length === 0) {
            logger.warn("Got empty batch request");
            return [];
         }

         if (body.length !== calls.length) {
            throw new BadRequestException("RPC handler received body and calls length mismatch");
         }

         const results: BatchResponse[] = [];

         await Promise.all(
            body.map(async (bodyCall, i) => {
               const queryCall = calls.find((call) => call.id === bodyCall.id);

               if (!queryCall) {
                  throw new BadRequestException(
                     `RPC handler did not receive a queryCall with id ${bodyCall.id} in the body.`,
                  );
               }

               const call = {
                  ...bodyCall,
                  ...queryCall,
               };

               const result = await this.handleRpcCall(call, nestExecutionContext);

               if (result.response) {
                  logger.log(`[RPC Request Success] route: "${call.path.join(".")}"`);
               } else if (result.error) {
                  logger.error(
                     `[RPC Request Error] route: "${call.path.join(".")}", error: ${JSON.stringify(result.error)}`,
                  );
               }

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
         logger.error(`Error in RPC for call \`${call.path.join(".")}\`: ${JSON.stringify(e)}`);

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
            throw new NotFoundException("RPC handler did not receive a method name in the path.");
         }

         let pointer: any = options.routes;

         // First: traverse the path to find the router
         for (let i = 0; i < path.length; i++) {
            const segment = path[i]!;
            pointer = pointer[segment];

            if (!pointer) {
               throw new NotFoundException(`RPC handler did not find a route segment '${segment}' in the path.`);
            }
         }

         // Second: validate we found a router
         if (!isRouter(pointer)) {
            throw new NotFoundException("RPC handler did not find a router in the path.");
         }

         // Third: validate the method exists and is decorated
         const method = pointer.prototype[methodName];
         if (!method || !isRoute(method)) {
            throw new NotFoundException(
               `RPC handler did not find a method '${methodName}' in the router or it is not decorated with @Route.`,
            );
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
