import { PathSymbol, RpcMethod, RpcMethodOptions } from "@nestjs-rpc/client";
import {
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  InvalidateOptions,
  InvalidateQueryFilters,
  NoInfer,
  QueryClient,
  QueryKey,
  UndefinedInitialDataOptions,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useCallback, useMemo } from "react";

// ============================================================================
// SECTION 1: TYPE UTILITIES & HELPERS
// ============================================================================

/**
 * Keys that are automatically handled by the RPC query wrapper
 * and should not be passed directly in options.
 */
type UsedKeys = "queryKey" | "queryFn" | "meta";

/**
 * Additional query key that can be provided as an array or a function
 * that returns an array. The function is called in the hook body, allowing
 * usage of other hooks within it. Used to extend the base query key for
 * more granular cache invalidation.
 */
type AdditionalQueryKey = unknown[] | (() => unknown[]);

/**
 * Determines if a type T is optional (never, void, or explicitly undefined).
 * Used to conditionally make function parameters optional based on the body type.
 *
 * @template T - The type to check
 * @returns true if T is optional, false otherwise
 */
type IsOptional<T> = [T] extends [never]
  ? true
  : [T] extends [void]
    ? true
    : undefined extends T
      ? true
      : false;

/**
 * Base query options type that omits keys handled internally and adds
 * support for additional query keys.
 *
 * @template TOptions - The base React Query options type
 */
type RpcQueryOptions<
  TOptions extends
    | UseQueryOptions<any, any, any, any>
    | DefinedInitialDataOptions<any, any, any, any>
    | UndefinedInitialDataOptions<any, any, any, any>,
> = Omit<TOptions, UsedKeys> & { useAdditionalQueryKey?: AdditionalQueryKey };

// ============================================================================
// SECTION 2: FUNCTION ARGUMENT TYPES
// ============================================================================

/**
 * Standard argument tuple for RPC queries where options are optional.
 * The body parameter is optional if TBody is optional (never/void/undefined).
 *
 * @template TBody - The request body type
 * @template TOpts - The query options type
 */
type RpcArgs<TBody, TOpts> =
  IsOptional<TBody> extends true
    ? [
        body?: TBody,
        options?: TOpts & { rpcOptions?: RpcMethodOptions },
        queryClient?: QueryClient,
      ]
    : [
        body: TBody,
        options?: TOpts & { rpcOptions?: RpcMethodOptions },
        queryClient?: QueryClient,
      ];

/**
 * Argument tuple for RPC queries where options are REQUIRED.
 *
 * @template TBody - The request body type
 * @template TOpts - The query options type
 */
type RpcArgsWithDefinedOptions<TBody, TOpts> =
  IsOptional<TBody> extends true
    ? [
        body: TBody | undefined | void,
        options: TOpts & { rpcOptions?: RpcMethodOptions },
        queryClient?: QueryClient,
      ]
    : [
        body: TBody,
        options: TOpts & { rpcOptions?: RpcMethodOptions },
        queryClient?: QueryClient,
      ];

// ============================================================================
// SECTION 3: INTERFACES & TYPE DEFINITIONS
// ============================================================================

/**
 * Metadata attached to each RPC query for internal use.
 * Contains the RPC path, body, options, and additional query key parts.
 *
 * @template TBody - The request body type
 */
export interface RpcQueryMeta<TBody = unknown> {
  /** The RPC method path (e.g., ['users', 'getById']) */
  path: string[];
  /** The request body passed to the RPC method */
  body: TBody;
  /** Additional RPC-specific options */
  rpcOptions: RpcMethodOptions;
  /** Additional query key parts for cache differentiation */
  additionalQueryKey: unknown[];
  /** Index signature to satisfy React Query's meta type requirement */
  [key: string]: unknown;
}

/**
 * Hook interface for RPC queries with defined initial data.
 *
 * @template TBody - The request body type
 * @template TRet - The RPC method return type
 * @template TFactoryData - The default data type (usually TRet)
 */
export interface RpcQueryHookDefined<TBody, TRet, TFactoryData = TRet> {
  <TData = TFactoryData>(
    ...args: RpcArgsWithDefinedOptions<
      TBody,
      RpcQueryOptions<
        DefinedInitialDataOptions<TRet, AxiosError, TData, QueryKey>
      >
    >
  ): DefinedUseQueryResult<NoInfer<TData>, AxiosError>;

  <TData = TFactoryData>(
    ...args: RpcArgsWithDefinedOptions<
      TBody,
      RpcQueryOptions<UseQueryOptions<TRet, AxiosError, TData, QueryKey>> & {
        initialData: undefined;
      }
    >
  ): UseQueryResult<NoInfer<TData>, AxiosError>;

  <TData = TFactoryData>(
    ...args: RpcArgs<
      TBody,
      RpcQueryOptions<UseQueryOptions<TRet, AxiosError, TData, QueryKey>>
    >
  ): DefinedUseQueryResult<NoInfer<TData>, AxiosError>;
}

/**
 * Hook interface for standard RPC queries.
 *
 * @template TBody - The request body type
 * @template TRet - The RPC method return type
 * @template TFactoryData - The default data type (usually TRet)
 */
export interface RpcQueryHook<TBody, TRet, TFactoryData = TRet> {
  <TData = TFactoryData>(
    ...args: RpcArgsWithDefinedOptions<
      TBody,
      RpcQueryOptions<
        DefinedInitialDataOptions<TRet, AxiosError, TData, QueryKey>
      >
    >
  ): DefinedUseQueryResult<NoInfer<TData>, AxiosError>;

  <TData = TFactoryData>(
    ...args: RpcArgs<
      TBody,
      RpcQueryOptions<UseQueryOptions<TRet, AxiosError, TData, QueryKey>>
    >
  ): UseQueryResult<NoInfer<TData>, AxiosError>;
}

/**
 * 📦 Mutation body type for RPC mutations.
 *
 * Allows passing the request body along with file uploads and RPC options
 * directly in the mutation variables. This provides a cleaner API than
 * passing options separately.
 *
 * For optional body types (void, never, or explicitly undefined), the entire
 * mutation variables can be `undefined`, or you can pass an object with
 * optional `body` property.
 *
 * @template TBody - The request body type from the RPC method
 *
 * @example
 * ```ts
 * // Basic mutation
 * mutation.mutate({ body: { name: 'John', email: 'john@example.com' } });
 *
 * // Single file upload
 * mutation.mutate({
 *   body: { description: 'My file' },
 *   file: fileInput.files[0],
 * });
 *
 * // Multiple files
 * mutation.mutate({
 *   body: { category: 'documents' },
 *   files: Array.from(fileInput.files),
 * });
 *
 * // With custom RPC options
 * mutation.mutate({
 *   body: { name: 'John' },
 *   rpcOptions: { requestOptions: { headers: { 'X-Custom': 'value' } } },
 * });
 *
 * // For methods with no body (void/never)
 * mutation.mutate(); // or mutation.mutate(undefined)
 * ```
 */
export type RpcMutationBody<TBody> =
  IsOptional<TBody> extends true
    ?
        | undefined
        | void
        | {
            body?: TBody | undefined | void;
            file?: RpcMethodOptions["file"];
            files?: RpcMethodOptions["files"];
            rpcOptions?: Omit<RpcMethodOptions, "file" | "files">;
          }
    : {
        body: TBody;
        file?: RpcMethodOptions["file"];
        files?: RpcMethodOptions["files"];
        rpcOptions?: Omit<RpcMethodOptions, "file" | "files">;
      };

/**
 * ⚙️ Options for RPC mutations, extending React Query's UseMutationOptions
 * with RPC-specific features like automatic cache invalidation.
 *
 * All standard React Query mutation options are supported (onSuccess, onError,
 * onMutate, etc.), plus RPC-specific options for cache invalidation and
 * static RPC configuration.
 *
 * @template TBody - The request body type
 * @template TRet - The RPC method return type
 * @template TOnMutateResult - The result type of the onMutate callback
 *
 * @example
 * ```ts
 * const mutation = useRpcMutation(rpc.user.create, {
 *   invalidate: [rpc.user.listUsers], // Auto-invalidate after success
 *   rpcOptions: { requestOptions: { timeout: 30000 } }, // Static options
 *   onSuccess: (data) => console.log('Created:', data),
 *   onError: (error) => console.error('Failed:', error),
 * });
 * ```
 */
export interface RpcMutationOptions<TBody, TRet, TOnMutateResult = unknown>
  extends Omit<
    UseMutationOptions<
      TRet,
      AxiosError,
      RpcMutationBody<TBody>,
      TOnMutateResult
    >,
    "mutationFn"
  > {
  /** Array of RPC routes to invalidate after successful mutation */
  invalidate?: { [PathSymbol]: string[] }[];
  /** Static RPC options applied to all mutations (can be overridden per call via mutation variables) */
  rpcOptions?: Omit<RpcMethodOptions, "file" | "files">;
}

// ============================================================================
// SECTION 4: HELPER FUNCTIONS
// ============================================================================

/**
 * Normalizes additional query key from array or function to array.
 * Handles both default and instance-level additional query keys.
 *
 * @param additionalQueryKey - The additional query key (array or function)
 * @returns Normalized array of query key parts
 */
function normalizeAdditionalQueryKey(
  additionalQueryKey?: AdditionalQueryKey,
): unknown[] {
  if (!additionalQueryKey) {
    return [];
  }
  return Array.isArray(additionalQueryKey)
    ? additionalQueryKey
    : additionalQueryKey();
}

/**
 * Builds the complete additional query key array by merging
 * default and instance-level additional query keys.
 *
 * @param defaultKey - Additional query key from factory defaults
 * @param instanceKey - Additional query key from hook call
 * @returns Combined array of additional query key parts
 */
function buildAdditionalQueryKey(
  defaultKey?: AdditionalQueryKey,
  instanceKey?: AdditionalQueryKey,
): unknown[] {
  const defaultArr = normalizeAdditionalQueryKey(defaultKey);
  const instanceArr = normalizeAdditionalQueryKey(instanceKey);
  return [...defaultArr, ...instanceArr];
}

// ============================================================================
// SECTION 5: QUERY FACTORY & HOOKS
// ============================================================================

/**
 * 🏭 Creates an RPC query hook factory with default options.
 *
 * @overload
 * @template TBody - The request body type
 * @template TRet - The RPC method return type
 * @template TData - The data type (defaults to TRet)
 * @param method - The RPC method with path symbol
 * @param options - Query options
 * @returns A hook function
 *
 * @overload
 * @template TBody - The request body type
 * @template TRet - The RPC method return type
 * @template TData - The data type (defaults to TRet)
 * @param method - The RPC method with path symbol
 * @param options - Query options
 * @returns A hook function
 *
 * @example
 * ```ts
 * const useUserList = createRpcQuery(rpc.user.listUsers, {
 *   staleTime: 60000,
 *   refetchOnWindowFocus: false,
 * });
 *
 * const useUserById = createRpcQuery(rpc.user.getUserById, {
 *   staleTime: 30000,
 * });
 * ```
 */
export function createRpcQuery<TBody, TRet, TData = TRet>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  options: RpcQueryOptions<DefinedInitialDataOptions<TRet, AxiosError, TData>>,
): RpcQueryHookDefined<TBody, TRet, TData>;
export function createRpcQuery<TBody, TRet, TData = TRet>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  options?: RpcQueryOptions<
    UndefinedInitialDataOptions<TRet, AxiosError, TData>
  >,
): RpcQueryHook<TBody, TRet, TData>;
export function createRpcQuery<TBody, TRet, TData>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  defaultOptions: RpcQueryOptions<any> = {},
): any {
  const path = method[PathSymbol];

  /**
   * The actual hook instance that will be returned.
   * This function is called each time the hook is used in a component.
   */
  const useRpcQueryInstance = function (
    body: TBody,
    options: any = {},
    queryClient?: QueryClient,
  ) {
    // Extract RPC-specific options from instance options
    const { rpcOptions, useAdditionalQueryKey, ...queryOptions } = options;

    // Extract RPC-specific options from default options
    const {
      useAdditionalQueryKey: useDefaultAdditionalQueryKey,
      ...restDefaultOptions
    } = defaultOptions;

    // Build combined additional query key from defaults and instance
    const additionalQueryKeyArr = buildAdditionalQueryKey(
      useDefaultAdditionalQueryKey,
      useAdditionalQueryKey,
    );

    // Create metadata for the query (used internally by queryFn)
    const meta: RpcQueryMeta<TBody> = {
      path,
      body,
      rpcOptions: rpcOptions ?? {},
      additionalQueryKey: additionalQueryKeyArr,
    };

    // Build the complete query key: path + body + rpcOptions + additional keys
    // This ensures proper cache differentiation based on all parameters.
    // Queries with different bodies, options, or additional keys will have
    // separate cache entries.
    const queryKey: QueryKey = [
      ...path,
      body,
      rpcOptions,
      ...additionalQueryKeyArr,
    ];

    return useQuery(
      {
        ...restDefaultOptions,
        ...queryOptions,
        queryKey,
        meta: meta as Record<string, unknown>,
        queryFn: async ({ meta: queryMeta }) => {
          // Extract body and rpcOptions from meta (set above)
          // Type assertion is safe because we control the meta structure
          const { body, rpcOptions } =
            queryMeta as unknown as RpcQueryMeta<TBody>;
          const result = await method(body, rpcOptions);
          return result.data;
        },
      },
      queryClient,
    );
  };

  return useRpcQueryInstance;
}

/**
 * 🎣 Direct RPC query hook that can be used without a factory.
 *
 * Convenience wrapper around `createRpcQuery` for one-off usage.
 * Useful when you don't need to create a reusable hook with defaults.
 *
 * @overload
 * @template TBody - The request body type
 * @template TRet - The RPC method return type
 * @template TData - The data type (defaults to TRet)
 * @param method - The RPC method with path symbol
 * @param args - Arguments with required options
 * @returns Query result
 *
 * @overload
 * @template TBody - The request body type
 * @template TRet - The RPC method return type
 * @template TData - The data type (defaults to TRet)
 * @param method - The RPC method with path symbol
 * @param args - Arguments with optional options
 * @returns Query result
 *
 * @example
 * ```ts
 * // One-off query
 * const { data, isLoading } = useRpcQuery(
 *   rpc.user.getUserById,
 *   { id: '123' },
 *   { staleTime: 5000 }
 * );
 *
 * // With options
 * const { data } = useRpcQuery(
 *   rpc.user.listUsers,
 *   undefined,
 *   { refetchInterval: 30000 }
 * );
 * ```
 */
export function useRpcQuery<TBody, TRet, TData = TRet>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  ...args: RpcArgsWithDefinedOptions<
    TBody,
    RpcQueryOptions<
      DefinedInitialDataOptions<TRet, AxiosError, TData, QueryKey>
    >
  >
): DefinedUseQueryResult<NoInfer<TData>, AxiosError>;
export function useRpcQuery<TBody, TRet, TData = TRet>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  ...args: RpcArgs<
    TBody,
    RpcQueryOptions<UseQueryOptions<TRet, AxiosError, TData, QueryKey>>
  >
): UseQueryResult<NoInfer<TData>, AxiosError>;
export function useRpcQuery<TBody, TRet, TData = TRet>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  ...args: any[]
): UseQueryResult<TData, AxiosError> {
  // Memoize the hook factory to avoid recreating it on every render
  // This ensures the hook reference is stable across re-renders
  const useTheQuery = useMemo(() => createRpcQuery(method), [method]);
  const [body, options, queryClient] = args;
  return useTheQuery(body, options, queryClient) as any;
}

// ============================================================================
// SECTION 6: QUERY INVALIDATION
// ============================================================================

/**
 * 🔄 Hook that returns a function to invalidate RPC queries by route path.
 *
 * Useful for invalidating all queries for a specific RPC endpoint.
 * This is particularly helpful for manual cache invalidation or when
 * mutations don't automatically invalidate the queries you need.
 *
 * @returns A callback function to invalidate queries for a given RPC route
 *
 * @example
 * ```ts
 * function UserActions() {
 *   const invalidate = useInvalidateRpcQuery();
 *
 *   const handleRefresh = () => {
 *     invalidate(userService.listUsers);
 *   };
 *
 *   return <button onClick={handleRefresh}>Refresh</button>;
 * }
 * ```
 */
export function useInvalidateRpcQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    (
      rpcRoute: { [PathSymbol]: string[] },
      filters?: Omit<InvalidateQueryFilters<QueryKey>, "queryKey">,
      options?: InvalidateOptions,
    ) => {
      const path = rpcRoute[PathSymbol];
      return queryClient.invalidateQueries(
        {
          queryKey: [...path],
          ...filters,
        },
        options,
      );
    },
    [queryClient],
  );
}

// ============================================================================
// SECTION 7: MUTATION FACTORY & HOOKS
// ============================================================================

/**
 * 🏭 Creates an RPC mutation hook factory with default options.
 *
 * The returned hook can be used in components and supports automatic
 * cache invalidation after successful mutations. File uploads and RPC options
 * can be passed directly in the mutation variables.
 *
 * @template TBody - The request body type
 * @template TRet - The RPC method return type
 * @template TOnMutateResult - The result type of the onMutate callback
 * @param method - The RPC method with path symbol
 * @param defaultOptions - Default mutation options (can include invalidate routes and static rpcOptions)
 * @returns A hook function that accepts mutation options and returns UseMutationResult
 *
 * @example
 * ```ts
 * // Basic usage
 * const useCreateUser = createRpcMutation(userService.create, {
 *   invalidate: [userService.list],
 * });
 *
 * // With static RPC options (applied to all mutations)
 * const useUploadFile = createRpcMutation(fileService.upload, {
 *   invalidate: [fileService.list],
 *   rpcOptions: { requestOptions: { timeout: 30000 } },
 * });
 *
 * // Usage in component
 * const createUser = useCreateUser();
 * createUser.mutate({ body: { name: 'John', email: 'john@example.com' } });
 *
 * // With file upload
 * const uploadFile = useUploadFile();
 * uploadFile.mutate({
 *   body: { description: 'My file' },
 *   file: fileInput.files[0],
 * });
 * ```
 */
export function createRpcMutation<TBody, TRet, TOnMutateResult = unknown>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  defaultOptions: RpcMutationOptions<TBody, TRet, TOnMutateResult> = {},
) {
  /**
   * The generated mutation hook that will be returned.
   *
   * Supports overriding the `onMutate` result type for better type inference.
   * This allows you to specify the type of the context returned from `onMutate`
   * for use in `onError` and `onSettled` callbacks.
   */
  return function useGeneratedRpcMutation<
    TOnMutateResultOverride = TOnMutateResult,
  >(
    options: RpcMutationOptions<TBody, TRet, TOnMutateResultOverride> = {},
  ): UseMutationResult<
    TRet,
    AxiosError,
    RpcMutationBody<TBody>,
    TOnMutateResultOverride
  > {
    const invalidateHook = useInvalidateRpcQuery();

    // Merge default and instance options
    // Type assertion needed to satisfy useMutation's type requirements
    // when overriding the onMutate result type
    const mergedOptions = {
      ...defaultOptions,
      ...options,
    } as RpcMutationOptions<TBody, TRet, TOnMutateResultOverride>;

    // Extract RPC-specific options
    const {
      invalidate: routesToInvalidate,
      rpcOptions: staticRpcOptions,
      ...mutationOptions
    } = mergedOptions;

    return useMutation({
      ...mutationOptions,
      mutationFn: async (variables: RpcMutationBody<TBody>) => {
        // Extract mutation variables (body, files, and RPC options)
        // Handle undefined for optional body types
        const {
          file,
          files,
          rpcOptions: dynamicRpcOptions,
          body,
        } = variables ?? {};

        // Merge static options (from hook) with dynamic options (from mutate call)
        // Dynamic options take precedence over static ones
        const finalRpcOptions = {
          ...staticRpcOptions,
          ...dynamicRpcOptions,
          file,
          files,
        };

        // Call the RPC method with the body and merged options
        const result = await method(body as TBody, finalRpcOptions);
        return result.data;
      },
      onSuccess: async (...args) => {
        // Automatically invalidate specified routes after successful mutation
        // This keeps the cache fresh without manual invalidation
        if (routesToInvalidate?.length) {
          await Promise.all(
            routesToInvalidate.map((route) => invalidateHook(route)),
          );
        }
        // Call user-provided onSuccess callback if present
        if (mutationOptions.onSuccess) {
          return await mutationOptions.onSuccess(...args);
        }
      },
    });
  };
}

/**
 * 🎣 Direct RPC mutation hook that can be used without a factory.
 *
 * Convenience wrapper around createRpcMutation for one-off usage.
 * File uploads and RPC options can be passed directly in the mutation variables.
 *
 * @template TBody - The request body type
 * @template TRet - The RPC method return type
 * @template TOnMutateResult - The result type of the onMutate callback
 * @param method - The RPC method with path symbol
 * @param options - Mutation options (can include invalidate routes and static rpcOptions)
 * @returns UseMutationResult with RpcMutationBody<TBody> as the variables type
 *
 * @example
 * ```ts
 * // Basic usage
 * const mutation = useRpcMutation(userService.create, {
 *   invalidate: [userService.list],
 *   onSuccess: (data) => console.log('Created:', data),
 * });
 * mutation.mutate({ body: { name: 'John', email: 'john@example.com' } });
 *
 * // With file upload
 * const uploadMutation = useRpcMutation(fileService.upload, {
 *   invalidate: [fileService.list],
 * });
 * uploadMutation.mutate({
 *   body: { description: 'My file' },
 *   file: fileInput.files[0],
 * });
 *
 * // With multiple files
 * uploadMutation.mutate({
 *   body: { category: 'documents' },
 *   files: Array.from(fileInput.files),
 * });
 *
 * // With custom RPC options per call
 * mutation.mutate({
 *   body: { name: 'John' },
 *   rpcOptions: { requestOptions: { headers: { 'X-Custom': 'value' } } },
 * });
 * ```
 */
export function useRpcMutation<TBody, TRet, TOnMutateResult = unknown>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  options?: RpcMutationOptions<TBody, TRet, TOnMutateResult>,
): UseMutationResult<
  TRet,
  AxiosError,
  RpcMutationBody<TBody>,
  TOnMutateResult
> {
  // Memoize the mutation factory to avoid recreating it on every render
  // This ensures the hook reference is stable across re-renders
  const useTheMutation = useMemo(
    () => createRpcMutation<TBody, TRet, TOnMutateResult>(method),
    [method],
  );
  return useTheMutation(options as any);
}
