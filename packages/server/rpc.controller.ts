import { Body, Controller, type ExecutionContext, Get, Post } from "@nestjs/common";
import { executeRpcMethod } from "./runtime/executor";
import { ExecutionCtx } from "./decorators/execution-context.decorator";

export interface DynamicControllerOptions {
   apiPrefix: string;
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
      @Get("*")
      handleGet(@ExecutionCtx() ctx: ExecutionContext) {
         // Intentionally left  blank for now. The dynamic route handler can
         // delegate to executeRpcMethod when router integration is wired.
      }

      @Post("*")
      handlePost(@ExecutionCtx() ctx: ExecutionContext) {}
   }

   return DynamicController;
}
