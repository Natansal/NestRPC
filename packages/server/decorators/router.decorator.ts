import { Controller } from "@nestjs/common";
import { ROUTER_METADATA } from "../reflect-keys.constant";

export interface RouterOptions {
   prefix?: string;
}

export function Router(options: RouterOptions = {}): ClassDecorator {
   return function (target) {
      options.prefix ??= target.name;

      Reflect.defineMetadata(ROUTER_METADATA, options, target);

      return Controller(options.prefix)(target);
   };
}
