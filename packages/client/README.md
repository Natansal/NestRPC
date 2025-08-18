# NestRPC Client Package

This package provides a type-safe RPC client for communicating with NestRPC servers.

## Architecture

The package has been split into modular components for better maintainability and readability:

### Core Modules

- **`types.ts`** - Type definitions and interfaces
- **`utils.ts`** - Utility functions for URL normalization and response handling
- **`http-client.ts`** - HTTP request execution and RPC call creation
- **`proxy.ts`** - Proxy object creation for method chaining
- **`create-rpc-client.ts`** - Main client creation functions

### Main Exports

```typescript
import {
  createRpcClient,
  createTypedRpcClient,
  type RpcClientConfig,
} from "@repo/client";
```

## Usage

### Basic Client Creation

```typescript
import { createRpcClient } from "@repo/client";

const client = createRpcClient<typeof serverRouter>({
  baseUrl: "http://localhost:3000",
  apiPrefix: "/api/rpc",
});

// Use the client
const user = await client.users.getUser({ id: 123 });
```

### Advanced Configuration

```typescript
const client = createRpcClient<typeof serverRouter>({
  baseUrl: "https://api.example.com",
  apiPrefix: "/rpc",
  fetchOptions: {
    headers: { Authorization: "Bearer token" },
    timeout: 5000,
  },
});
```

## Module Breakdown

### Types (`types.ts`)

- `RpcClientConfig` - Configuration interface for the RPC client
- `HttpResponseResult` - HTTP response handling result

### Utilities (`utils.ts`)

- `normalizeBaseUrl()` - Removes trailing slashes from base URLs
- `handleHttpResponse()` - Processes HTTP responses and parses data
- `createEndpointUrl()` - Constructs endpoint URLs for RPC calls

### HTTP Client (`http-client.ts`)

- `executeRpcCall()` - Executes individual RPC HTTP requests
- `createRpcCall()` - Creates configured RPC call functions

### Proxy (`proxy.ts`)

- `createClientProxy()` - Creates the proxy object for method chaining

### Main Client (`create-rpc-client.ts`)

- `createRpcClient()` - Main function to create RPC clients
- `createTypedRpcClient()` - Type-safe client creation alias

## Benefits of Modular Structure

1. **Separation of Concerns** - Each module has a single responsibility
2. **Testability** - Individual functions can be tested in isolation
3. **Maintainability** - Easier to locate and modify specific functionality
4. **Reusability** - Utility functions can be imported independently
5. **Readability** - Smaller files are easier to understand and navigate
