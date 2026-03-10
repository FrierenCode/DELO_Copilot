import "server-only";

/**
 * Thin Sentry wrapper.
 * No-op when SENTRY_DSN is not configured.
 * Never logs raw user input or LLM output.
 */

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!process.env.SENTRY_DSN) return;
  import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.captureException(error, context ? { extra: context } : undefined);
    })
    .catch(() => {});
}

export function captureMessage(
  message: string,
  context?: Record<string, unknown>,
): void {
  if (!process.env.SENTRY_DSN) return;
  import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.captureMessage(message, { extra: context });
    })
    .catch(() => {});
}
