import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

export const ExecutionCtx = createParamDecorator<never, ExecutionContext>((data: unknown, ctx: ExecutionContext) => {
   return ctx;
});
