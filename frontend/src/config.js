/**
 * Configuration loader for the ExportHub frontend.
 *
 * The loader reads from the runtime environment and fails fast when required
 * variables are absent. When used with bundlers that expose `import.meta.env`,
 * pass that object to `buildConfig(import.meta.env)`.
 */

function parseBoolean(value, defaultValue) {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  const normalised = String(value).toLowerCase();
  if (["1", "true", "t", "yes", "y"].includes(normalised)) {
    return true;
  }
  if (["0", "false", "f", "no", "n"].includes(normalised)) {
    return false;
  }
  throw new Error(
    `Environment variable expected to be boolean but received ${value}`
  );
}

function resolveSource(env) {
  if (env && typeof env === "object") {
    return env;
  }

  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env;
  }

  if (typeof process !== "undefined" && process.env) {
    return process.env;
  }

  return {};
}

export function buildConfig(env) {
  const source = resolveSource(env);

  const apiBaseUrl =
    source.VITE_FRONTEND_API_BASE_URL ||
    source.FRONTEND_API_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : undefined);

  if (!apiBaseUrl) {
    throw new Error(
      "Missing required environment variables: FRONTEND_API_BASE_URL"
    );
  }

  const portValue = source.VITE_FRONTEND_PORT || source.FRONTEND_PORT || "3000";
  const port = Number(portValue);
  if (Number.isNaN(port)) {
    throw new Error(
      `Environment variable FRONTEND_PORT must be numeric, received ${portValue}`
    );
  }

  return Object.freeze({
    port,
    apiBaseUrl,
    enableAnalytics: parseBoolean(
      source.VITE_FRONTEND_ENABLE_ANALYTICS ??
        source.FRONTEND_ENABLE_ANALYTICS,
      false
    ),
    sentryDsn:
      source.VITE_FRONTEND_SENTRY_DSN || source.FRONTEND_SENTRY_DSN || null,
  });
}

export const config = buildConfig();

export default config;
