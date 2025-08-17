import { DynamicModule, Module, type Provider } from "@nestjs/common";
import { NestRPCService } from "./rpc.service";
import { RPC_MODULE_OPTIONS } from "./constants";
import { createDynamicController } from "./rpc.controller";
import { NestRpcRouterConfig } from "@repo/shared";

export interface NestRPCModuleOptions {
   global?: boolean;
   apiPrefix?: string;
   routes: NestRpcRouterConfig;
}

@Module({})
export class NestRPCModule {
   /**
    * 🚀 Configure the module synchronously.
    *
    * @param options - ✅ Developer-provided options including `routers` and optional `apiPrefix` and `global`.
    * @returns A NestJS `DynamicModule` configured with the provided options.
    */
   static forRoot(options: NestRPCModuleOptions): DynamicModule {
      const { global = false, apiPrefix = "/nestjs-rpc", routes } = options;

      const mergedOptions: NestRPCModuleOptions = {
         global,
         apiPrefix,
         routes,
      };

      const DynamicController = createDynamicController({ apiPrefix, routes });

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
