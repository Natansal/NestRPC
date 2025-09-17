Type-safe RPC for NestJS — call Nest methods like local functions with zero boilerplate.

## @nestjs-rpc/client

### Installation

```bash
npm install @nestjs-rpc/client axios
# or
pnpm add @nestjs-rpc/client axios
# or
yarn add @nestjs-rpc/client axios
```

Note: `axios` is a peer dependency used as the default HTTP client. You can supply your own Axios instance via `axiosInstance` if needed.

### Go to the docs

For full docs and guides, see [NestJS RPC Docs](https://natansal.github.io/NestRPC-docs/).

### Getting started (Client)

1. Create a client instance

```ts
import { RpcClient } from "@nestjs-rpc/client";
// Import the manifest type from your server package/app
// Example (monorepo): import type { Manifest } from './server/manifest';
// Example (cross-repo): import type { Manifest } from '@your-org/your-server-package';
import type { Manifest } from "your-server-package-or-app-path";

export const client = new RpcClient<Manifest>({
   baseUrl: "http://localhost:3000",
   apiPrefix: "nestjs-rpc", // default is 'nestjs-rpc'
});

export const rpc = client.routes();
```

2. Call routes with full type-safety

```ts
// Traverse routers and call methods with typed args and responses
const res = await rpc.user.getUserById("123");
console.log(res.data); // { id: '123', name: 'Ada' }
```

3. Override per-call options (optional)

```ts
const res = await rpc.user.getUserById("123", {
   requestOptions: {
      headers: { Authorization: "Bearer token" },
   },
});
```
