import { Router, Route } from 'server';

@Router()
export class AppRouter {
  @Route()
  hello({ id }: { id: string }) {
    return `This is the id: ${id}`;
  }
}
