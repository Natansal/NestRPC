/**
 * Normalizes a base URL by removing trailing slashes
 */
export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

/**
 * Handles HTTP response and returns parsed data
 */
export async function handleHttpResponse(response: Response): Promise<any> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP ${response.status}: ${response.statusText} - ${errorText}`
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  const txt = await response.text();
  try {
    return JSON.parse(txt);
  } catch {
    return txt;
  }
}

/**
 * Creates the full endpoint URL for an RPC call
 */
export function createEndpointUrl(
  baseUrl: string,
  apiPrefix: string,
  pathSegments: string[]
): string {
  return `${baseUrl}${apiPrefix}/${pathSegments.join("/")}`;
}
