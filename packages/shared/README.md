# Shared

Small shared utilities and types.

### Exports

- `ClassType<T>`: constructor type for classes `new (...args: any[]) => T`.

Example:

```ts
import type { ClassType } from '@repo/shared';

function make<T>(Ctor: ClassType<T>, ...args: any[]): T {
  return new Ctor(...args);
}
```