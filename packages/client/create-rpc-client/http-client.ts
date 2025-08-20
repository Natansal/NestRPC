import { BatchResponse } from "@repo/shared";
import { RpcError } from "./rpc-error";

/**
 * 🌐 Execute an HTTP RPC call and return parsed responses.
 *
 * @param endpoint - Fully-qualified URL to the RPC endpoint (includes encoded `calls`).
 * @param body - JSON-serializable request payload.
 * @param fetchOptions - Extra `fetch` options merged into the request.
 * @returns Array of batch item responses.
 */
export async function executeRpcCall(endpoint: string, body: any, fetchOptions: RequestInit): Promise<BatchResponse[]> {
   const { headers, ...rest } = fetchOptions;

   let response: Response;
   try {
      response = await fetch(endpoint, {
         method: "POST",
         headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...headers,
         },
         ...(body !== undefined && { body: JSON.stringify(body) }),
         ...rest,
      });
   } catch (err) {
      // network-level errors (DNS failure, connection refused, timeout)
      throw RpcError.fromFetchError(err);
   }

   // Attempt to parse JSON regardless of status; server typically returns JSON for errors too
   let data: any;
   try {
      data = await response.json();
   } catch (err) {
      throw RpcError.fromInvalidJson(err, response);
   }

   if (!response.ok) {
      // Normalize NestJS error shape to RpcError
      const status = response.status;
      const message = typeof data === "object" && data && "message" in data ? (data.message as any) : undefined;
      throw new RpcError({
         code: status,
         name: "HttpError",
         message: Array.isArray(message) ? message.join(", ") : (message ?? `HTTP ${status}`),
      });
   }

   return data;
}
