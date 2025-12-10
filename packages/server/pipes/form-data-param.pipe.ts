import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class FormDataParamPipe implements PipeTransform {
   transform(value: any) {
      if (!value?.param) {
         throw new BadRequestException("Missing 'param' field in form data");
      }

      try {
         return JSON.parse(value.param);
      } catch {
         // fallback: return as string if not JSON
         return value.param;
      }
   }
}
