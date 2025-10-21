import config from "../config.js";

const normalisedBaseUrl = config.apiBaseUrl.replace(/\/$/, "");

async function request(path) {
  const response = await fetch(`${normalisedBaseUrl}${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request to ${path} failed: ${response.status} ${body}`);
  }

  return response.json();
}

export function fetchBackendRoot() {
  return request("/");
}

export function fetchBackendHealth() {
  return request("/healthz");
}

export default {
  fetchBackendRoot,
  fetchBackendHealth,
};
