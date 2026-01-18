export async function initTelemetry() {
  // Telemetry is disabled - Sentry packages not installed
  // To enable, install @sentry/browser and @sentry/tracing, then add VITE_SENTRY_DSN to .env
  console.log('Telemetry: Initialization skipped (Sentry not configured)')
  return Promise.resolve()
}
