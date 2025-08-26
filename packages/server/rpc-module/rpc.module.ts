import { DynamicModule, ExecutionContext, Logger, LoggerService, Module, type Provider } from "@nestjs/common";
import { createDynamicController } from "./rpc.controller";
import { NestRpcRouterConfig } from "@repo/shared";
import { AsyncLocalStorage } from "async_hooks";
import { RpcInterceptor } from "./rpc.interceptor";
import { APP_INTERCEPTOR } from "@nestjs/core";

/**
 * 🧰 Options for configuring `NestRPCModule`
 *
 * Provides settings for how the RPC controller is mounted and which routers
 * are exposed.
 *
 * - Defaults:
 *   - `apiPrefix` ➜ `"/nestjs-rpc"`
 *   - `logger` ➜ `new Logger("NestjsRPC")`
 */
export interface NestRPCModuleOptions {
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

export const asyncStorage = new AsyncLocalStorage<{ executionContext: ExecutionContext }>();

@Module({})
export class NestRPCModule {
   /**
    * 🚀 Configure the module synchronously.
    *
    * @param options - ✅ Developer-provided options including `routers` and optional `apiPrefix` and `global`.
    * @returns A NestJS `DynamicModule` configured with the provided options.
    */
   static forRoot(options: NestRPCModuleOptions): DynamicModule {
      const { apiPrefix = "/nestjs-rpc", routes, logger = new Logger("NestjsRPC") } = options;

      const DynamicController = createDynamicController({
         apiPrefix,
         logger,
         routes,
      });
      const module: DynamicModule = {
         module: NestRPCModule,
         controllers: [DynamicController],
         providers: [
            {
               provide: APP_INTERCEPTOR,
               useClass: RpcInterceptor,
            },
         ],
         global: false,
      };

      return module;
   }
}
