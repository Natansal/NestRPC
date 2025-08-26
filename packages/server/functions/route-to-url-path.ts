import { ClassType } from "@repo/shared";
import { RouteOptions, RouterOptions } from "../decorators";
import { ROUTE_METADATA, ROUTER_METADATA } from "../reflect-keys.constant";

export function routeToUrlPath<T extends object>(router: ClassType<T>, propertyKey: keyof T): string | null {
   const routerOptions: Required<RouterOptions> | null = Reflect.getMetadata(ROUTER_METADATA, router) ?? null;
   const routeOptions: Required<RouteOptions> | null =
      Reflect.getMetadata(ROUTE_METADATA, router.prototype, propertyKey.toString()) ?? null;

   if (!routerOptions || !routeOptions) return null;

   return combineUrl(routerOptions.prefix, routeOptions.path);
}

/**
 * Combine prefix and path into a normalized URL.
 *
 * @returns `/${prefix}/${path}` while normalizing the slashes
 */
function combineUrl(prefix = "", path = ""): string {
   // Ensure leading slashes
   if (prefix && !prefix.startsWith("/")) {
      prefix = "/" + prefix;
   }
   if (path && !path.startsWith("/")) {
      path = "/" + path;
   }

   // Join and normalize
   let url = `${prefix}${path}`;
   url = url.replace(/\/+/g, "/");

   // Ensure root slash and remove trailing slash (except root)
   if (!url.startsWith("/")) {
      url = "/" + url;
   }
   if (url.length > 1 && url.endsWith("/")) {
      url = url.slice(0, -1);
   }

   return url;
}
