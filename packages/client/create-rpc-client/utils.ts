/**
 * 🔧 Normalize a base URL by removing trailing slashes
 *
 * @param baseUrl - 🌐 The base URL to normalize
 * @returns 🧼 The URL without a trailing slash
 */
export function normalizeBaseUrl(baseUrl: string): string {
   return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}
