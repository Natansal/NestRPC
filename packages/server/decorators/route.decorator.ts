import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { ROUTE_METADATA } from "../reflect-keys.constant";

/**
 * 🛣️ Route
 *
 * Decorator that marks a class method as an RPC route handler.
 *
 * - Attaches metadata used by the router discovery to wire HTTP endpoints.
 * - Use inside classes decorated with `@Router()`.
 *
 * @param config 🧩 Partial configuration for the route. Defaults to `{ file: "none" }`.
 * - `file` 📄 How the route handles file uploads: `"single" | "multiple" | "none"`.
 *   Can also be an object `{ mode: FileHandlingMode; options?: MulterOptions; maxCount?: number }`.
 * @returns 🏷️ MethodDecorator — decorator to annotate route handlers.
 */
export function Route(config: Partial<RouteConfig> = {}): MethodDecorator {
   return function (target, propertyKey, descriptor: PropertyDescriptor) {
      Reflect.defineMetadata(ROUTE_METADATA, config, target, propertyKey);
      return descriptor;
   };
}

/**
 * ⚙️ RouteConfig
 *
 * Configuration options for the `@Route()` decorator.
 */
export interface RouteConfig {
   /**
    * 📄 File handling mode for this route.
    *
    * Can be:
    * - `"single"` — expect a single file.
    * - `"multiple"` — expect multiple files.
    * - `"none"` — no files expected.
    *
    * Or an object:
    * ```ts
    * { mode: FileHandlingMode; options?: MulterOptions; maxCount?: number }
    * ```
    * - `mode`: which interceptor to apply.
    * - `options`: Multer configuration for multipart handling.
    * - `maxCount`: only applicable when `mode` is `"multiple"`.
    *
    * Defaults to `"none"`.
    *
    * #### ❗ Note
    * This decorator does NOT validate whether files were uploaded. It only sets up
    * the necessary boilerplate (e.g., multipart parsing/interceptors).
    */
   file:
      | FileHandlingMode
      | {
           mode: FileHandlingMode;
           options?: MulterOptions;
           maxCount?: number;
        };
}

/**
 * 🧾 FileHandlingMode
 *
 * Defines how a route expects files:
 * - `"single"` — a single file under the default field name.
 * - `"multiple"` — multiple files under the default field name.
 * - `"none"` — no files are expected.
 */
export type FileHandlingMode = "single" | "multiple" | "none";
