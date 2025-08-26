// Metadata stored on router class
export const ROUTER_METADATA = Symbol("BASE_ROUTE_METADATA");

// Metadata stored on route method
export const ROUTE_METADATA = Symbol("ROUTE_METADATA");

// Method-level: list of parameter resolvers with their parameter indexes
export const RPC_PARAM_RESOLVERS_METADATA = Symbol("RPC_PARAM_RESOLVERS_METADATA");

// Method-level: compiled argument builder function cached for fast execution
export const RPC_ARGS_COMPILER_METADATA = Symbol("RPC_ARGS_COMPILER_METADATA");

// Method-level AND router-level: list of guards to apply to the method (or the entire router)
export const RPC_GUARDS_METADATA = Symbol("RPC_GUARDS_METADATA");
