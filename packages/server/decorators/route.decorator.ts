import { SetMetadata } from "@nestjs/common";
import { ROUTE_METADATA } from "../constants";

/**
 * 🛣️ Method decorator to mark a class method as an RPC route.
 *
 * Attaches route-specific metadata used by the runtime to discover and execute
 * route handlers.
 */
export function Route() {
   return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
      return SetMetadata(ROUTE_METADATA, {})(target, propertyKey, descriptor);
   };
}
