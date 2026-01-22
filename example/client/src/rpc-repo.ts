import { RpcClient } from "client";
import type { Manifest } from "../../server/src/nest-rpc.config";

/**
 * 🔗 RPC Client instance configured for the example server.
 */
export const rpcClient = new RpcClient<Manifest>({
  baseUrl: "http://localhost:3000",
});

/**
 * 🌳 Root RPC routers proxy.
 */
export const rpc = rpcClient.routers();

/**
 * 👥 User repository with queries and mutations.
 */
export const userRepo = rpc.user;

/**
 * 📁 Files repository for file upload operations.
 */
export const filesRepo = rpc.files;
