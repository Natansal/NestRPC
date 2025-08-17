import "reflect-metadata";
import { ROUTE_METADATA } from "../constants";

/**
 * 🛣️ Type guard to determine whether the given method has route metadata.
 *
 * Checks for the presence of route metadata attached by the `@Route()` decorator.
 * This is useful for identifying methods that are intended to be RPC endpoints.
 *
 * @param method - 🔍 The method to check (should be a function).
 * @returns ✅ `true` if the method has route metadata; otherwise `false`.
 */
export function isRoute(method: any): method is Function {
   return typeof method === "function" && Reflect.hasOwnMetadata(ROUTE_METADATA, method);
}
