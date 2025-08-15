# NestRPC Server

Decorator-driven RPC utilities for NestJS.

### Install

This package is part of the monorepo and intended for internal use here. It targets NestJS v11 and relies on `reflect-metadata`.

```bash
pnpm -w build
```

Ensure `reflect-metadata` is loaded once in your Nest app entrypoint.

### Usage

Register the module:

```ts
import { Module } from '@nestjs/common';
import { NestRPCModule } from 'server';
import { UserRouter } from './user.router';

@Module({
  imports: [
    NestRPCModule.forRoot({
      global: true,
      routers: [UserRouter],
      apiPrefix: '/nestjs-rpc',
    }),
  ],
})
export class AppModule {}
```

Create a router with method and param decorators:

```ts
import { Router, Query, Mutation, createRouterParamDecorator } from 'server';
import type { NestRpcExecutionContext } from 'server';

const ByKey = createRouterParamDecorator<[string]>(([key], ctx) => (ctx as any)[key]);

@Router('user')
export class UserRouter {
  @Query()
  me(@ByKey('user') user: { id: string }) {
    return user;
  }

  @Mutation()
  updateName(@ByKey('db') db: any, name: string) {
    return db.updateName(name);
  }
}
```

Execute programmatically via the service:

```ts
import { Injectable } from '@nestjs/common';
import { NestRPCService } from 'server';

@Injectable()
export class Runner {
  constructor(private readonly rpc: NestRPCService) {}

  async run() {
    const context = { user: { id: 'u1' }, db: { updateName: (n: string) => ({ ok: true, n }) } } as any;
    return await this.rpc.execute(new UserRouter(), 'me', context);
  }
}
```

### API

- `NestRPCModule.forRoot(options)`
  - **options.routers**: array of router classes
  - **options.apiPrefix**: base path for the dynamic controller (default `/nestjs-rpc`)
  - **options.global**: register providers globally

- `NestRPCService.execute(controllerInstance, methodName, context, providedArgs?)`
  - Executes a method with arguments built from param resolvers and any provided positional arguments.

- Decorators
  - `Router(path: string, options?)`: marks a class as an RPC router and stores its base route
  - `Query()`, `Mutation()`: tag methods for type/intent
  - `createRouterParamDecorator(factory)`: build custom parameter decorators that can read the execution context and decoration-time inputs

- Types
  - `NestRpcExecutionContext`: extends Nest `ExecutionContext` used by param resolvers

### Notes

- An internal dynamic controller is created at `apiPrefix` with wildcard GET/POST handlers. These are currently a scaffold for future HTTP transport integration and may change.

### License

MIT