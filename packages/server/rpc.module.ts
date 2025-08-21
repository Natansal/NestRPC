import { DynamicModule, Logger, LoggerService, Module, type Provider } from "@nestjs/common";
import { NestRPCService } from "./rpc.service";
import { RPC_LOGGER, RPC_MODULE_OPTIONS } from "./constants";
import { createDynamicController } from "./rpc.controller";
import { NestRpcRouterConfig } from "@repo/shared";

/**
 * 🧰 Options for configuring `NestRPCModule`
 *
 * Provides settings for how the RPC controller is mounted and which routers
 * are exposed.
 *
 * - Defaults:
 *   - `global` ➜ `false`
 *   - `apiPrefix` ➜ `"/nestjs-rpc"`
 */
export interface NestRPCModuleOptions {
   /**
    * 🌍 Register providers controller-wide as global Nest providers.
    * - Default: `false`
    */
   global?: boolean;
   /**
    * 🛣️ Base path where the dynamic RPC controller is mounted.
    * - Default: `"/nestjs-rpc"`
    */
   apiPrefix?: string;
   /**
    * 🗺️ Declarative router configuration (map of keys ➜ router classes or nested maps).
    */
   routes: NestRpcRouterConfig;
   /**
    * 📝 Logger service to use for logging.
    * - Default: new Logger("NestjsRPC")
    */
   logger?: LoggerService;
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
      const { global = false, apiPrefix = "/nestjs-rpc", routes, logger = new Logger("NestjsRPC") } = options;

      const mergedOptions: Required<NestRPCModuleOptions> = {
         global,
         apiPrefix,
         routes,
         logger,
      };

      const DynamicController = createDynamicController({ apiPrefix, routes });

      const providers: Provider[] = [
         NestRPCService,
         { provide: RPC_MODULE_OPTIONS, useValue: mergedOptions },
         { provide: RPC_LOGGER, useValue: logger },
      ];

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
