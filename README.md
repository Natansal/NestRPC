<div align="center">

# 🚀 NestRPC

**Type-safe, end-to-end RPC for NestJS. Write server methods, call them from the client like local functions. Zero boilerplate. Full TypeScript inference. Powered by runtime magic using proxies.**

[![npm version](https://img.shields.io/npm/v/@nestjs-rpc/server.svg)](https://www.npmjs.com/package/@nestjs-rpc/server)
[![npm downloads](https://img.shields.io/npm/dm/@nestjs-rpc/server.svg)](https://www.npmjs.com/package/@nestjs-rpc/server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](https://natansal.github.io/NestRPC-docs/) • [Examples](https://github.com/Natansal/NestRPC/tree/main/example)

</div>

---

## ✨ Why NestRPC?

**Stop writing REST endpoints manually.** NestRPC gives you:

- 🎯 **Zero Boilerplate** - No controllers, DTOs, or manual route definitions
- 🔒 **End-to-End Type Safety** - Full TypeScript inference from server to client
- 📤 **Built-in File Uploads** - Single and multiple file support out of the box
- 🧩 **Decorator-Driven** - Simple `@Router()` and `@Route()` decorators
- ⚡ **Zero Runtime Overhead** - Runtime magic using proxies, no code generation needed
- 🔄 **Automatic Route Registration** - Routes work via TypeScript decorators and runtime magic using proxies
- 🎨 **Framework Agnostic Client** - Works with React, Vue, Angular, or vanilla JS

### The Problem It Solves

Traditional REST APIs require you to:
- Write controllers, DTOs, and validation manually
- Maintain separate types for client and server
- Manually map routes to methods
- Handle file uploads with custom middleware
- Write client-side API wrappers

**NestRPC eliminates all of this.** Write your server methods, and they're automatically available as type-safe client functions.

## 🎯 Features

### Server-Side
- ✅ **Decorator-based routing** - `@Router()` and `@Route()` decorators
- ✅ **File upload support** - Single and multiple file uploads with `@Route({ file: 'single' })`
- ✅ **Automatic route registration** - Routes work via TypeScript decorators and runtime magic using proxies
- ✅ **NestJS integration** - Works seamlessly with NestJS modules and dependency injection
- ✅ **Custom parameter decorators** - Create your own decorators for context injection

### Client-Side
- ✅ **Full type inference** - Import your server's manifest type for complete type safety
- ✅ **Proxy-based API** - Call methods like `rpc.user.getUserById('123')`
- ✅ **File upload support** - Upload files with `{ file: file }` or `{ files: [file1, file2] }`
- ✅ **Axios integration** - Built on Axios with full customization support
- ✅ **Zero configuration** - Works out of the box with sensible defaults

## 📦 Packages

| Package | Description | npm |
|---------|-------------|-----|
| `@nestjs-rpc/server` | NestJS server integration with decorators and runtime magic using proxies | [![npm](https://img.shields.io/npm/v/@nestjs-rpc/server.svg)](https://www.npmjs.com/package/@nestjs-rpc/server) |
| `@nestjs-rpc/client` | Type-safe client for calling RPC methods from any frontend | [![npm](https://img.shields.io/npm/v/@nestjs-rpc/client.svg)](https://www.npmjs.com/package/@nestjs-rpc/client) |

## 🚀 Quick Start

### 1. Install

```bash
npm install @nestjs-rpc/server @nestjs-rpc/client axios
# or
pnpm add @nestjs-rpc/server @nestjs-rpc/client axios
```

### 2. Define Your Server Routes

```typescript
// server/src/user.router.ts
import { Router, Route } from '@nestjs-rpc/server';

@Router()
export class UserRouter {
  @Route()
  async getUserById(id: string) {
    return { id, name: 'John Doe', email: 'john@example.com' };
  }

  @Route()
  async createUser({ name, email }: { name: string; email: string }) {
    return { id: '123', name, email };
  }

  // File upload example
  @Route({ file: 'single' })
  async uploadAvatar(
    { userId }: { userId: string },
    file?: Express.Multer.File
  ) {
    return { userId, filename: file?.originalname, size: file?.size };
  }
}
```

### 3. Create Manifest

```typescript
// server/src/nest-rpc.config.ts
import { defineManifest } from '@nestjs-rpc/server';
import { UserRouter } from './user.router';

export const manifest = defineManifest({
  user: UserRouter,
});

// Export type for client
export type Manifest = typeof manifest;
```

### 4. Initialize in main.ts

```typescript
// server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { nestRpcInit } from '@nestjs-rpc/server';
import { AppModule } from './app.module';
import { manifest } from './nest-rpc.config';

async function bootstrap() {
  // ⚠️ IMPORTANT: Call this BEFORE NestFactory.create
  nestRpcInit(manifest);

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
```

### 5. Use in Client

```typescript
// client/src/rpc-client.ts
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from '../server/src/nest-rpc.config';

export const rpc = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
}).routers();

// Now use with full type safety!
const user = await rpc.user.getUserById('123');
//    ^? { data: { id: string; name: string; email: string } }

await rpc.user.createUser({ name: 'Jane', email: 'jane@example.com' });

// File upload
const fileInput = document.querySelector('input[type="file"]');
await rpc.user.uploadAvatar(
  { userId: '123' },
  { file: fileInput.files[0] }
);
```

## 📚 Documentation

For complete documentation, examples, and guides, visit:

**👉 [NestRPC Documentation](https://natansal.github.io/NestRPC-docs/)**

## 💡 Real-World Example

Check out the [example directory](https://github.com/Natansal/NestRPC/tree/main/example) for a complete working example with:
- User CRUD operations
- Single and multiple file uploads
- React frontend
- NestJS backend

```bash
# Run the example
cd example/server && pnpm dev
cd example/client && pnpm dev
```

## 🆚 Comparison

| Feature | NestRPC | Traditional REST | tRPC |
|---------|---------|------------------|------|
| Type Safety | ✅ End-to-end | ❌ Manual types | ✅ End-to-end |
| File Uploads | ✅ Built-in | ⚠️ Custom setup | ❌ Not supported |
| Boilerplate | ✅ Zero | ❌ High | ✅ Low |
| NestJS Integration | ✅ Native | ✅ Native | ⚠️ Limited |
| Framework Agnostic Client | ✅ Yes | ✅ Yes | ⚠️ React-focused |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [NestRPC Contributors](LICENSE)

---

<div align="center">

**Made with ❤️ for the NestJS community**

[⭐ Star us on GitHub](https://github.com/natansal/NestRPC) • [📖 Documentation](https://natansal.github.io/NestRPC-docs/) • [🐛 Report Bug](https://github.com/natansal/NestRPC/issues)

</div>
