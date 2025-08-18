import { Router, Route } from 'server';

@Router()
export class AppRouter {
  @Route()
  hello({ greeting }: { greeting: string }) {
    return `Hello! this is the greeting: ${greeting}`;
  }
}
