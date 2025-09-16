import { Controller } from "@nestjs/common";
import { ROUTER_METADATA } from "../reflect-keys.constant";

export function Router(): ClassDecorator {
   return function (target) {
      Reflect.defineMetadata(ROUTER_METADATA, {}, target);
      return Controller()(target);
   };
}
