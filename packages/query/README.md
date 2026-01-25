<div align="center">

# @nestjs-rpc/query

**Type-safe React Query hooks for NestRPC. Seamlessly integrate your RPC endpoints with TanStack Query for powerful caching, synchronization, and state management.**

[![npm version](https://img.shields.io/npm/v/@nestjs-rpc/query.svg)](https://www.npmjs.com/package/@nestjs-rpc/query)
[![npm downloads](https://img.shields.io/npm/dm/@nestjs-rpc/query.svg)](https://www.npmjs.com/package/@nestjs-rpc/query)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

[Installation](#-installation) • [Quick Start](#-quick-start) • [Examples](https://github.com/Natansal/NestRPC/tree/main/example)

</div>

---

<div align="center">

### 📖 **[📚 Full Documentation →](https://natansal.github.io/NestRPC-docs/)** 📖

_Complete guides, API reference, and advanced examples_

</div>

---

## 🎯 Why @nestjs-rpc/query?

**Stop managing API state manually.** This package gives you:

- 🔒 **End-to-End Type Safety** - Full TypeScript inference from RPC methods to React hooks
- ⚡ **Automatic Caching** - Built on TanStack Query with intelligent cache management
- 🔄 **Auto Invalidation** - Automatically invalidate related queries after mutations
- 🎯 **Zero Boilerplate** - No manual query key management or cache invalidation logic
- 🧩 **Factory Pattern** - Create reusable hooks with default options
- 📤 **File Upload Support** - Works seamlessly with RPC file uploads

### The Traditional Way (Without @nestjs-rpc/query)

```typescript
// ❌ Manual React Query setup with no type safety
const { data } = useQuery({
  queryKey: ["user", userId],
  queryFn: async () => {
    const res = await fetch(`/api/user/${userId}`);
    return res.json(); // 😱 No types!
  },
});

// ❌ Manual cache invalidation
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries(["users"]); // 😱 Easy to forget!
  },
});
```

### The NestRPC Query Way

```typescript
// ✅ Type-safe, automatic query key generation
const { data } = useRpcQuery(rpc.user.getUserById, { id: "123" });
//    ^? { id: string; name: string; email: string }
// Full autocomplete and type checking! 🎉

// ✅ Automatic cache invalidation
const mutation = useRpcMutation(rpc.user.createUser, {
  invalidate: [rpc.user.listUsers], // Auto-invalidates after success!
});

// ✅ Type-safe mutation calls with body wrapper
mutation.mutate({ body: { name: "John", email: "john@example.com" } });
```

## 📦 Installation

```bash
npm install @nestjs-rpc/query @nestjs-rpc/client @tanstack/react-query react
# or
pnpm add @nestjs-rpc/query @nestjs-rpc/client @tanstack/react-query react
# or
yarn add @nestjs-rpc/query @nestjs-rpc/client @tanstack/react-query react
```

**Peer Dependencies:**

- `@nestjs-rpc/client` - The RPC client library
- `react` - React 18.0.0 or higher
- `@tanstack/react-query` - React Query 5.0.0 or higher

## 🚀 Quick Start

### 1. Setup QueryClientProvider

Wrap your app with `QueryClientProvider`:

```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from './path-to-your-manifest';

// Create your RPC client
const rpcClient = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
});

// Create React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
    </QueryClientProvider>
  );
}
```

### 2. Use RPC Queries

```typescript
import { useRpcQuery } from '@nestjs-rpc/query';
import { rpc } from './rpc-client';

function UserList() {
  const { data, isLoading, error } = useRpcQuery(
    rpc.user.listUsers,
    undefined, // body (optional for methods with no body)
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 3. Use RPC Mutations

```typescript
import { useRpcMutation } from '@nestjs-rpc/query';
import { rpc } from './rpc-client';

function CreateUser() {
  const mutation = useRpcMutation(rpc.user.createUser, {
    invalidate: [rpc.user.listUsers], // Auto-invalidate after success
    onSuccess: (data) => {
      console.log('User created:', data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

**That's it!** You get:

- ✅ Full TypeScript autocomplete
- ✅ Automatic query key generation
- ✅ Intelligent caching
- ✅ Automatic cache invalidation

---

## 📚 Core API

### `useRpcQuery`

Direct hook for one-off RPC queries. Automatically handles query key generation, caching, and type inference.

```typescript
function useRpcQuery<TBody, TRet, TData = TRet>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  body: TBody,
  options?: RpcQueryOptions<UseQueryOptions<TRet, AxiosError, TData, QueryKey>>,
  queryClient?: QueryClient,
): UseQueryResult<TData, AxiosError>;
```

**Example:**

```typescript
// With required body
const { data } = useRpcQuery(
  rpc.user.getUserById,
  { id: "123" },
  {
    staleTime: 5000,
    enabled: !!userId,
  },
);

// With optional body (method accepts void/never/undefined)
const { data } = useRpcQuery(rpc.user.listUsers, undefined, {
  refetchInterval: 30000,
});
```

### `createRpcQuery`

Factory function to create reusable query hooks with default options. Perfect for creating domain-specific hooks.

```typescript
function createRpcQuery<TBody, TRet, TData = TRet>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  defaultOptions?: RpcQueryOptions<UseQueryOptions<TRet, AxiosError, TData>>,
): RpcQueryHook<TBody, TRet, TData>;
```

**Example:**

```typescript
// Create a reusable hook with defaults
const useUserList = createRpcQuery(rpc.user.listUsers, {
  staleTime: 60000,
  refetchOnWindowFocus: false,
});

// Use it in components
function UserList() {
  const { data } = useUserList(undefined);
  // ...
}

// Override options per usage
function AnotherComponent() {
  const { data } = useUserList(undefined, {
    refetchInterval: 10000, // Override default
  });
}
```

### `useRpcMutation`

Direct hook for one-off RPC mutations. Supports automatic cache invalidation.

```typescript
function useRpcMutation<TBody, TRet, TOnMutateResult = unknown>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  options?: RpcMutationOptions<TBody, TRet, TOnMutateResult>,
): UseMutationResult<TRet, AxiosError, RpcMutationBody<TBody>, TOnMutateResult>;
```

**Example:**

```typescript
const mutation = useRpcMutation(rpc.user.createUser, {
  invalidate: [rpc.user.listUsers],
  onSuccess: (data) => {
    toast.success("User created!");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// Pass body directly in mutation variables
mutation.mutate({ body: { name: "John", email: "john@example.com" } });
```

### `createRpcMutation`

Factory function to create reusable mutation hooks with default options.

```typescript
function createRpcMutation<TBody, TRet, TOnMutateResult = unknown>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  defaultOptions?: RpcMutationOptions<TBody, TRet, TOnMutateResult>,
): (
  options?: RpcMutationOptions<TBody, TRet, TOnMutateResultOverride>,
) => UseMutationResult<
  TRet,
  AxiosError,
  RpcMutationBody<TBody>,
  TOnMutateResultOverride
>;
```

**Example:**

```typescript
// Create reusable mutation hook
const useCreateUser = createRpcMutation(rpc.user.createUser, {
  invalidate: [rpc.user.listUsers],
  onSuccess: () => {
    console.log('User created successfully');
  },
});

// Use in components
function CreateUserForm() {
  const createUser = useCreateUser({
    onSuccess: (data) => {
      // Additional per-component logic
      navigate(`/users/${data.id}`);
    },
  });

  return (
    <button onClick={() => createUser.mutate({ body: { name: 'John', email: 'john@example.com' } })}>
      Create
    </button>
  );
}
```

### `useInvalidateRpcQuery`

Hook that returns a function to invalidate queries by RPC route. Useful for manual cache invalidation.

```typescript
function useInvalidateRpcQuery(): (
  rpcRoute: { [PathSymbol]: string[] },
  filters?: Omit<InvalidateQueryFilters<QueryKey>, "queryKey">,
  options?: InvalidateOptions,
) => Promise<void>;
```

**Example:**

```typescript
function UserActions() {
  const invalidate = useInvalidateRpcQuery();

  const handleRefresh = () => {
    invalidate(rpc.user.listUsers);
  };

  return <button onClick={handleRefresh}>Refresh Users</button>;
}
```

---

## 🎨 Advanced Features

### Additional Query Keys

Extend query keys for more granular cache control. Useful when you need to differentiate queries with the same body but different contexts.

```typescript
// Using array
const { data } = useRpcQuery(
  rpc.user.getUserById,
  { id: "123" },
  {
    useAdditionalQueryKey: ["admin-view"], // Adds to query key
  },
);

// Using function (allows using hooks inside)
const { data } = useRpcQuery(
  rpc.user.getUserById,
  { id: "123" },
  {
    useAdditionalQueryKey: () => {
      const { userRole } = useAuth(); // Can use hooks!
      return [userRole];
    },
  },
);

// In factory defaults
const useUserById = createRpcQuery(rpc.user.getUserById, {
  useAdditionalQueryKey: ["default"],
});

// Instance-level keys are merged with factory defaults
const { data } = useUserById(
  { id: "123" },
  {
    useAdditionalQueryKey: ["instance"], // Final key: ['default', 'instance']
  },
);
```

### File Uploads & RPC Options

Pass files and RPC options directly in the mutation variables:

```typescript
// Single file upload
const mutation = useRpcMutation(rpc.files.uploadFile, {
  onSuccess: () => console.log("Uploaded!"),
});

mutation.mutate({
  body: { description: "My file" },
  file: fileInput.files[0],
});

// Multiple files
mutation.mutate({
  body: { category: "documents" },
  files: Array.from(fileInput.files),
});

// With custom RPC options (headers, axios instance, etc)
mutation.mutate({
  body: { description: "My file" },
  file: fileInput.files[0],
  rpcOptions: {
    requestOptions: {
      headers: { "X-Custom-Header": "value" },
    },
  },
});

// Static RPC options (applied to all mutations from this hook)
const useUploadFile = createRpcMutation(rpc.files.uploadFile, {
  invalidate: [rpc.files.listFiles],
  rpcOptions: {
    requestOptions: { timeout: 30000 },
  },
});

// Dynamic options override static ones
const uploadFile = useUploadFile();
uploadFile.mutate({
  body: { description: "My file" },
  file: fileInput.files[0],
  rpcOptions: {
    requestOptions: { timeout: 60000 }, // Overrides the 30000 from hook
  },
});
```

### Automatic Cache Invalidation

Mutations can automatically invalidate related queries:

```typescript
const useCreateUser = createRpcMutation(rpc.user.createUser, {
  invalidate: [
    rpc.user.listUsers, // Invalidate list
    rpc.user.getUserById, // Invalidate detail queries
  ],
});

// After successful mutation, all queries for these routes are invalidated
```

### Custom Query Client

Pass a custom `QueryClient` instance for isolated query management:

```typescript
const customQueryClient = new QueryClient();

const { data } = useRpcQuery(
  rpc.user.listUsers,
  undefined,
  {},
  customQueryClient, // Use specific client
);
```

---

## 💡 Complete Example

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RpcClient } from '@nestjs-rpc/client';
import {
  createRpcQuery,
  createRpcMutation,
  useInvalidateRpcQuery,
} from '@nestjs-rpc/query';
import type { Manifest } from './nest-rpc.config';

// Setup
const rpcClient = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
});
const rpc = rpcClient.routers();
const queryClient = new QueryClient();

// Create reusable hooks
const useUserList = createRpcQuery(rpc.user.listUsers, {
  staleTime: 60000,
});

const useCreateUser = createRpcMutation(rpc.user.createUser, {
  invalidate: [rpc.user.listUsers],
});

// Component
function UserManagement() {
  const { data: users, isLoading } = useUserList(undefined);
  const createUser = useCreateUser({
    onSuccess: () => {
      toast.success('User created!');
    },
  });
  const invalidate = useInvalidateRpcQuery();

  const handleCreate = () => {
    createUser.mutate({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    });
  };

  const handleRefresh = () => {
    invalidate(rpc.user.listUsers);
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={createUser.isPending}>
        Create User
      </button>
      <button onClick={handleRefresh}>Refresh</button>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// App
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserManagement />
    </QueryClientProvider>
  );
}
```

---

## 🔒 Type Safety

The hooks automatically infer types from your RPC manifest:

```typescript
// Server method signature:
@Route()
async getUserById(id: string): Promise<User> {
  return { id, name: 'John', email: 'john@example.com' };
}

// Client automatically gets:
const { data } = useRpcQuery(rpc.user.getUserById, { id: '123' });
//    ^? { data: User }
//    ^? body parameter is typed as { id: string }
//    ^? Full autocomplete for User properties
```

**If your server types change, your client code will show TypeScript errors immediately!**

---

## 🎯 Best Practices

1. **Use factory pattern** - Create reusable hooks with `createRpcQuery` and `createRpcMutation`
2. **Auto-invalidate** - Use `invalidate` option in mutations to keep cache fresh
3. **Centralize RPC client** - Create one RPC client instance and export it
4. **Handle errors** - Use `onError` callbacks or error boundaries
5. **Use additional keys** - Extend query keys when you need context-specific caching

---

## 📖 API Reference

### Query Options

All standard React Query options are supported, except:

- `queryKey` - Automatically generated
- `queryFn` - Automatically generated
- `meta` - Automatically generated

### Mutation Options

All standard React Query mutation options are supported, plus:

- `invalidate?: { [PathSymbol]: string[] }[]` - Routes to invalidate after success
- `rpcOptions?: Omit<RpcMethodOptions, "file" | "files">` - Static RPC options applied to all mutations (can be overridden per call)

### Mutation Variables

Mutations accept `RpcMutationBody<TBody>` which includes:

- `body: TBody` - The request body (required if TBody is required, optional otherwise)
- `file?: File` - Single file to upload
- `files?: File[]` - Multiple files to upload
- `rpcOptions?: Omit<RpcMethodOptions, "file" | "files">` - Per-call RPC options (overrides static options)

### Query Key Structure

Query keys are automatically generated as:

```typescript
[...path, body, rpcOptions, ...additionalKeys];
```

This ensures proper cache differentiation based on all parameters.

---

## 💡 Examples

Check out the [example directory](https://github.com/Natansal/NestRPC/tree/main/example) for a complete working example with React.

---

## 📚 Need More Help?

<div align="center">

### **[📖 Full Documentation →](https://natansal.github.io/NestRPC-docs/)**

_Complete guides, API reference, advanced patterns, and troubleshooting_

</div>

---

## 🔗 Related

- [`@nestjs-rpc/client`](../client/README.md) - The RPC client library
- [`@nestjs-rpc/server`](../server/README.md) - The server-side library
- [TanStack Query Docs](https://tanstack.com/query/latest) - React Query documentation

---

## 🤝 Contributing

Contributions welcome! See the main [README](../../README.md) for details.

## 📄 License

MIT

---

<div align="center">

**Made with ❤️ for the NestJS community**

[⭐ Star us on GitHub](https://github.com/natansal/NestRPC) • [📖 Documentation](https://natansal.github.io/NestRPC-docs/) • [💬 Discussions](https://github.com/natansal/NestRPC/discussions)

</div>
