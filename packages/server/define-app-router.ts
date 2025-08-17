import { NestRpcRouterConfig } from "@repo/shared";

/**
 * 🧩 Define the application router configuration.
 *
 * Helps with type inference for nested router structures by returning the same
 * config object while preserving its generic shape.
 *
 * @typeParam T - 🧠 The shape of your router config map.
 * @param config - 🗺️ A map of route keys to router classes or nested configs.
 * @returns 🔁 The exact same config object with strong typings preserved.
 */
export function defineAppRouter<T extends NestRpcRouterConfig>(config: T): T {
   return config;
}
