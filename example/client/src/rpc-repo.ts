import { RpcClient } from "client";
import type { Manifest } from "../../server/src/nest-rpc.config";

export const rpcClient = new RpcClient<Manifest>({
   baseUrl: "http://localhost:3000",
});

export const rpc = rpcClient.routers();
export const userRepo = rpc.user;
