/**
 * 🔧 Normalize a base URL by removing trailing slashes
 *
 * @param baseUrl - 🌐 The base URL to normalize
 * @returns 🧼 The URL without a trailing slash
 */
export function removeTrailingSlash(baseUrl: string): string {
   return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

/**
 * 🔧 Normalize a base URL by removing trailing slashes
 *
 * @param baseUrl - 🌐 The base URL to normalize
 * @returns 🧼 The URL without a trailing slash
 */
export function removeLeadingSlash(baseUrl: string): string {
   return baseUrl.startsWith("/") ? baseUrl.slice(1, 0) : baseUrl;
}
