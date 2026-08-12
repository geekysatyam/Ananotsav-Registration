export function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;

  // Forward to Lovable editor telemetry when running inside the preview sandbox.
  // These globals are undefined in real production — the fallback below handles that.
  window.__lovableEvents?.captureException?.(error, {
    source: "react_error_boundary",
    route: window.location.pathname,
    ...context
  }, {
    mechanism: "react_error_boundary",
    handled: false,
    severity: "error"
  });
  window.__lovableReportRuntimeError?.({
    message: error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error ? error.message : String(error),
    ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
    filename: window.location.pathname,
  });

  // Production fallback: log to console so errors appear in server/CDN log streams.
  // Replace this block with your real error tracker (e.g. Sentry.captureException).
  if (import.meta.env.PROD) {
    const message = error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error ? error.message : String(error);
    console.error(`[ErrorBoundary] ${message}`, { context, stack: error instanceof Error ? error.stack : undefined });
  }
}