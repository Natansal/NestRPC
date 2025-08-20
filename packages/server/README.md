## NestRPC Server

Decorator-driven RPC for NestJS with a dynamic controller, parameter injection, and a tiny set of primitives.

### Features
- **Declarative routers** via `@Router()` and `@Route()`
- **Dynamic controller** mounted under a configurable prefix
- **Custom parameter decorators** powered by execution context
- **Type-safe client inference** via shared types

### Installation
Build as part of the monorepo:

```bash
pnpm -w build
```

Ensure `reflect-metadata` is imported once in your Nest app entrypoint, e.g. `main.ts`.

### Getting Started
Register the module with your router map:

```ts
import { Module } from '@nestjs/common';
import { NestRPCModule, Router, Route, createRouterParamDecorator } from '@repo/server';

const ByKey = createRouterParamDecorator<[string]>(([key], ctx) => (ctx as any)[key]);

@Router()
export class UserRouter {
  @Route()
  me(@ByKey('user') user: { id: string }) {
    return user;
  }
}

@Module({
  imports: [
    NestRPCModule.forRoot({
      global: true,
      apiPrefix: '/nestjs-rpc', // default
      routes: { user: UserRouter },
    }),
  ],
})
export class AppModule {}
```

### Parameter Decorators
Create custom parameter decorators that read from the execution context:

```ts
import { createRouterParamDecorator } from '@repo/server';

export const CurrentUser = createRouterParamDecorator((_, ctx) => (ctx as any).user);

@Route()
getProfile(@CurrentUser user: { id: string }) {
  return user;
}
```

### Programmatic Execution
Use `NestRPCService` to execute handlers directly:

```ts
import { Injectable } from '@nestjs/common';
import { NestRPCService } from '@repo/server';

@Injectable()
export class Runner {
  constructor(private readonly rpc: NestRPCService) {}

  async run() {
    return await this.rpc.execute(UserRouter, 'me', /* NestRpcExecutionContext */ {} as any);
  }
}
```

### API Overview
- `NestRPCModule.forRoot(options: { global?: boolean; apiPrefix?: string; routes: NestRpcRouterConfig })`
- `@Router(options?)` — mark a class as an RPC router
- `@Route()` — mark a method as routable
- `createRouterParamDecorator(factory)` — build parameter decorators that access the execution context
- `NestRpcExecutionContext` — execution context wrapper used internally and in param decorators

### Transport
A dynamic `@Controller(apiPrefix)` is generated with a POST handler that accepts batched calls and dispatches them to router methods. Errors are normalized to a consistent shape for the client.

### License
MIT