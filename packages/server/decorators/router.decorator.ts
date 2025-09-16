import { Controller } from "@nestjs/common";
import { ROUTER_METADATA } from "../reflect-keys.constant";

/**
 * 🧭 Router
 *
 * Marks a class as an RPC router and applies NestJS `@Controller()` under the hood.
 *
 * - Adds metadata used by the RPC system to discover and register routes.
 * - Should decorate classes whose instance methods are exposed as RPC endpoints.
 *
 * @returns ClassDecorator - 🏷️ A class decorator to annotate router classes.
 */
export function Router(): ClassDecorator {
   return function (target) {
      Reflect.defineMetadata(ROUTER_METADATA, {}, target);
      return Controller()(target);
   };
}
