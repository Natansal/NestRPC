import { ClassType, RpcRouterManifest } from "@repo/shared";
import { ROUTE_METADATA, ROUTER_METADATA } from "../reflect-keys.constant";
import { Body, Controller, Post } from "@nestjs/common";

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
