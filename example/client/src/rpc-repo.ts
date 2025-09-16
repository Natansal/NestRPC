import { RpcClient } from "client";
import type { RpcApp } from "../../server/src/nest-rpc.config";

export const rpcClient = new RpcClient<RpcApp>({
   baseUrl: "http://localhost:3000",
});

export const rpcRepo = rpcClient.routers();
