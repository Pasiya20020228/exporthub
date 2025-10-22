# exporthub

this is like temu...

## Continuous Integration & Delivery

| Workflow | Status | Description |
| --- | --- | --- |
| Lint | [![Lint status](https://github.com/OWNER/exporthub/actions/workflows/lint.yml/badge.svg)](https://github.com/OWNER/exporthub/actions/workflows/lint.yml) | Runs code style checks for frontend and backend projects. |
| Test | [![Test status](https://github.com/OWNER/exporthub/actions/workflows/test.yml/badge.svg)](https://github.com/OWNER/exporthub/actions/workflows/test.yml) | Executes automated tests for backend (Python/NestJS) and frontend applications. |
| Deploy | [![Deploy status](https://github.com/OWNER/exporthub/actions/workflows/deploy.yml/badge.svg)](https://github.com/OWNER/exporthub/actions/workflows/deploy.yml) | Builds and publishes Docker images, then applies infrastructure changes. |

> **Note:** Replace `OWNER` with your GitHub organization or username once the repository is hosted on GitHub so the badges resolve correctly.

### Maintaining the workflows

- **Shared defaults:** Each workflow checks out the repository and prepares Node.js 18 and Python 3.11 environments. Update the versions in `.github/workflows/*.yml` if your runtime requirements change.
- **Dependency caching:** Node dependencies are cached automatically via `actions/setup-node`. Python packages are cached using `actions/cache`; adjust the cache keys if you reorganize requirement files.
- **Linting (`lint.yml`):**
  - Frontend checks run ESLint and Prettier when a `frontend/package.json` file exists. Ensure `npm run lint` and `npm run prettier:check` (or equivalents) are defined to enforce your standards.
  - Backend checks run Python linters (`flake8` and `black`) when Python sources or configuration files exist. NestJS backends can provide `backend/package.json` with a `lint` script to take advantage of the same job.
- **Testing (`test.yml`):**
  - Python projects automatically attempt `python manage.py test` (Django) or `pytest`. Modify the script section if you require different commands.
  - Node projects run `npm test -- --watch=false` when a `test` script is defined. Add Playwright configuration files to publish browser test reports.
- **Deployment (`deploy.yml`):**
  - Triggered on pushes to `main`, published releases, or manual dispatches. Provide `REGISTRY_URL`, `REGISTRY_USERNAME`, and `REGISTRY_PASSWORD` secrets so Docker images can be pushed.
  - Place Dockerfiles under `frontend/` and `backend/` (or adjust the `services` array). Terraform files in `infra/` are applied automatically; deployment scripts in `scripts/deploy*.sh` run afterward.
  - Extend the workflow with environment-specific credential configuration by replacing the `Configure cloud credentials` step.

Keep this section up to date as you add new services or modify the workflow structure so contributors understand how automation is configured.

## Running the backend locally or on Railway

The backend now ships with a lightweight FastAPI application so the project boots cleanly on Railway's default Nixpacks builder.

```bash
# Install dependencies from the repository root
pip install -r requirements.txt

# Run the development server using the shared start script
./start.sh
```

> [!IMPORTANT]
> The service targets Python 3.12. A `.mise.toml` file is included so Railway's builder
> (and local environments that use [mise](https://mise.jdx.dev/)) automatically install
> the compatible runtime. If you manage Python manually, install any 3.12.x release to
> avoid build failures caused by incompatible wheels.

The root-level `requirements.txt` simply re-uses the backend dependency list so the builder can detect Python automatically, while `start.sh` mirrors the production launch command that Railway executes. `Procfile` and `nixpacks.toml` both reference the script, allowing Railway's Railpack builder to identify a supported language and boot the app without additional configuration. The script now also installs/builds the React dashboard automatically when the compiled assets are missing so both backend APIs and the UI are available from a single Railway service.

### Running the frontend locally

The React dashboard lives in the `frontend/` directory. It surfaces the backend's
root and health endpoints and is published automatically during deployments.

```bash
cd frontend
npm install
npm run dev
```

Provide the backend origin via `VITE_FRONTEND_API_BASE_URL` when developing
against a remote backend. By default the dashboard falls back to the current
origin, which works for local development when the Vite dev server proxies to the
backend.

To build the production assets locally run:

```bash
npm run build
```

The Vite configuration writes the build output to `backend/app/static`, which the
FastAPI application serves under `/app`. When those files are present the backend's
root route automatically redirects to `/app`, so visiting your Railway preview domain
will load the dashboard instead of the JSON health payload.

When deploying manually, make sure the following environment variables are configured in your Railway service so the generated defaults can be replaced with production-ready values:

- `BACKEND_PORT`
- `BACKEND_DEBUG`
- `DATABASE_URL`
- `BACKEND_SECRET_KEY`
- `BACKEND_STORAGE_BUCKET`
- `FRONTEND_API_BASE_URL` (only required when running the Vite dev server outside of Railway; the production build falls back to the backend origin automatically)

If any of these are missing, the service will fall back to safe development defaults which keeps deployments healthy while you wire up secrets.

### Connecting to a Railway-hosted PostgreSQL database

ExportHub now bundles an async SQLAlchemy engine that verifies connectivity at startup and exposes a health check that reports the live database status. To connect the backend to Railway's managed PostgreSQL offering:

1. Open the **Variables** tab of your Railway backend service and add the credentials supplied by Railway. At minimum provide:
   - `DATABASE_URL` (use the internal host, e.g. `postgresql://<user>:<password>@postgres.railway.internal:5432/<db>`). If you prefer to keep the default variables Railway injects (`PGHOST`, `PGUSER`, etc.), ExportHub now assembles a connection string automatically when `DATABASE_URL` is absent.
   - `BACKEND_SECRET_KEY`
   - `BACKEND_STORAGE_BUCKET`
2. (Optional) Add `DATABASE_PUBLIC_URL` to mirror Railway's public connection string if you expose the database to other services.
3. Redeploy the backend. During startup the application logs a “Database connection verified” message and the `/healthz` endpoint will return `"database": "connected"` when the connection succeeds.

If the database becomes unreachable, the health endpoint reports `"database": "error"` and the logs contain the underlying exception. This makes it safe to run readiness probes against `/healthz` in production.

### Railway build configuration

`nixpacks.toml` installs Python and Node runtimes, prepares backend
dependencies, builds the React dashboard, and finally boots the FastAPI server via
`start.sh`. No additional Railway configuration is required beyond supplying the
environment variables listed above.
