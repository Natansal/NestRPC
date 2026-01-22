# NestRPC Client Example

This is a React + TypeScript + Vite example application demonstrating how to use the NestRPC client library.

## Features Demonstrated

- **User CRUD Operations**: Create, read, update, and delete users using type-safe RPC calls
- **Single File Upload**: Upload individual files with optional descriptions
- **Multiple File Upload**: Upload multiple files at once with optional categorization
- **File Management**: List, view, and delete uploaded files

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Make sure the server is running (see `../server/README.md`)

3. Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

## Key Files

- `src/App.tsx` - Main application component showcasing all features
- `src/rpc-repo.ts` - RPC client configuration and router exports
- `src/App.css` - Styling for the demo UI

## Usage Example

```typescript
import { userRepo, filesRepo } from './rpc-repo';

// Query users
const { data: users } = await userRepo.queries.listUsers();

// Create a user
await userRepo.mutations.createUser({ name: 'John', email: 'john@example.com' });

// Upload a single file
await filesRepo.uploadFile(
  { description: 'My document' },
  { file: fileInput.files[0] }
);

// Upload multiple files
await filesRepo.uploadFiles(
  { category: 'documents' },
  { files: Array.from(fileInput.files) }
);
```

## Type Safety

All RPC calls are fully type-safe. The client automatically infers types from the server's manifest, providing autocomplete and compile-time type checking.
