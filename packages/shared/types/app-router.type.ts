import { ClassType } from "./class.type";

type Router = ClassType<any>;

/**
 * 🗺️ Declarative configuration for mapping keys to routers or nested configs.
 */
export type RpcRouterManifest = {
   [key: string]: Router | RpcRouterManifest;
};
