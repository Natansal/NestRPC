import "reflect-metadata";
import { Injectable, ScopeOptions } from "@nestjs/common";
import { BASE_ROUTE_METADATA } from "../constants";

/**
 * 🧭 Router decorator
 *
 * Stores a base route path in reflect-metadata for the RPC system and marks the class as
 * a NestJS injectable using `@Injectable(options)`.
 *
 * @param path - 📍 Base route segment to associate with this router (e.g., "users").
 * @param options - ⚙️ Optional NestJS scope options forwarded to `@Injectable`.
 * @returns 🏷️ A class decorator that tags the target with base-route metadata and applies `@Injectable`.
 */
export function Router(path: string, options?: ScopeOptions): ClassDecorator {
   return (target) => {
      Reflect.defineMetadata(BASE_ROUTE_METADATA, path, target);
      Injectable(options)(target);
   };
}
