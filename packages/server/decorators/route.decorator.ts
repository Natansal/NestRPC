import { ROUTE_METADATA } from "../reflect-keys.constant";

/**
 * 🛣️ Route
 *
 * Method decorator that marks a class method as an RPC route handler.
 *
 * - Adds metadata used by the router discovery to attach HTTP endpoints.
 * - Use inside classes decorated with `@Router()`.
 *
 * @returns MethodDecorator - 🏷️ A method decorator to annotate route handlers.
 */
export function Route(): MethodDecorator {
   return function (target, propertyKey, descriptor: PropertyDescriptor) {
      Reflect.defineMetadata(ROUTE_METADATA, {}, target, propertyKey);
      return descriptor;
   };
}
