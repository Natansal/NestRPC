<div align="center">

# @nestjs-rpc/client

**Type-safe RPC client for calling NestJS methods from any frontend. Full TypeScript inference, zero configuration.**

[![npm version](https://img.shields.io/npm/v/@nestjs-rpc/client.svg)](https://www.npmjs.com/package/@nestjs-rpc/client)
[![npm downloads](https://img.shields.io/npm/dm/@nestjs-rpc/client.svg)](https://www.npmjs.com/package/@nestjs-rpc/client)
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

## 🎯 Why @nestjs-rpc/client?

**Stop writing API client wrappers manually.** This package gives you:

- 🔒 **End-to-End Type Safety** - Import your server's manifest type for complete type inference
- 🎯 **Zero Boilerplate** - No manual API wrappers or type definitions
- 📤 **Built-in File Uploads** - Upload files with simple `{ file }` or `{ files: [] }` options
- ⚡ **Proxy-Based API** - Call methods like `rpc.user.getUserById('123')` - feels like local functions
- 🎨 **Framework Agnostic** - Works with React, Vue, Angular, Svelte, or vanilla JS
- 🔧 **Fully Customizable** - Built on Axios with full configuration support

### The Traditional Way (Without NestRPC)

```typescript
// ❌ Manual API client with no type safety
const response = await fetch('/api/user/getUserById', {
  method: 'POST',
  body: JSON.stringify({ id: '123' }),
});
const user = await response.json(); // 😱 No types!
```

### The NestRPC Way

```typescript
// ✅ Type-safe, feels like a local function
const { data: user } = await rpc.user.getUserById('123');
//    ^? { id: string; name: string; email: string }
// Full autocomplete and type checking! 🎉
```

## 📦 Installation

```bash
npm install @nestjs-rpc/client axios
# or
pnpm add @nestjs-rpc/client axios
# or
yarn add @nestjs-rpc/client axios
```

**Peer Dependencies:**
- `axios` - Used as the default HTTP client (you can provide your own)

## 🚀 Quick Start

### 1. Import Your Server's Manifest Type

First, make sure your server exports the manifest type:

```typescript
// server/src/nest-rpc.config.ts
export const manifest = defineManifest({ /* ... */ });
export type Manifest = typeof manifest; // 👈 Export this!
```

### 2. Create the Client

```typescript
// client/src/rpc-client.ts
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from '../../server/src/nest-rpc.config';

export const rpcClient = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc', // Optional, defaults to 'nestjs-rpc'
});

export const rpc = rpcClient.routers();
```

### 3. Use with Full Type Safety!

```typescript
// Now you have full type safety and autocomplete!
const { data: user } = await rpc.user.getUserById('123');
//    ^? { id: string; name: string; email: string }

await rpc.user.createUser({ 
  name: 'Jane Doe', 
  email: 'jane@example.com' 
});

const { data: users } = await rpc.user.listUsers();
//    ^? Array<{ id: string; name: string; email: string }>
```

**That's it!** You get:
- ✅ Full TypeScript autocomplete
- ✅ Compile-time type checking
- ✅ Runtime type safety
- ✅ Zero boilerplate

---

## 📤 File Uploads

NestRPC client has **built-in support** for file uploads. No FormData handling needed!

### Single File Upload

```typescript
const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');

const { data } = await rpc.user.uploadAvatar(
  { userId: '123' },
  { file: fileInput.files[0] }
);
```

### Multiple File Upload

```typescript
const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');

const { data } = await rpc.files.uploadDocuments(
  { category: 'invoices' },
  { files: Array.from(fileInput.files) }
);
```

### With React Example

```typescript
function FileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    
    const { data } = await rpc.user.uploadAvatar(
      { userId: '123' },
      { file }
    );
    
    console.log('Uploaded:', data);
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
```

---

## 🔧 Configuration

### Basic Configuration

```typescript
const rpcClient = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc', // Optional
});
```

### Advanced Configuration

```typescript
import axios from 'axios';

// Create custom Axios instance
const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'X-Custom-Header': 'value',
  },
});

const rpcClient = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc',
  axiosInstance, // Use custom instance
  requestOptions: {
    // Default options for all requests
    headers: {
      Authorization: 'Bearer token',
    },
  },
});
```

### Per-Call Options

Override options for individual calls:

```typescript
// Add custom headers for this call
const { data } = await rpc.user.getUserById('123', {
  requestOptions: {
    headers: {
      Authorization: 'Bearer custom-token',
      'X-Custom-Header': 'value',
    },
  },
});

// Use different Axios instance for this call
const { data } = await rpc.user.getUserById('123', {
  axiosInstance: customAxiosInstance,
});
```

### Dynamic Configuration

Update configuration at runtime:

```typescript
// Update base URL
rpcClient.$setConfigProperty('baseUrl', 'https://api.production.com');

// Or update entire config
rpcClient.$setConfig({
  baseUrl: 'https://api.production.com',
  requestOptions: {
    headers: {
      Authorization: `Bearer ${newToken}`,
    },
  },
});

// Read current config
const config = rpcClient.$config;
console.log(config.baseUrl);
```

---

## 🎨 Framework Examples

### React

```typescript
import { useState, useEffect } from 'react';
import { rpc } from './rpc-client';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    rpc.user.listUsers().then(({ data }) => setUsers(data));
  }, []);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Vue 3

```typescript
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { rpc } from './rpc-client';

const users = ref([]);

onMounted(async () => {
  const { data } = await rpc.user.listUsers();
  users.value = data;
});
</script>
```

### Angular

```typescript
import { Component, OnInit } from '@angular/core';
import { rpc } from './rpc-client';

@Component({
  selector: 'app-user-list',
  template: `
    <ul>
      <li *ngFor="let user of users">{{ user.name }}</li>
    </ul>
  `,
})
export class UserListComponent implements OnInit {
  users: any[] = [];

  async ngOnInit() {
    const { data } = await rpc.user.listUsers();
    this.users = data;
  }
}
```

### Vanilla TypeScript

```typescript
import { rpc } from './rpc-client';

async function loadUsers() {
  const { data: users } = await rpc.user.listUsers();
  console.log('Users:', users);
}

loadUsers();
```

---

## 🔒 Type Safety

The client automatically infers types from your server's manifest:

```typescript
// Server method signature:
@Route()
async getUserById(id: string): Promise<User> {
  return { id, name: 'John', email: 'john@example.com' };
}

// Client automatically gets:
const { data } = await rpc.user.getUserById('123');
//    ^? { data: User }
//    ^? id parameter is typed as string
//    ^? Full autocomplete for User properties
```

**If your server types change, your client code will show TypeScript errors immediately!**

---

## 📖 API Reference

### `RpcClient<Manifest>`

Main client class.

```typescript
const client = new RpcClient<Manifest>(config);
```

**Config:**
- `baseUrl: string` - Base URL of your server
- `apiPrefix?: string` - API prefix (default: `'nestjs-rpc'`)
- `axiosInstance?: AxiosInstance` - Custom Axios instance
- `requestOptions?: AxiosRequestConfig` - Default request options

### `client.routers()`

Get the router proxy for making RPC calls.

```typescript
const rpc = client.routers();
// Use rpc.user.getUserById(), etc.
```

### `client.$setConfig(config)`

Update the entire configuration.

### `client.$setConfigProperty(key, value)`

Update a single configuration property.

### `client.$config`

Read-only access to current configuration.

---

## 🎯 Best Practices

1. **Export manifest type** - Make sure your server exports `export type Manifest = typeof manifest`
2. **Centralize client** - Create one client instance and export it
3. **Use environment variables** - Use different base URLs for dev/prod
4. **Handle errors** - Wrap calls in try-catch or use error boundaries
5. **Type your responses** - Use `const { data }` destructuring for better types

---

## 💡 Examples

Check out the [example directory](https://github.com/Natansal/NestRPC/tree/main/example) for a complete working example with React.

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
