/**
 * Typed API error that preserves backend error details.
 *
 * The backend (HttpExceptionFilter) returns these shapes:
 *
 * 1. Validation (400):  { success: false, data: null, message: "Validation failed", errors: string[] }
 * 2. HTTP error (401/404/409/429/500/503): { success: false, data: null, message: string }
 * 3. Soft error (200 OK): { success: false, error: string }  — no `message` field
 */

export type ApiErrorCode =
  | "VALIDATION"        // 400 with errors[]
  | "UNAUTHORIZED"      // 401
  | "FORBIDDEN"         // 403
  | "NOT_FOUND"         // 404
  | "CONFLICT"          // 409
  | "RATE_LIMIT"        // 429
  | "SERVER_ERROR"      // 500
  | "SERVICE_UNAVAILABLE" // 503
  | "SOFT_ERROR"        // 200 with success: false
  | "NETWORK_ERROR"     // fetch failed (offline, DNS, etc.)
  | "UNKNOWN";

export class ApiError extends Error {
  /** Semantic error code */
  readonly code: ApiErrorCode;

  /** HTTP status (0 for network errors) */
  readonly status: number;

  /** Individual validation error messages (only for VALIDATION) */
  readonly validationErrors: string[];

  /** The raw response body from the backend, if available */
  readonly rawBody?: Record<string, unknown>;

  constructor(opts: {
    message: string;
    code: ApiErrorCode;
    status: number;
    validationErrors?: string[];
    rawBody?: Record<string, unknown>;
  }) {
    super(opts.message);
    this.name = "ApiError";
    this.code = opts.code;
    this.status = opts.status;
    this.validationErrors = opts.validationErrors ?? [];
    this.rawBody = opts.rawBody;
  }

  /** Human-friendly message for toasts. Shows validation list if applicable. */
  get userMessage(): string {
    if (this.code === "VALIDATION" && this.validationErrors.length > 0) {
      return this.validationErrors.join("\n");
    }
    if (this.code === "RATE_LIMIT") {
      return "Demasiadas solicitudes. Esperá un momento e intentá de nuevo.";
    }
    if (this.code === "SERVICE_UNAVAILABLE") {
      return "El servicio no está disponible en este momento. Intentá más tarde.";
    }
    if (this.code === "NETWORK_ERROR") {
      return "Error de conexión. Verificá tu internet e intentá de nuevo.";
    }
    if (this.code === "SERVER_ERROR") {
      return "Error interno del servidor. Intentá de nuevo más tarde.";
    }
    return this.message;
  }
}

/** Map HTTP status to ApiErrorCode */
export function statusToErrorCode(status: number): ApiErrorCode {
  switch (status) {
    case 400: return "VALIDATION";
    case 401: return "UNAUTHORIZED";
    case 403: return "FORBIDDEN";
    case 404: return "NOT_FOUND";
    case 409: return "CONFLICT";
    case 429: return "RATE_LIMIT";
    case 503: return "SERVICE_UNAVAILABLE";
    default:
      return status >= 500 ? "SERVER_ERROR" : "UNKNOWN";
  }
}

/** Type guard to check if an error is an ApiError */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Extract a user-friendly message from any error */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.userMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Error desconocido";
}
