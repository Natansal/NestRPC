import axios, { AxiosHeaders } from "axios";
import { RpcRequest } from "../types/rpc-request.type";

export interface SendRequestOptions {
   path: string;
   method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
   body?: RpcRequest;
   overrideHeaders?: Record<string, string>;
}

const HEADERS_TO_EXCLUDE = new Set([
   "host",
   "connection",
   "content-length",
   "expect",
   "upgrade",
   "keep-alive",
   "transfer-encoding",
   "accept-encoding", // let axios handle compression
   "origin",
   "referer",
   "if-modified-since",
   "if-none-match",
]);

export async function sendRequest(req: any, options: SendRequestOptions) {
   // Determine protocol and host
   const protocol = req.protocol || req.raw?.protocol || "http";
   const host = req.get?.("host") || req.hostname || req.headers.host;

   if (!host) {
      throw new Error("Cannot determine host for internal request");
   }

   const url = `${protocol}://${host}${options.path.startsWith("/") ? options.path : "/" + options.path}`;

   // Copy headers safely
   const headers: Record<string, string> = {};
   for (const [key, value] of Object.entries(req.headers || {})) {
      if (value != null && !HEADERS_TO_EXCLUDE.has(key.toLowerCase())) {
         headers[key] = Array.isArray(value) ? value.join(",") : String(value);
      }
   }

   Object.assign(headers, options.overrideHeaders ?? {});

   const response = await axios.request({
      url,
      method: options.method ?? "POST",
      headers: AxiosHeaders.from(headers),
      data: options.body ?? req.body,
      maxRedirects: 0, // avoid internal redirect loops
   });

   return response.data;
}
