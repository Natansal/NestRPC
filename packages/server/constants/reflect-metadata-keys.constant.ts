export const RPC_CONFIG_METADATA = Symbol("RPC_ROUTER_METADATA");

// Base route path stored on a controller class
export const BASE_ROUTE_METADATA = Symbol("BASE_ROUTE_METADATA");

// Method-level: type of RPC method (e.g., query, mutation)
export const RPC_METHOD_TYPE_METADATA = Symbol("RPC_METHOD_TYPE_METADATA");

// Method-level: list of parameter resolvers with their parameter indexes
export const RPC_PARAM_RESOLVERS_METADATA = Symbol("RPC_PARAM_RESOLVERS_METADATA");

// Method-level: compiled argument builder function cached for fast execution
export const RPC_ARGS_COMPILER_METADATA = Symbol("RPC_ARGS_COMPILER_METADATA");
