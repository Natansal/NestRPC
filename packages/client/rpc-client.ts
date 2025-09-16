import { RpcRouterManifest } from "@repo/shared";
import { InferNestRpcRouterApp, RpcClientConfig, RpcMethodOptions } from "./types";
import axios from "axios";

export class RpcClient<T extends RpcRouterManifest> {
   private config!: Required<Omit<RpcClientConfig, "baseUrl">> & Pick<RpcClientConfig, "baseUrl">;

   constructor(config: RpcClientConfig) {
      this.$setConfig(config);
   }

   $setConfig(config: RpcClientConfig) {
      let { apiPrefix = "nestjs-rpc", requestOptions = {}, axiosInstance = axios, baseUrl } = config;

      const trimSlashesRgx = /^\/+|\/+$/g;

      apiPrefix = apiPrefix.replace(trimSlashesRgx, "");
      baseUrl = baseUrl?.replace(trimSlashesRgx, "");

      this.config = { apiPrefix, requestOptions, axiosInstance, baseUrl };
   }

   $setConfigProperty<T extends keyof Required<RpcClientConfig>>(key: T, value: Required<RpcClientConfig>[T]) {
      this.$setConfig({ ...this.config, [key]: value });
   }

   get $config(): Readonly<typeof this.config> {
      return this.config;
   }

   route<K extends keyof InferNestRpcRouterApp<T>>(router: K): InferNestRpcRouterApp<T>[K] {
      return this.routers()[router];
   }

   routers() {
      const that = this;
      function buildProxy(path: string[] = []) {
         return new Proxy((() => {}) as any as ((body: any) => Promise<any>) & Record<string, any>, {
            get(_, propertyKey: string | number | symbol) {
               if (typeof propertyKey === "symbol") {
                  throw new Error(
                     `Invalid property name: Property name cannot be of type symbol, got: ${propertyKey.toString()}`,
                  );
               }

               return buildProxy([...path, propertyKey.toString()]);
            },
            async apply(_, __, args: [body: any, options?: RpcMethodOptions]) {
               if (path.length === 0) {
                  throw new Error("NOT A FUNCTION, Proxy tree access without method");
               }

               return await that.handleRequest(path, ...args);
            },
         });
      }

      return buildProxy() as InferNestRpcRouterApp<T>;
   }

   private async handleRequest(path: string[], body: any, options?: RpcMethodOptions) {
      return await (options?.axiosInstance ?? this.config.axiosInstance).post(
         `${this.$config.baseUrl}/${this.$config.apiPrefix}/${path.join("/")}`,
         { param: body },
         {
            ...this.$config.requestOptions,
            ...(options?.requestOptions ?? {}),
         },
      );
   }
}
