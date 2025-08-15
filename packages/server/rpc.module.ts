import { DynamicModule, Module, type Provider } from "@nestjs/common";
import type { ClassType } from "@repo/shared";
import { NestRPCService } from "./rpc.service";
import { RPC_MODULE_OPTIONS } from "./constants";
import { createDynamicController } from "./rpc.controller";

export interface NestRPCModuleOptions<T extends ClassType<any>> {
   global?: boolean;
   routers: T[];
   apiPrefix?: string;
}

@Module({})
export class NestRPCModule {
   /**
    * 🚀 Configure the module synchronously.
    *
    * @param options - ✅ Developer-provided options including `routers` and optional `apiPrefix` and `global`.
    * @returns A NestJS `DynamicModule` configured with the provided options.
    */
   static forRoot<T extends ClassType<any>>(options: NestRPCModuleOptions<T>): DynamicModule {
      const { global = false, routers, apiPrefix = "/nestjs-rpc" } = options;

      const mergedOptions: NestRPCModuleOptions<T> = {
         global,
         routers,
         apiPrefix,
      };

      const DynamicController = createDynamicController({ apiPrefix });

      const providers: Provider[] = [NestRPCService, { provide: RPC_MODULE_OPTIONS, useValue: mergedOptions }];

      const module: DynamicModule = {
         module: NestRPCModule,
         controllers: [DynamicController],
         providers,
         exports: providers,
         global,
      };

      return module;
   }
}
