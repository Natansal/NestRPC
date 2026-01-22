# NestRPC Server Example

This is a NestJS example application demonstrating how to use the NestRPC server library to create type-safe RPC endpoints.

## Features Demonstrated

- **Router Organization**: Separate routers for queries and mutations
- **File Upload Support**: Single and multiple file upload handling
- **Type-Safe Routes**: Decorator-based route definition with automatic type inference
- **Manifest Configuration**: Centralized router manifest for type generation

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

The server will be available at `http://localhost:3000`

## Project Structure

```
src/
├── main.ts                 # Application bootstrap
├── app.module.ts          # Root module
├── nest-rpc.config.ts     # Router manifest definition
├── user/
│   ├── user.module.ts
│   ├── user.queries.router.ts    # Read operations
│   ├── user.mutations.router.ts  # Write operations
│   └── user.store.ts             # In-memory data store
└── files/
    ├── files.module.ts
    └── files.router.ts           # File upload operations
```

## Key Concepts

### Router Definition

Routers are classes decorated with `@Router()`:

```typescript
@Router()
export class UserQueriesRouter {
  @Route()
  getUser({ id }: { id: string }) {
    return fetchUser(id);
  }
}
```

### File Uploads

Use the `file` option in `@Route()` to handle file uploads:

```typescript
// Single file
@Route({ file: 'single' })
uploadFile(params: { description?: string }, file?: Express.Multer.File) {
  // Handle file
}

// Multiple files
@Route({ file: 'multiple' })
uploadFiles(params: { category?: string }, files?: Express.Multer.File[]) {
  // Handle files
}
```

### Manifest Configuration

The manifest defines the router structure for type generation:

```typescript
export const manifest = defineManifest({
  user: {
    queries: UserQueriesRouter,
    mutations: UserMutationsRouter,
  },
  files: FilesRouter,
});
```

## API Endpoints

All routes are automatically exposed under `/nestjs-rpc/` prefix:

- `POST /nestjs-rpc/user/queries/listUsers` - List all users
- `POST /nestjs-rpc/user/queries/getUser` - Get user by ID
- `POST /nestjs-rpc/user/mutations/createUser` - Create a user
- `POST /nestjs-rpc/user/mutations/updateUser` - Update a user
- `POST /nestjs-rpc/user/mutations/deleteUser` - Delete a user
- `POST /nestjs-rpc/files/uploadFile` - Upload single file
- `POST /nestjs-rpc/files/uploadFiles` - Upload multiple files
- `POST /nestjs-rpc/files/listFiles` - List all files
- `POST /nestjs-rpc/files/getFile` - Get file by ID
- `POST /nestjs-rpc/files/deleteFile` - Delete a file
- `POST /nestjs-rpc/files/clearAllFiles` - Clear all files

## Type Safety

The manifest type is exported and used by the client for full type safety:

```typescript
export type Manifest = typeof manifest;
```
