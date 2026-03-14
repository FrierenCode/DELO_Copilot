export type SuccessResponse<T> = {
  success: true;
  data: T;
};

export type ErrorResponse = {
  success: false;
  error: { code: string; message: string };
};

export function successResponse<T>(data: T): SuccessResponse<T> {
  return { success: true, data };
}

/**
 * Structured error response.
 *
 * Two call signatures:
 *   errorResponse("PLAN_LIMIT_PARSE_REACHED", "Monthly parse limit reached")
 *   errorResponse("Unauthorized")  ← code defaults to "ERROR" for backward compat
 */
export function errorResponse(code: string, message?: string): ErrorResponse {
  if (message !== undefined) {
    return { success: false, error: { code, message } };
  }
  return { success: false, error: { code: "ERROR", message: code } };
}
