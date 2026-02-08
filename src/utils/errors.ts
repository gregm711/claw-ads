export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function parseMetaApiError(err: unknown): string {
  if (err instanceof ApiError && err.body && typeof err.body === "object") {
    const body = err.body as Record<string, unknown>;
    const metaError = body.error as Record<string, unknown> | undefined;
    if (metaError) {
      const code = metaError.code ?? "";
      const subcode = metaError.error_subcode ?? "";
      const msg = metaError.message ?? "Unknown error";
      const userMsg = metaError.error_user_msg;

      if (code === 190)
        return `Authentication error: ${msg}. Check your META_ACCESS_TOKEN.`;
      if (code === 4 || code === 17)
        return `Rate limit hit: ${msg}. Wait a moment and retry.`;
      if (code === 200 || code === 10)
        return `Permission error: ${msg}. Your token may lack required permissions.`;
      if (code === 100)
        return `Invalid parameter: ${userMsg || msg}`;

      return `Meta API error (code ${code}${subcode ? `, subcode ${subcode}` : ""}): ${userMsg || msg}`;
    }
  }

  if (err instanceof ApiError) {
    return `HTTP ${err.statusCode}: ${err.message}`;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return String(err);
}
