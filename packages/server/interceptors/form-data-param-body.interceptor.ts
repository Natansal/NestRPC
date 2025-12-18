import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class FormDataParamBodyInterceptor implements NestInterceptor {
   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();

      if (!request.body || !request.body.param) {
         throw new BadRequestException("Missing 'param' field in form-data body");
      }

      try {
         const parsedBody = JSON.parse(request.body.param);

         // Replacement: Swap the raw body with the parsed object
         request.body = parsedBody;
      } catch (error) {
         // Fallback: Return the raw body if it's not JSON
         request.body = request.body.param;
      }

      return next.handle();
   }
}
