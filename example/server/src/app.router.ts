import { Route, Router } from 'server';

@Router()
export class AppRouter {
  @Route()
  test(id: string) {
    return `This is the id: ${JSON.stringify(id)}`;
  }
}
