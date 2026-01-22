<div align="center">

# @nestjs-rpc/server

**Type-safe RPC server for NestJS. Define routes with decorators, get automatic type inference and zero boilerplate.**

[![npm version](https://img.shields.io/npm/v/@nestjs-rpc/server.svg)](https://www.npmjs.com/package/@nestjs-rpc/server)
[![npm downloads](https://img.shields.io/npm/dm/@nestjs-rpc/server.svg)](https://www.npmjs.com/package/@nestjs-rpc/server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

[Installation](#-installation) • [Quick Start](#-quick-start) • [Examples](https://github.com/Natansal/NestRPC/tree/main/example)

</div>

---

<div align="center">

### 📖 **[📚 Full Documentation →](https://natansal.github.io/NestRPC-docs/)** 📖

*Complete guides, API reference, and advanced examples*

</div>

---

## 🎯 Why @nestjs-rpc/server?

**Stop writing REST controllers manually.** This package gives you:

- 🎯 **Zero Boilerplate** - No controllers, DTOs, or manual route definitions needed
- 🔒 **Type-Safe by Default** - Full TypeScript inference from your method signatures
- 📤 **Built-in File Uploads** - Single and multiple file support with one decorator
- ⚡ **Runtime Magic Using Proxies** - Routes work automatically via decorators and runtime proxy behavior - no code generation!
- 🧩 **NestJS Native** - Works seamlessly with NestJS modules and dependency injection
- 🚀 **Production Ready** - Battle-tested and optimized for performance

### The Traditional Way (Without NestRPC)

```typescript
// ❌ So much boilerplate!
@Controller('user')
export class UserController {
  @Post('getUserById')
  async getUserById(@Body() dto: GetUserByIdDto) {
    // Manual validation, error handling, etc.
  }
  
  @Post('createUser')
  @UseInterceptors(FileInterceptor('file'))
  async createUser(@Body() dto: CreateUserDto, @UploadedFile() file) {
    // More boilerplate...
  }
}
```

### The NestRPC Way

```typescript
// ✅ Clean and simple!
@Router()
export class UserRouter {
  @Route()
  async getUserById(id: string) {
    return getUserFromDb(id);
  }
  
  @Route({ file: 'single' })
  async createUser(
    { name, email }: { name: string; email: string },
    file?: Express.Multer.File
  ) {
    return createUserInDb({ name, email, avatar: file });
  }
}
```

**That's it!** Routes work automatically via runtime magic using proxies, types are inferred, and your client gets full type safety.

---

## 📦 Installation

```bash
npm install @nestjs-rpc/server
# or
pnpm add @nestjs-rpc/server
# or
yarn add @nestjs-rpc/server
```

**Peer Dependencies:**
- `@nestjs/common` ^11.0.0
- `@nestjs/core` ^11.0.0
- `@nestjs/platform-express` ^11.0.0
- `reflect-metadata` (usually included in NestJS apps)

---

## 🚀 Quick Start

### 1. Define Your Routers

Create router classes with `@Router()` and mark methods with `@Route()`:

```typescript
// src/routers/user.router.ts
import { Router, Route } from '@nestjs-rpc/server';

@Router()
export class UserRouter {
  @Route()
  async getUserById(id: string) {
    return { id, name: 'Ada Lovelace', email: 'ada@example.com' };
  }

  @Route()
  async createUser({ name, email }: { name: string; email: string }) {
    const newUser = { id: Date.now().toString(), name, email };
    // Save to database...
    return newUser;
  }

  @Route()
  async listUsers() {
    return [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ];
  }
}
```

### 2. Create a Manifest

Group your routers in a manifest:

```typescript
// src/nest-rpc.config.ts
import { defineManifest } from '@nestjs-rpc/server';
import { UserRouter } from './routers/user.router';

export const manifest = defineManifest({
  user: UserRouter,
  // Add more routers here
  // product: ProductRouter,
  // order: OrderRouter,
});

// 🔁 Export the type for client-side type safety
export type Manifest = typeof manifest;
```

### 3. Initialize Before Nest App Creation

**⚠️ IMPORTANT:** Call `nestRpcInit()` **BEFORE** `NestFactory.create()`:

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { nestRpcInit } from '@nestjs-rpc/server';
import { AppModule } from './app.module';
import { manifest } from './nest-rpc.config';

async function bootstrap() {
  // ✅ Call this FIRST - it applies decorators that Nest needs at bootstrap
  nestRpcInit(manifest, { apiPrefix: 'nestjs-rpc' }); // 'nestjs-rpc' is default

  // Then create your Nest app
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS if needed for your client
  app.enableCors({
    origin: 'http://localhost:5173',
  });
  
  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000');
}

bootstrap();
```

### 4. Register Routers in Your Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { UserRouter } from './routers/user.router';

@Module({
  controllers: [UserRouter], // Register as controllers
  providers: [],
})
export class AppModule {}
```

**That's it!** Your routes are now available at:
- `POST /nestjs-rpc/user/getUserById`
- `POST /nestjs-rpc/user/createUser`
- `POST /nestjs-rpc/user/listUsers`

---

## 📤 File Uploads

NestRPC has **built-in support** for file uploads. No custom middleware needed!

### Single File Upload

```typescript
@Router()
export class FileRouter {
  @Route({ file: 'single' })
  async uploadAvatar(
    { userId }: { userId: string },
    file?: Express.Multer.File
  ) {
    return {
      userId,
      filename: file?.originalname,
      size: file?.size,
      mimetype: file?.mimetype,
    };
  }
}
```

### Multiple File Upload

```typescript
@Router()
export class FileRouter {
  @Route({ file: 'multiple' })
  async uploadDocuments(
    { category }: { category?: string },
    files?: Express.Multer.File[]
  ) {
    return {
      category,
      files: files?.map(f => ({
        name: f.originalname,
        size: f.size,
        type: f.mimetype,
      })),
      count: files?.length || 0,
    };
  }
}
```

### Advanced File Options

```typescript
@Route({
  file: {
    mode: 'single',
    options: {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    },
  },
})
async uploadWithLimits(params: any, file?: Express.Multer.File) {
  // ...
}
```

---

## 🎨 Nested Routers

Organize your API with nested routers:

```typescript
export const manifest = defineManifest({
  user: {
    queries: UserQueriesRouter,    // GET-like operations
    mutations: UserMutationsRouter, // POST-like operations
  },
  files: FilesRouter,
});
```

Routes become:
- `POST /nestjs-rpc/user/queries/getUser`
- `POST /nestjs-rpc/user/mutations/createUser`
- `POST /nestjs-rpc/files/uploadFile`

---

## 🔧 Advanced Usage

### Custom Parameter Decorators

Create decorators to inject context or dependencies:

```typescript
import { createRouterParamDecorator } from '@nestjs-rpc/server';

const CurrentUser = createRouterParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // From your auth middleware
  }
);

@Router()
export class UserRouter {
  @Route()
  async getProfile(@CurrentUser() user: User) {
    return user;
  }
}
```

### Dependency Injection

Routers are NestJS controllers, so you can use DI:

```typescript
@Router()
export class UserRouter {
  constructor(
    private readonly userService: UserService,
    private readonly db: DatabaseService,
  ) {}

  @Route()
  async getUserById(id: string) {
    return this.userService.findById(id);
  }
}
```

---

## 📖 API Reference

### `@Router()`

Marks a class as an RPC router. Applies `@Controller()` under the hood.

```typescript
@Router()
export class MyRouter {
  // ...
}
```

### `@Route(config?)`

Marks a method as an RPC endpoint.

**Options:**
- `file?: 'single' | 'multiple' | 'none'` - File upload mode (default: `'none'`)
- Or `file?: { mode: FileHandlingMode; options?: MulterOptions; maxCount?: number }`

```typescript
@Route() // No files
async myMethod(params: any) { }

@Route({ file: 'single' }) // Single file
async uploadFile(params: any, file?: Express.Multer.File) { }

@Route({ file: 'multiple' }) // Multiple files
async uploadFiles(params: any, files?: Express.Multer.File[]) { }
```

### `defineManifest(routers)`

Creates a manifest from your router structure.

```typescript
export const manifest = defineManifest({
  user: UserRouter,
  product: ProductRouter,
});
```

### `nestRpcInit(manifest, options?)`

Initializes RPC routes. **Must be called before `NestFactory.create()`**.

**Options:**
- `apiPrefix?: string` - API prefix (default: `'nestjs-rpc'`)

---

## 🎯 Best Practices

1. **Export manifest type** - Always export `export type Manifest = typeof manifest` for client type safety
2. **Organize with nested routers** - Use nested structures for better organization
3. **Use descriptive method names** - They become your API endpoints
4. **Handle errors properly** - Throw NestJS exceptions for proper error handling
5. **Validate inputs** - Use class-validator or similar for input validation

---

## 💡 Examples

Check out the [example directory](https://github.com/Natansal/NestRPC/tree/main/example) for a complete working example.

---

## 📚 Need More Help?

<div align="center">

### **[📖 Full Documentation →](https://natansal.github.io/NestRPC-docs/)**

*Complete guides, API reference, advanced patterns, and troubleshooting*

</div>

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
