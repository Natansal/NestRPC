import {
   BadRequestException,
   Body,
   Controller,
   HttpException,
   LoggerService,
   NotFoundException,
   Post,
   Query,
   Req,
} from "@nestjs/common";
import { sendRequest } from "../functions/send-request.function";
import { routeToUrlPath } from "../functions/route-to-url-path";
import { BatchCall, BatchResponse, ClassType, decodeBatchQuery, NestRpcRouterConfig } from "@repo/shared";
import { AxiosError } from "axios";

interface RpcControllerProps {
   apiPrefix: string;
   logger: LoggerService;
   routes: NestRpcRouterConfig;
}

export function createDynamicController(props: RpcControllerProps) {
   const { apiPrefix, routes, logger } = props;
   @Controller(apiPrefix)
   class RpcController {
      @Post()
      async handleRequest(@Body() body: BatchCall[], @Req() req: any, @Query("calls") rawCalls: string) {
         if (typeof body === "undefined") {
            throw new BadRequestException(
               "RPC handler received empty or undefined body. Please ensure a valid body is sent.",
            );
         }

         const calls = decodeBatchQuery(rawCalls);

         if (calls.length === 0) {
            logger.warn("Got empty batch request");
            return [];
         }

         if (body.length !== calls.length) {
            throw new BadRequestException("RPC handler received body and calls length mismatch");
         }

         const results: BatchResponse[] = [];

         await Promise.all(
            body.map(async (bodyCall, i) => {
               const queryCall = calls.find((call) => call.id === bodyCall.id);

               if (!queryCall) {
                  throw new BadRequestException(
                     `RPC handler did not receive a queryCall with id ${bodyCall.id} in the body.`,
                  );
               }

               await Promise.all(
                  body.map(async (bodyCall, i) => {
                     const queryCall = calls.find((call) => call.id === bodyCall.id);

                     if (!queryCall) {
                        results[i] = {
                           id: bodyCall.id,
                           error: {
                              code: 400,
                              message: `RPC handler did not receive a queryCall with id ${bodyCall.id} in the body.`,
                              name: "BadRequestException",
                           },
                        };
                        return;
                     }

                     const { id, input } = bodyCall;
                     const { path } = queryCall;

                     try {
                        const { router, methodName } = this.getRouterAndMethodNameFromPath(path);
                        const url = routeToUrlPath(router, methodName);

                        if (!url) throw new BadRequestException("RPC handler got a non-route path as a method");

                        const response = await sendRequest(req, {
                           path: url,
                           body: { param: input },
                           method: "POST",
                        });

                        results[i] = {
                           id,
                           response: {
                              data: response,
                           },
                        };
                     } catch (e: any) {
                        // Axios errors
                        if (e instanceof AxiosError) {
                           results[i] = {
                              id,
                              error: {
                                 code: e.response?.status ?? e.code ?? e.response?.data.code ?? 500,
                                 message: e.response?.data?.message ?? e.message ?? e.response?.data,
                                 name: e.response?.data?.name ?? e.name ?? "AxiosError",
                              },
                           };
                        } else if (e instanceof HttpException) {
                           // NestJS HttpException (BadRequestException, NotFoundException, etc.)
                           results[i] = {
                              id,
                              error: {
                                 code: e.getStatus(),
                                 message: e.message,
                                 name: e.name ?? "HttpException",
                              },
                           };
                        } else {
                           // Unknown error
                           results[i] = {
                              id,
                              error: {
                                 code: 500,
                                 message: e?.message ?? JSON.stringify(e),
                                 name: e?.name ?? "UnknownError",
                              },
                           };
                        }
                     }
                  }),
               );
            }),
         );

         return results;
      }

      memoizedRouterAndMethodName: Map<string, ReturnType<typeof this.getRouterAndMethodNameFromPath>> = new Map();

      getRouterAndMethodNameFromPath(_path: string[]): { router: ClassType<any>; methodName: string } {
         const existing = this.memoizedRouterAndMethodName.get(_path.join("."));

         if (existing) return existing;

         const path = [..._path];
         const methodName = path.pop();

         if (!methodName) {
            throw new NotFoundException("RPC handler did not receive a method name in the path.");
         }

         let pointer: any = routes;

         for (let i = 0; i < path.length; i++) {
            const segment = path[i]!;
            pointer = pointer[segment];

            if (!pointer) {
               throw new NotFoundException(`RPC handler did not find a route segment '${segment}' in the path.`);
            }
         }

         const method = pointer.prototype[methodName];

         if (!method) {
            throw new NotFoundException(
               `RPC handler did not find a method '${methodName}' in the router or it is not decorated with @Route.`,
            );
         }

         const result = {
            router: pointer,
            methodName,
         };

         this.memoizedRouterAndMethodName.set(_path.join("."), result);

         return result;
      }
   }

   return RpcController;
}
