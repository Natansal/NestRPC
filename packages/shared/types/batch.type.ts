/**
 * 📩 A single call's payload inside a batch request.
 */
export interface BatchCall {
   /** Unique call identifier used to correlate request/response. */
   id: string;
   /** Arbitrary JSON-serializable input for the invoked method. */
   input: any;
}

/**
 * 📬 Response item corresponding to a `BatchCall`.
 */
export interface BatchResponse {
   /** Identifier matching the originating `BatchCall.id`. */
   id: string;
   /** Present when the call failed on the server or transport. */
   error?: {
      /** HTTP status or custom negative code for client-side failures. */
      code: number;
      /** Human-readable error message. */
      message: string;
      /** Error name/kind. */
      name: string;
   };
   /** Present when the call succeeded. */
   response?: {
      /** Arbitrary JSON-serializable result data. */
      data: any;
   };
}

/**
 * 🧭 Query part of a batch call encoded in the `calls` querystring.
 */
export interface BatchQuery {
   /** Unique call identifier. */
   id: string;
   /** Path segments to the target method (e.g. `["users","get"]`). */
   path: string[];
}

/**
 * 🔗 Convenience type combining the call payload and routing info.
 */
export interface BatchItem extends BatchCall, BatchQuery {}
