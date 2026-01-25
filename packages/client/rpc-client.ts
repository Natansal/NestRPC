import { RpcRouterManifest, UNDEFINED_BODY } from "@repo/shared";
import merge from "lodash.merge";
import {
  InferNestRpcRouterApp,
  RpcClientConfig,
  RpcMethodOptions,
} from "./types";
import axios from "axios";

/**
 * The symbol used to extract the path of a method from a proxy.
 */
export const PathSymbol = Symbol("path");

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
  private config!: Required<RpcClientConfig>;

  private proxyCache = new Map<string, any>();

  /**
   * 🏗️ Construct a new client.
   *
   * @param config - ⚙️ Client configuration.
   * - `baseUrl` **required** - Base URL of your server (e.g. `"http://localhost:3000"`)
   * - `apiPrefix` default: "nestjs-rpc"
   * - `requestOptions` default: `{}`
   * - `axiosInstance` default: `axios`
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
    let {
      apiPrefix = "nestjs-rpc",
      requestOptions = {},
      axiosInstance = axios,
      baseUrl,
    } = config;

    const trimSlashesRgx = /^\/+|\/+$/g;

    apiPrefix = apiPrefix.replace(trimSlashesRgx, "");
    baseUrl = baseUrl?.replace(trimSlashesRgx, "") ?? this.$config.baseUrl;

    this.config = { apiPrefix, requestOptions, axiosInstance, baseUrl };
  }

  /**
   * 🧮 Update a single configuration property.
   *
   * @param key - 🔑 One of the keys of `RpcClientConfig`.
   * @param value - 🧱 New value for the given key.
   * @returns void - ✅ Applies the update and recomputes normalized config.
   */
  $setConfigProperty<T extends keyof Required<RpcClientConfig>>(
    key: T,
    value: Required<RpcClientConfig>[T],
  ) {
    this.$setConfig({ ...this.config, [key]: value });
  }

  /**
   * 📦 Current normalized configuration.
   *
   * - `baseUrl`: string (no leading/trailing slashes)
   * - `apiPrefix`: string (no leading/trailing slashes)
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
  route<K extends keyof InferNestRpcRouterApp<T>>(
    router: K,
  ): InferNestRpcRouterApp<T>[K] {
    return this.routers()[router];
  }

  /**
   * 🌳 Get the root proxy for navigating routers and calling methods.
   *
   * @returns A nested proxy matching the structure of your manifest.
   */
  routers(): InferNestRpcRouterApp<T> {
    const that = this;
    function buildProxy(path: string[] = []) {
      const cacheKey = path.join(".");

      if (that.proxyCache.has(cacheKey)) {
        return that.proxyCache.get(cacheKey);
      }

      const proxy = new Proxy(
        (() => {}) as any as ((body: any) => Promise<any>) &
          Record<string, any>,
        {
          get(_, propertyKey: string | number | symbol) {
            if (propertyKey === PathSymbol) {
              return path;
            }

            if (typeof propertyKey === "symbol") {
              throw new Error(
                `Invalid property name: Property name cannot be of type symbol, got: ${propertyKey.toString()}`,
              );
            }

            return buildProxy([...path, propertyKey.toString()]);
          },
          async apply(_, __, args: [body: any, options?: RpcMethodOptions]) {
            if (path.length === 0) {
              throw new Error(
                "NOT A FUNCTION, Proxy tree access without method",
              );
            }

            return await that.handleRequest(path, ...args);
          },
        },
      );

      that.proxyCache.set(cacheKey, proxy);
      return proxy;
    }

    return buildProxy() as any;
  }

  private async handleRequest(
    path: string[],
    body: any,
    options?: RpcMethodOptions,
  ) {
    return await (options?.axiosInstance ?? this.config.axiosInstance).post(
      `${this.$config.baseUrl}/${this.$config.apiPrefix}/${path.join("/")}`,
      this.buildBody(body, options),
      merge(
        { headers: { "Content-Type": "multipart/form-data" } },
        this.$config.requestOptions,
        options?.requestOptions ?? {},
      ),
    );
  }

  private buildBody(body: unknown, options?: RpcMethodOptions) {
    const formData = new FormData();

    // Validate body is serializable
    let stringifiedBody: string;
    if (body === undefined) {
      stringifiedBody = UNDEFINED_BODY;
    } else {
      try {
        stringifiedBody = JSON.stringify(body);
      } catch (error) {
        throw new Error(
          `Failed to serialize RPC body: ${error instanceof Error ? error.message : "Unknown error"}. ` +
            `Body must be JSON-serializable.`,
        );
      }
    }

    formData.append("param", stringifiedBody);

    if (options?.file) {
      formData.append("file", options.file);
    }

    if (options?.files) {
      options.files.forEach((file) => formData.append("files", file));
    }

    return formData;
  }
}
