import { createParamDecorator, Req } from '@nestjs/common';
import { createRouterParamDecorator, Route, Router } from 'server';

@Router()
export class AppRouter {
  @Route()
  test(id: string, @Req() req: Request) {
    return `This is the id: ${JSON.stringify(id)}`;
  }
}
