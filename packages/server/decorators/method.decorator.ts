import "reflect-metadata";
import { RPC_METHOD_TYPE_METADATA } from "../constants";

export type RpcMethodType = "query" | "mutation";

/**
 * 🪄 Mark a method as an RPC query.
 *
 * @returns Method decorator storing the RPC method type.
 */
export function Query(): MethodDecorator {
   return (target, propertyKey, descriptor) => {
      Reflect.defineMetadata(RPC_METHOD_TYPE_METADATA, "query", descriptor.value!);
   };
}

/**
 * 🛠️ Mark a method as an RPC mutation.
 *
 * @returns Method decorator storing the RPC method type.
 */
export function Mutation(): MethodDecorator {
   return (target, propertyKey, descriptor) => {
      Reflect.defineMetadata(RPC_METHOD_TYPE_METADATA, "mutation", descriptor.value!);
   };
}


