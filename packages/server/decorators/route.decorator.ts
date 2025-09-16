import { ROUTE_METADATA } from "../reflect-keys.constant";

export function Route(): MethodDecorator {
   return function (target, propertyKey, descriptor: PropertyDescriptor) {
      Reflect.defineMetadata(ROUTE_METADATA, {}, target, propertyKey);
      return descriptor;
   };
}
