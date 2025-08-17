# NestRPC Client

A powerful client proxy for NestRPC that makes remote method calls feel like local method calls.

## What is a Client Proxy?

A client proxy is a design pattern that allows you to call remote methods as if they were local. In the context of NestRPC:

- **Server Side**: Exposes methods using `@Router()` and `@Route()` decorators
- **Client Side**: Uses a proxy to intercept method calls and convert them to HTTP requests
- **Result**: Seamless remote method execution with local-like syntax

## Features

- ✨ **Type Safety**: Full TypeScript support with inferred types from your server
- 🔗 **Nested Router Support**: Handles complex nested router structures automatically
- 🚀 **Async/Await**: All methods return promises for modern async patterns
- 🛡️ **Error Handling**: Comprehensive error handling with meaningful messages
- ⚙️ **Configurable**: Customizable base URL, API prefix, and fetch options

## How the Proxy Works

The client proxy uses JavaScript's `Proxy` object to intercept property access and method calls:

1. **Property Access** (e.g., `client.app`): Returns another proxy object
2. **Method Calls** (e.g., `client.app.test()`): Makes HTTP requests to the server
3. **Nested Structures**: Automatically handles any depth of nesting

### Example Server Structure

```typescript
// Server side
@Router()
export class AppRouter {
  @Route()
  test(id: string) {
    return `This is the id: ${id}`;
  }
}

// Server configuration
export const config = defineAppRouter({
  app: AppRouter, // This creates the /api/app/test endpoint
});
```

### Client Usage

```typescript
import { createRpcClient } from "@repo/client";

const client = createRpcClient({
  baseUrl: "http://localhost:3000",
  apiPrefix: "/api",
});

// This works because:
// 1. client.app returns a proxy object
// 2. client.app.test returns a function
// 3. client.app.test('hello') makes an HTTP POST to /api/app/test
const result = await client.app.test("hello");
console.log(result); // "This is the id: hello"
```

## Quick Start

### 1. Install the Package

```bash
npm install @repo/client
# or
yarn add @repo/client
# or
pnpm add @repo/client
```

### 2. Create the Client

```typescript
import { createRpcClient } from "@repo/client";

const client = createRpcClient({
  baseUrl: "http://localhost:3000",
  apiPrefix: "/api", // optional, defaults to '/api'
});
```

### 3. Call Remote Methods

```typescript
// Simple method call
const result = await client.appRouter.test("hello");

// With body parameter
const result = await client.appRouter.createUser({
  name: "John",
  email: "john@example.com",
});
```

## Advanced Usage

### Nested Router Structures

Your server can have nested routers:

```typescript
// Server side
@Router()
export class UserRouter {
  @Route()
  async create(user: CreateUserDto) {
    return { id: 1, ...user };
  }
}

@Router()
export class AppRouter {
  users = UserRouter;
  // ... other routers
}
```

Client usage:

```typescript
// Client automatically handles nested structure
const user = await client.appRouter.users.create({
  name: "John",
  email: "john@example.com",
});
```

### Custom Fetch Options

```typescript
const client = createRpcClient({
  baseUrl: "http://localhost:3000",
  fetchOptions: {
    headers: {
      Authorization: "Bearer your-token",
      "X-Custom-Header": "custom-value",
    },
    // Any other fetch options
    mode: "cors",
    credentials: "include",
  },
});
```

### Error Handling

```typescript
try {
  const result = await client.appRouter.users.create(userData);
} catch (error) {
  if (error.message.includes("HTTP 404")) {
    console.log("Method not found");
  } else if (error.message.includes("HTTP 500")) {
    console.log("Server error");
  } else {
    console.log("Network or other error:", error.message);
  }
}
```

## How It Works

1. **Proxy Creation**: Creates a JavaScript Proxy object that intercepts all property access
2. **Property Interception**: When you access `client.app`, it returns another proxy
3. **Method Interception**: When you call `client.app.test()`, it makes an HTTP request
4. **HTTP Request**: Converts the method call to a POST request to `/api/app/test`
5. **Response Handling**: Parses the response and returns the result
6. **Error Handling**: Provides meaningful error messages for debugging

### Request Flow

```
client.app.test('hello')
    ↓
client.app returns a proxy object
    ↓
client.app.test returns a function
    ↓
Function is called with 'hello'
    ↓
Proxy intercepts and builds URL: POST /api/app/test
    ↓
Sends HTTP request with 'hello' as JSON body
    ↓
Receives response and returns parsed result
```

## Type Safety

The client automatically infers types from your server configuration:

```typescript
// Server types are automatically inferred
const client: InferNestRpcRouterApp<typeof AppRouter> = createRpcClient({
  baseUrl: "http://localhost:3000",
});

// TypeScript knows the exact method signatures
client.appRouter.users.create({ name: "John" }); // ✅ Type safe
client.appRouter.users.create("invalid"); // ❌ Type error
```

## Real-World Example

Here's a complete example showing how to use the client in a real application:

```typescript
import { createRpcClient } from "@repo/client";

// Define your router types (or import from server)
type AppRouter = {
  users: {
    create: (user: CreateUserDto) => Promise<User>;
    getById: (id: number) => Promise<User>;
    update: (id: number, user: UpdateUserDto) => Promise<User>;
    delete: (id: number) => Promise<void>;
  };
  posts: {
    create: (post: CreatePostDto) => Promise<Post>;
    list: (filters?: PostFilters) => Promise<Post[]>;
  };
};

// Create the client
const client = createRpcClient<AppRouter>({
  baseUrl: process.env.API_BASE_URL || "http://localhost:3000",
  apiPrefix: "/api",
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  },
});

// Use it in your application
class UserService {
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      return await client.users.create(userData);
    } catch (error) {
      console.error("Failed to create user:", error);
      throw new Error("User creation failed");
    }
  }

  async getUserProfile(userId: number): Promise<User> {
    try {
      return await client.users.getById(userId);
    } catch (error) {
      console.error(`Failed to get user ${userId}:`, error);
      throw new Error("Failed to fetch user profile");
    }
  }
}

// Usage
const userService = new UserService();
const newUser = await userService.createUser({
  name: "Jane Doe",
  email: "jane@example.com",
});
```

## Best Practices

1. **Error Handling**: Always wrap RPC calls in try-catch blocks
2. **Type Safety**: Use the inferred types for better development experience
3. **Configuration**: Store base URLs in environment variables
4. **Testing**: Mock the client proxy in your tests for faster execution
5. **Error Boundaries**: Implement error boundaries in React apps for RPC errors
6. **Retry Logic**: Consider implementing retry logic for network failures

## Testing

The client proxy is easy to test because you can mock it:

```typescript
// In your tests
const mockClient = {
  app: {
    test: jest.fn().mockResolvedValue("This is the id: hello"),
  },
};

// Mock the createRpcClient function
jest.mock("@repo/client", () => ({
  createRpcClient: () => mockClient,
}));
```

## API Reference

### `createRpcClient<T>(config: RpcClientConfig): T`

Creates an RPC client proxy.

**Parameters:**

- `config.baseUrl`: Server base URL (required)
- `config.apiPrefix`: API prefix path (optional, default: '/api')
- `config.fetchOptions`: Custom fetch options (optional)

**Returns:** A proxy object that mimics your server's router structure

### `createTypedRpcClient<T>(config: RpcClientConfig): T`

Alias for `createRpcClient` with explicit typing.

### `RpcClientConfig`

```typescript
interface RpcClientConfig {
  baseUrl: string;
  apiPrefix?: string;
  fetchOptions?: RequestInit;
}
```

## Examples

Check out the `example/client` directory for complete working examples that demonstrate:

- Setting up the client
- Calling remote methods
- Handling nested routers
- Error handling
- Type safety
- React integration

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your server allows requests from your client origin
2. **Type Errors**: Ensure your router types match between client and server
3. **Network Errors**: Check that your server is running and accessible
4. **Method Not Found**: Verify that the method exists and is decorated with `@Route()`

### Debug Mode

Enable debug logging by setting the fetch options:

```typescript
const client = createRpcClient({
  baseUrl: "http://localhost:3000",
  fetchOptions: {
    // This will log all requests to the console
    keepalive: false,
  },
});
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.
