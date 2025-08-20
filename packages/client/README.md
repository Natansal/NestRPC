## NestRPC Client

Type-safe, ergonomic RPC client for NestRPC servers. Focus on your app logic—this client handles batching, transport, and great DX.

### ✨ Features
- **Type-safe calls** inferred directly from your server router
- **Smart batching** with debounce and max-size controls
- **Tiny API surface**, zero boilerplate
- **Fetch-compatible** with full control via `fetchOptions`

### Installation
This package is part of the monorepo. Build locally:

```bash
pnpm -w build
```

### Quick Start
```ts
import { createRpcClient } from "@repo/client";

// The generic type argument is inferred from your server router type
const client = createRpcClient<typeof appRouter>({
  baseUrl: "http://localhost:3000",
});

const user = await client.users.get({ id: "123" });
```

### Configuration
```ts
import { createRpcClient } from "@repo/client";

const client = createRpcClient<typeof appRouter>({
  baseUrl: "https://api.example.com",
  apiPrefix: "/nestjs-rpc", // default
  fetchOptions: {
    headers: { Authorization: "Bearer token" },
    // any standard fetch options
  },
  batch: {
    enabled: true,      // default
    maxBatchSize: 20,   // default
    debounceMs: 50,     // default
    maxUrlSize: 2048,   // default
  },
});
```

### API Overview
- `createRpcClient<T>(config: RpcClientConfig): T` — create a type-safe client proxy.
- `RpcClientConfig` — configuration object with sensible defaults.

### Error Handling
Errors are normalized as `RpcError` instances with semantic fields:
```ts
try {
  await client.users.get({ id: "missing" });
} catch (e) {
  if (e instanceof RpcError) {
    console.error(e.code, e.name, e.message);
  }
}
```

### Batching Behavior
Multiple calls executed within the debounce window are grouped into a single HTTP request, minimizing network overhead. You can disable batching by setting `batch: false`.

### Examples
```ts
// Nested routes
await client.users.posts.list({ userId: "u1" });

// Custom fetch options per environment
const client = createRpcClient<typeof appRouter>({
  baseUrl: import.meta.env.VITE_API_URL,
  fetchOptions: { credentials: "include" },
});
```

### License
MIT
