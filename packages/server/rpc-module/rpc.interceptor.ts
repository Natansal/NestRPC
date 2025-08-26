// execution-context.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { asyncStorage } from "./rpc.module";

@Injectable()
export class RpcInterceptor implements NestInterceptor {
   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return asyncStorage.run({ executionContext: context }, () => next.handle());
   }
}
