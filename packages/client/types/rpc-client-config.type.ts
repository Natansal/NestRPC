import { AxiosInstance, AxiosRequestConfig } from "axios";

export interface RpcClientConfig {
   /**
    * 🌐 Base URL of your server (e.g. `"http://localhost:3000"`).
    */
   baseUrl?: string;
   /**
    * 🛣️ API prefix under which the RPC controller is mounted.
    *
    * - Default (when not provided to the client): "nestjs-rpc"
    */
   apiPrefix?: string;
   /**
    * 🔧 Default `axios` options merged into every request (headers, credentials, signal, etc.).
    *
    * - Default: `{}`
    */
   requestOptions?: AxiosRequestConfig;

   /**
    * 🔧 Axios instance to use for the client.
    *
    * - Default: `axios`
    */
   axiosInstance?: AxiosInstance;
}
