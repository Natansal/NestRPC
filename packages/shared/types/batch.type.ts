export interface BatchCall {
   id: string;
   input: any;
   path: string;
}

export interface BatchResponse {
   id: string;
   error?: {
      code: number;
      message: string;
   };
   response?: {
      data: any;
   };
}
