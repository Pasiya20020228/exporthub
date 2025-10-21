# Configuration & Secrets Management

This document describes how to manage environment variables and secrets for the ExportHub platform across local development, CI/CD pipelines, and production deployments.

## Overview

The platform is composed of multiple services:

- **Backend** (`backend/`): Python application exposing REST APIs.
- **Frontend** (`frontend/`): JavaScript application consuming backend APIs.
- **Infrastructure** (`infrastructure/`): Terraform, deployment scripts, and automation.

Each service reads configuration from environment variables. Required variables fail fast at startup to prevent partially configured deployments.

## Bootstrapping Local Development

1. Copy the root `.env.template` into a working file:
   ```bash
   cp .env.template .env
   ```
2. Review the comments in `.env.template` and provide values that match your local tooling. The defaults are safe for local development.
3. Generate service-specific `.env` files from the provided examples:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
4. Adjust the copied files if you are using non-default ports, database credentials, or API URLs.
5. When starting services, ensure your process manager loads the `.env` file (e.g., `docker compose`, `poetry run`, `npm run dev`).

## Secrets Management and Rotation

The repository ships with a helper script for retrieving secrets from **AWS Systems Manager Parameter Store**. The same pattern can be adapted to HashiCorp Vault or GitHub Actions secrets by swapping the retrieval command.

### Fetching Secrets from AWS SSM Parameter Store

1. Authenticate with AWS (via SSO, profile, or environment variables).
2. Export the shared configuration variables:
   ```bash
   export AWS_REGION=us-east-1
   export AWS_SSM_PARAMETER_PATH=/exporthub
   ```
3. Run the helper script to render a `.env` file for the desired environment:
   ```bash
   ./infrastructure/scripts/fetch_secrets.sh production backend/.env
   ```
4. The script produces a `.env` file populated with decrypted parameters. Treat the file as sensitive and avoid committing it to Git.

### Rotation Strategy

- Store each secret in SSM Parameter Store (or Vault) under a path that includes the environment name (e.g., `/exporthub/production/BACKEND_SECRET_KEY`).
- Rotate secrets directly in the secret manager. Because applications read secrets from the store at deploy-time, redeploying after rotation picks up new values automatically.
- For long-running services, trigger a restart or rolling deployment to refresh environment variables.

### GitHub Actions and CI/CD Integration

- Mirror the required variables into **GitHub Actions** secrets prefixed with `EXPORTHUB_` (see `.env.template`).
- CI workflows should call the `fetch_secrets.sh` script (or an equivalent action) to hydrate runtime `.env` files before executing build or deploy steps.
- Use repository/environment protection rules to limit who can view or modify the secrets.

## Configuration Loaders

- `backend/app/config.py` reads environment variables with sensible defaults, raising `MissingEnvironmentVariableError` when required values are absent.
- `frontend/src/config.js` validates required variables (`FRONTEND_API_BASE_URL`) and ensures numeric/boolean variables are parsed correctly.
- Integrations should import these modules instead of re-reading environment variables to guarantee consistent validation.

### Database configuration

- `DATABASE_URL` must point to a PostgreSQL or SQLite database. When using PostgreSQL on Railway, prefer the internal hostname (e.g. `postgres.railway.internal`) to avoid SSL negotiation issues.
- The backend automatically upgrades PostgreSQL URLs to the async `asyncpg` driver and runs a `SELECT 1` probe during startup so deployment failures surface immediately.
- Health checks hitting `/healthz` will report `database: connected` once the probe succeeds, otherwise they log the encountered exception and return `database: error`.

## Handling Sensitive Artifacts

- `.gitignore` contains patterns that exclude `.env` files and generated secrets.
- Never commit `.env` files, secret dumps, or Terraform state that includes credentials.
- If a secret leaks, rotate it immediately using the rotation strategy above and invalidate the leaked value.

