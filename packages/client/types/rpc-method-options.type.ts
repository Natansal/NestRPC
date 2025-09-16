import { RpcClientConfig } from "./rpc-client-config.type";

export interface RpcMethodOptions extends Pick<RpcClientConfig, "axiosInstance" | "requestOptions"> {}
