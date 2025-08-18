export interface BatchCall {
   id: string;
   input: any;
}

export interface BatchResponse {
   id: string;
   error?: {
      code: number;
      message: string;
      name: string;
   };
   response?: {
      data: any;
   };
}

export interface BatchQuery {
   id: string;
   path: string[];
}

export interface BatchItem extends BatchCall, BatchQuery {}
