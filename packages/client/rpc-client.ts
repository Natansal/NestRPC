import { RpcRouterManifest } from "@repo/shared";
import merge from "lodash.merge";
import { InferNestRpcRouterApp, RpcClientConfig, RpcMethodOptions } from "./types";
import axios from "axios";

/**
 * 🔗 RpcClient
 *
 * Type-safe client for calling your Nest RPC routes generated from a
 * `RpcRouterManifest`. Provides a fluent, proxy-based API to traverse routers
 * and invoke methods with inferred request/response types.
 *
 * @typeParam T - 🧭 The manifest type used to infer the client surface.
 */
export class RpcClient<T extends RpcRouterManifest> {
   private config!: Required<Omit<RpcClientConfig, "baseUrl">> & Pick<RpcClientConfig, "baseUrl">;

   /**
    * 🏗️ Construct a new client.
    *
    * @param config - ⚙️ Client configuration.
    * - `apiPrefix` default: "nestjs-rpc"
    * - `requestOptions` default: `{}`
    * - `axiosInstance` default: `axios`
    * - `baseUrl` default: `undefined` (you should provide it)
    */
   constructor(config: RpcClientConfig) {
      this.$setConfig(config);
   }

   /**
    * ⚙️ Set or replace the client configuration.
    *
    * - Trims leading/trailing slashes from `apiPrefix` and `baseUrl`.
    * - Fills in defaults for missing values.
    *
    * @param config - 🧩 Partial or full configuration to apply.
    * @returns void - ✅ Updates internal config.
    */
   $setConfig(config: RpcClientConfig) {
      let { apiPrefix = "nestjs-rpc", requestOptions = {}, axiosInstance = axios, baseUrl } = config;

      const trimSlashesRgx = /^\/+|\/+$/g;

      apiPrefix = apiPrefix.replace(trimSlashesRgx, "");
      baseUrl = baseUrl?.replace(trimSlashesRgx, "");

      this.config = { apiPrefix, requestOptions, axiosInstance, baseUrl };
   }

   /**
    * 🧮 Update a single configuration property.
    *
    * @param key - 🔑 One of the keys of `RpcClientConfig`.
    * @param value - 🧱 New value for the given key.
    * @returns void - ✅ Applies the update and recomputes normalized config.
    */
   $setConfigProperty<T extends keyof Required<RpcClientConfig>>(key: T, value: Required<RpcClientConfig>[T]) {
      this.$setConfig({ ...this.config, [key]: value });
   }

   /**
    * 📦 Current normalized configuration.
    *
    * - `apiPrefix`: string (no leading/trailing slashes)
    * - `baseUrl`: string | undefined (no leading/trailing slashes)
    * - `requestOptions`: AxiosRequestConfig
    * - `axiosInstance`: AxiosInstance
    */
   get $config(): Readonly<typeof this.config> {
      return this.config;
   }

   /**
    * 🧭 Get a specific router proxy by key.
    *
    * @param router - 🏷️ Router key from your manifest.
    * @returns A proxy exposing the methods of the router with typed calls.
    */
   route<K extends keyof InferNestRpcRouterApp<T>>(router: K): InferNestRpcRouterApp<T>[K] {
      return this.routers()[router];
   }

   /**
    * 🌳 Get the root proxy for navigating routers and calling methods.
    *
    * @returns A nested proxy matching the structure of your manifest.
    */
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
      return (
         await (options?.axiosInstance ?? this.config.axiosInstance).post(
            `${this.$config.baseUrl}/${this.$config.apiPrefix}/${path.join("/")}`,
            { param: body },
            merge({}, this.$config.requestOptions, options?.requestOptions ?? {}),
         )
      ).data;
   }
}
