import { ClassType, RpcRouterManifest } from "@repo/shared";
import { ROUTE_METADATA, ROUTER_METADATA } from "../reflect-keys.constant";
import { Body, Controller, Post } from "@nestjs/common";

/**
 * 🧵 applyForRouters
 *
 * Discovers router classes and their route methods from a `RpcRouterManifest`,
 * then applies NestJS decorators at runtime to register controllers and POST
 * endpoints under the provided `prefix`.
 *
 * - Detects classes marked with `@Router()` and methods with `@Route()`.
 * - Builds nested paths from manifest keys and method names.
 * - Adds `@Controller(prefix)` on router classes and `@Post(path)` on methods.
 * - Injects `@Body('param')` for the first method parameter.
 *
 * @param prefix - 🔌 Base path prefix for all generated routes (e.g., "nestjs-rpc").
 * @param manifest - 🗺️ Router manifest mapping keys to router classes or nested manifests.
 * @returns void - ✅ Applies decorators; no runtime value is returned.
 */
export function applyForRouters(prefix: string, manifest: RpcRouterManifest) {
   const map = new Map<ClassType<any>, Map<string, string[]>>();

   function populateMap(routes: RpcRouterManifest, segments: string[] = []) {
      Object.keys(routes).forEach((key) => {
         const newSegments = [...segments, key];

         const router = routes[key];

         if (!router) return;

         if (typeof router === "object") return populateMap(router, newSegments);

         const isRouter = Reflect.getMetadata(ROUTER_METADATA, router);

         if (!isRouter) return;

         const routerMap = map.get(router) ?? new Map<string, string[]>();

         map.set(router, routerMap);

         const propertyNames = Object.getOwnPropertyNames(router.prototype).filter(
            (name) => typeof router.prototype[name] === "function" && name !== "constructor",
         );

         for (const name of propertyNames) {
            const isRoute = Reflect.getMetadata(ROUTE_METADATA, router.prototype, name);
            if (isRoute) {
               const methodPaths = routerMap.get(name) ?? [];
               methodPaths.push([...newSegments, name].join("/"));
               routerMap.set(name, methodPaths);
            }
         }
      });
   }

   populateMap(manifest);

   for (const [router, methodsMap] of map) {
      Controller(prefix)(router);
      for (const [methodName, paths] of methodsMap) {
         Post(paths)(router.prototype, methodName, Object.getOwnPropertyDescriptor(router.prototype, methodName)!);
         Body("param")(router.prototype, methodName, 0);
      }
   }
}
