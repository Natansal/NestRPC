import { SetMetadata } from "@nestjs/common";
import { RPC_GUARDS_METADATA } from "../constants/reflect-metadata-keys.constant";

/**
 * 🔒 Apply guards to an RPC route or router.
 *
 * @param guards - The guards to apply.
 * @returns A decorator that applies the guards to the route or router.
 */
export const UseGuardsRPC = (...guards: any[]) => {
   return (target: any, propertyKey?: string | symbol) => {
      if (propertyKey) {
         // method-level
         Reflect.defineMetadata(RPC_GUARDS_METADATA, guards, target, propertyKey);
      } else {
         // class-level
         Reflect.defineMetadata(RPC_GUARDS_METADATA, guards, target);
      }
   };
};
