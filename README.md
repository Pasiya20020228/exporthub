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

The root-level `requirements.txt` simply re-uses the backend dependency list so the builder can detect Python automatically, while `start.sh` mirrors the production launch command that Railway executes. `Procfile` and `nixpacks.toml` both reference the script, allowing Railway's Railpack builder to identify a supported language and boot the app without additional configuration.

When deploying manually, make sure the following environment variables are configured in your Railway service so the generated defaults can be replaced with production-ready values:

- `BACKEND_PORT`
- `BACKEND_DEBUG`
- `DATABASE_URL`
- `BACKEND_SECRET_KEY`
- `BACKEND_STORAGE_BUCKET`

If any of these are missing, the service will fall back to safe development defaults which keeps deployments healthy while you wire up secrets.
