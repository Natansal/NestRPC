import { createRpcClient } from "client";
import type { RpcApp } from "../../server/src/nest-rpc.config";

/**
 * Creation of the repo for the client
 */
export const rpcRepo = createRpcClient<RpcApp>({
   baseUrl: "http://localhost:3000",
   apiPrefix: "api",
});
