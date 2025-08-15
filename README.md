## NestRPC

Type-safe, decorator-driven RPC utilities for NestJS. Define lightweight "routers" with `@Router`, mark methods as `@Query`/`@Mutation`, and inject custom parameters via `createRouterParamDecorator`. A small runtime compiles argument builders from metadata and executes methods with your context.

### Packages

- `packages/server`: NestJS integration (module, service, decorators, runtime)
- `packages/client`: Client helpers (WIP)
- `packages/shared`: Shared types

### Quickstart

Prereqs: Node 18+, pnpm.

```bash
pnpm i
pnpm build
```

Add to a Nest application (inside this monorepo):

```ts
// app.module.ts
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

Define a router and use decorators:

```ts
// user.router.ts
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

Programmatic execution (e.g., from a Nest controller/provider):

```ts
import { Injectable } from '@nestjs/common';
import { NestRPCService } from 'server';
import { UserRouter } from './user.router';

@Injectable()
export class UserExecutor {
  constructor(private readonly rpc: NestRPCService) {}

  async run() {
    const context = { user: { id: 'u1' }, db: { updateName: (n: string) => ({ ok: true, n }) } } as any;
    return await this.rpc.execute(new UserRouter(), 'me', context);
  }
}
```

Note: `reflect-metadata` must be available at runtime. In Nest apps this is typically imported once in the entrypoint.

### Development

```bash
pnpm dev        # typecheck/watch packages that support it
pnpm build      # build all packages
pnpm lint       # lint (where configured)
```

### License

MIT
