import { Router, Route } from 'server';

@Router()
export class AppRouter {
  @Route()
  batch1(number: number) {
    return `Batch 1 got number: ${number}`;
  }

  @Route()
  batch2(number: number) {
    return `Batch 2 got number: ${number}`;
  }

  @Route()
  batch3(number: number) {
    return `Batch 3 got number: ${number}`;
  }
}
