import { Injectable, OnModuleInit, Logger, Inject } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { RPC_MODULE_OPTIONS } from "./constants";
import type { NestRPCModuleOptions } from "./rpc.module";

@Injectable()
export class RouterRegistry implements OnModuleInit {
   private readonly logger = new Logger(RouterRegistry.name);
   private readonly instances = new Map<string, any>();

   constructor(
      private readonly moduleRef: ModuleRef,
      @Inject(RPC_MODULE_OPTIONS) private readonly options: NestRPCModuleOptions<any>,
   ) {}

   async onModuleInit(): Promise<void> {
      const routers = this.options.routers ?? [];
      for (const RouterClass of routers) {
         try {
            const instance = this.moduleRef.get(RouterClass, { strict: false });
            if (!instance) {
               this.logger.warn(`Router not found in DI container: ${RouterClass.name}`);
               continue;
            }
            const name = RouterClass.name;
            this.instances.set(name, instance);
         } catch (err) {
            this.logger.error(`Failed to resolve router ${RouterClass.name}: ${(err as Error).message}`);
         }
      }
   }

   getRouterInstance(name: string): unknown | undefined {
      return this.instances.get(name);
   }

   listRouters(): string[] {
      return [...this.instances.keys()];
   }
}


