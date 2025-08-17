import { createRouterParamDecorator } from "./param.decorator";

export const Req = createRouterParamDecorator((_, ctx) => ctx.switchToHttp().getRequest());
export const Res = createRouterParamDecorator((_, ctx) => ctx.switchToHttp().getResponse());
export const Next = createRouterParamDecorator((_, ctx) => ctx.switchToHttp().getNext());
