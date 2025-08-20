import { createRouterParamDecorator } from "./param.decorator";

/**
 * 📥 Inject the underlying Nest `Request` object into an RPC route handler.
 */
export const Req = createRouterParamDecorator((_, ctx) => ctx.switchToHttp().getRequest());
/**
 * 📤 Inject the underlying Nest `Response` object into an RPC route handler.
 */
export const Res = createRouterParamDecorator((_, ctx) => ctx.switchToHttp().getResponse());
/**
 * ⏭️ Inject the Express `next` function into an RPC route handler.
 */
export const Next = createRouterParamDecorator((_, ctx) => ctx.switchToHttp().getNext());
