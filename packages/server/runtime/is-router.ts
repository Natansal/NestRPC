import "reflect-metadata";
import type { ClassType } from "@repo/shared";
import { ROUTER_METADATA } from "../constants";

/**
 * 🏷️ Type guard to determine whether the given value is a Router class.
 *
 * Checks for the presence of router metadata attached by the `@Router()` decorator.
 *
 * @param value - 🔎 The candidate to check (should be a class constructor, not an instance).
 * @returns ✅ `true` if the class has router metadata; otherwise `false`.
 */
export function isRouter(value: any): value is ClassType<any> {
   return Reflect.hasOwnMetadata(ROUTER_METADATA, value);
}
