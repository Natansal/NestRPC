import { ClassType, RpcRouterManifest } from "@repo/shared";
import { ROUTE_METADATA, ROUTER_METADATA } from "../reflect-keys.constant";
import { Body, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import type { RouteConfig } from "../decorators";
import { FileInterceptor, FilesInterceptor, NoFilesInterceptor } from "@nestjs/platform-express";
import { FormDataParamBodyInterceptor } from "../interceptors";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";

/**
 * 🧵 applyForRouters
 *
 * Discovers router classes and their `@Route()` methods from a `RpcRouterManifest`,
 * including methods inherited from parent classes, in a single traversal of each
 * class's prototype chain. It then applies NestJS decorators at runtime to register
 * one `@Controller(prefix)` per concrete router (the class present in the manifest)
 * and `@Post(path)` handlers for every discovered route method.
 *
 * Highlights ✨
 * - 🔎 Single pass up the prototype chain: collects only methods decorated with `@Route()`
 *   and caches their `PropertyDescriptor`s for correct decorator application.
 * - 🧬 Inheritance-aware: inherited `@Route()` methods are exposed under the concrete
 *   controller from the manifest; parent classes need not be controllers.
 * - 🧭 Path building: nested manifest keys plus the method name compose the POST path.
 * - 📦 Binding: uses the stored descriptor to apply `@Post(paths)` and injects `@Body('param')`
 *   for the first method parameter.
 *
 * Notes
 * - ⛔ Static methods, symbol-named methods, and accessors (get/set) are intentionally ignored.
 *   Only instance methods with concrete function values are considered.
 *
 * @param prefix - 🔌 Base path prefix for all generated routes (e.g., "nestjs-rpc").
 * @param manifest - 🗺️ Router manifest mapping keys to router classes or nested manifests.
 * @returns void - ✅ Applies decorators; no runtime value is returned.
 */
export function applyForRouters(prefix: string, manifest: RpcRouterManifest) {
   // Map of router class -> (method name -> list of full paths)
   const map = new Map<ClassType<any>, Map<string, string[]>>();
   // Map of router class -> (method name -> method descriptor found along the prototype chain)
   const descriptors = new Map<ClassType<any>, Map<string, PropertyDescriptor>>();

   /**
    * 🔗 getPrototypeChainRoutes
    *
    * Walks the prototype chain of `routerCtor` once, collecting method names that are
    * decorated with `@Route()`. Optionally writes their `PropertyDescriptor`s into
    * `outDescriptors` so callers can later apply decorators using the correct descriptor.
    *
    * Limitations: static methods, symbol-named members, and accessors are skipped by design.
    */
   function getPrototypeChainRoutes(
      routerCtor: ClassType<any>,
      outDescriptors?: Map<string, PropertyDescriptor>,
   ): { method: string; router: ClassType<any> }[] {
      const methods = new Map<string, ClassType<any>>();
      let currentProto: any = routerCtor.prototype;
      // Traverse up until Object.prototype (exclusive)
      while (currentProto && currentProto !== Object.prototype) {
         // Inspect only own properties of the current prototype level
         for (const name of Object.getOwnPropertyNames(currentProto)) {
            if (name === "constructor") continue; // skip constructor
            if (methods.has(name)) continue; // closest-to-child prototype wins
            const descriptor = Object.getOwnPropertyDescriptor(currentProto, name);
            if (!descriptor || typeof descriptor.value !== "function") continue; // skip accessors and non-functions
            const isRoute = Reflect.getMetadata(ROUTE_METADATA, currentProto, name);
            if (isRoute) {
               methods.set(name, currentProto.constructor as ClassType<any>);
               if (outDescriptors) outDescriptors.set(name, descriptor);
            }
         }
         currentProto = Object.getPrototypeOf(currentProto);
      }
      return Array.from(methods.entries()).map(([method, ctor]) => ({ method, router: ctor }));
   }

   /**
    * 🧩 populateMap
    *
    * Recursively walks the manifest tree, accumulating path segments, and for
    * each discovered router class, collects its decorated methods (including inherited)
    * and stores both:
    * - the list of paths per method (in `map`), and
    * - the method descriptors per router (in `descriptors`).
    */
   function populateMap(routes: RpcRouterManifest, segments: string[] = []) {
      Object.keys(routes).forEach((key) => {
         const newSegments = [...segments, key];

         const router = routes[key];

         if (!router) return;

         if (typeof router === "object") return populateMap(router, newSegments);

         const isRouter = Reflect.getMetadata(ROUTER_METADATA, router);

         if (!isRouter) return;

         // Ensure accumulators exist for this router
         const routerMap = map.get(router) ?? new Map<string, string[]>();

         map.set(router, routerMap);

         // Collect decorated methods (single pass up the prototype chain)
         const descMap = new Map<string, PropertyDescriptor>();
         const routesArr = getPrototypeChainRoutes(router, descMap);
         descriptors.set(router, descMap);
         // Build and accumulate full paths for each method discovered under this manifest key
         for (const { method: methodName } of routesArr) {
            const methodPaths = routerMap.get(methodName) ?? [];
            methodPaths.push([...newSegments, methodName].join("/"));
            routerMap.set(methodName, methodPaths);
         }
      });
   }

   populateMap(manifest);

   // Register one controller per concrete router and its collected routes
   for (const [router, methodsMap] of map) {
      Controller(prefix)(router);
      for (const [methodName, paths] of methodsMap) {
         const routeMetadata = Reflect.getMetadata(
            ROUTE_METADATA,
            router.prototype,
            methodName,
         ) as Partial<RouteConfig>;

         const descriptor = descriptors.get(router)?.get(methodName)!;

         // --- file support ---
         routeMetadata.file ??= "none";
         const mode = typeof routeMetadata.file === "string" ? routeMetadata.file : routeMetadata.file.mode;
         const options = typeof routeMetadata.file === "string" ? undefined : routeMetadata.file.options;
         const maxCount = typeof routeMetadata.file === "string" ? undefined : routeMetadata.file.maxCount;

         switch (mode) {
            case "single":
               UseInterceptors(FileInterceptor("file", options), FormDataParamBodyInterceptor)(
                  router.prototype,
                  methodName,
                  descriptor,
               );
               if (!isIndexOccupied(router.prototype, methodName, 1)) UploadedFile()(router.prototype, methodName, 1);
               break;
            case "multiple":
               UseInterceptors(FilesInterceptor("files", maxCount, options), FormDataParamBodyInterceptor)(
                  router.prototype,
                  methodName,
                  descriptor,
               );
               if (!isIndexOccupied(router.prototype, methodName, 1)) UploadedFiles()(router.prototype, methodName, 1);
               break;
            default:
               UseInterceptors(NoFilesInterceptor(options), FormDataParamBodyInterceptor)(
                  router.prototype,
                  methodName,
                  descriptor,
               );
               break;
         }

         // Use the descriptor captured during prototype traversal to apply the route decorator
         Post(paths)(router.prototype, methodName, descriptor);
         // Inject first param as the RPC body payload
         if (!isIndexOccupied(router.prototype, methodName, 0)) Body()(router.prototype, methodName, 0);
      }
   }
}

function isIndexOccupied(target: any, methodName: string, index: number) {
   const existing = Reflect.getMetadata(ROUTE_ARGS_METADATA, target[methodName]);
   return existing ? Object.values(existing).some((meta: any) => meta.index === index) : false;
}
