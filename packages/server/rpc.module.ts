// nest-rpc.module.ts
import { DynamicModule, Module, Global } from "@nestjs/common";

export interface NestRPCModuleOptions<T> {
   global?: boolean;
   routers: T[];
}

@Module({})
export class NestRPCModule {
   static forRoot<T>(options: NestRPCModuleOptions = {}): DynamicModule {
      const providers = [];

      const module: DynamicModule = {
         module: NestRPCModule,
         providers,
         exports: providers,
      };

      if (options.global) {
         // @Global decorator can't be added dynamically, so we mark global here
         return {
            ...module,
            global: true,
         } as DynamicModule;
      }

      return module;
   }
}
