import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

/**
 * 🧠 Inject the raw Nest `ExecutionContext` into an RPC route handler parameter.
 *
 * Useful when you need low-level access to the underlying transport context.
 */
export const ExecutionCtx = createParamDecorator<never, ExecutionContext>((data: unknown, ctx: ExecutionContext) => {
   return ctx;
});
