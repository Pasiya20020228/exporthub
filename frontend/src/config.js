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
  if (['1', 'true', 't', 'yes', 'y'].includes(normalised)) {
    return true;
  }
  if (['0', 'false', 'f', 'no', 'n'].includes(normalised)) {
    return false;
  }
  throw new Error(
    `Environment variable expected to be boolean but received ${value}`
  );
}

function buildConfig(env) {
  const source = env || (typeof process !== 'undefined' && process.env
    ? process.env
    : {});

  const requiredVariables = ['FRONTEND_API_BASE_URL'];
  const missing = requiredVariables.filter(
    (name) => !source[name] || String(source[name]).length === 0
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  const portValue = source.FRONTEND_PORT ?? '3000';
  const port = Number(portValue);
  if (Number.isNaN(port)) {
    throw new Error(
      `Environment variable FRONTEND_PORT must be numeric, received ${portValue}`
    );
  }

  return Object.freeze({
    port,
    apiBaseUrl: source.FRONTEND_API_BASE_URL,
    enableAnalytics: parseBoolean(source.FRONTEND_ENABLE_ANALYTICS, false),
    sentryDsn: source.FRONTEND_SENTRY_DSN || null,
  });
}

const config = buildConfig();

module.exports = {
  config,
  buildConfig,
};
