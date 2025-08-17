import "reflect-metadata";
import { Injectable, ScopeOptions } from "@nestjs/common";
import { ROUTER_METADATA } from "../constants";

/**
 * 🧭 Router decorator
 *
 * Stores a base route path in reflect-metadata for the RPC system and marks the class as
 * a NestJS injectable using `@Injectable(options)`.
 *
 * @param options - ⚙️ Optional NestJS scope options forwarded to `@Injectable`.
 * @returns 🏷️ A class decorator that tags the target with base-route metadata and applies `@Injectable`.
 */
export function Router(options?: ScopeOptions): ClassDecorator {
   return (target) => {
      Reflect.defineMetadata(ROUTER_METADATA, {}, target);
      Injectable(options)(target);
   };
}
