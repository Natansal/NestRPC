import { createRouterParamDecorator } from "./param.decorator";

export const Input = createRouterParamDecorator((_, ctx) => ctx.switchToHttpRpc().getInput());
