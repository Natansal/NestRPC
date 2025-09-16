Type-safe RPC for NestJS — call Nest methods like local functions with zero boilerplate.

## @nestjs-rpc/server

### Installation

```bash
npm install @nestjs-rpc/server
# or
pnpm add @nestjs-rpc/server
# or
yarn add @nestjs-rpc/server
```

### Go to the docs

For full docs and guides, see [NestJS RPC Docs](https://natansal.github.io/NestRPC-docs/).

### Getting started (Server)

1. Define your routers and methods using the provided decorators.

```ts
import { Router, Route, defineManifest, nestRpcInit } from "@nestjs-rpc/server";

@Router()
class UserRouter {
   @Route()
   async getUserById(id: string) {
      return { id, name: "Ada" };
   }
}

export const manifest = defineManifest({ user: UserRouter });

// 🔁 Export the manifest type so clients can import it for full type-safety
export type Manifest = typeof manifest;
```

2. Initialize RPC BEFORE creating the Nest application.

IMPORTANT: `nestRpcInit(manifest)` MUST be called BEFORE `NestFactory.create(...)`. The RPC init applies decorators
(`@Controller`, `@Post`, `@Body`) that Nest needs to see at bootstrap time to register routes.

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { nestRpcInit } from "@nestjs-rpc/server";
import { manifest } from "./manifest";

async function bootstrap() {
   // ✅ Call this first
   nestRpcInit(manifest, { apiPrefix: "nestjs-rpc" /* default */ });

   // Then create the Nest app
   const app = await NestFactory.create(AppModule);
   await app.listen(3000);
}

bootstrap();
```

3. Folder structure example

```text
src/
  app.module.ts
  main.ts
  routers/
    user.router.ts
  manifest.ts
```

4. Router/method reference

- `@Router()` on classes marks them as RPC routers and applies `@Controller()`.
- `@Route()` on methods exposes them as RPC endpoints.
- `nestRpcInit(manifest, { apiPrefix })` registers routes under `/apiPrefix/...` (default `nestjs-rpc`).
