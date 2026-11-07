# Intelligent Portfolio Generator

An AI-assisted portfolio builder that turns resume content and manually entered career information into a shareable professional portfolio. The application provides a React editing studio, a Django REST API, Gemini-powered resume parsing and writing assistance, live portfolio previews, and Docker-based local deployment.

> **Repository:** [Balarithik/intelligent-portfolio-generator](https://github.com/Balarithik/intelligent-portfolio-generator)  
> **Default branch:** `main`

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Application Workflows](#application-workflows)
- [API Reference](#api-reference)
- [Testing and Code Quality](#testing-and-code-quality)
- [Docker Deployment](#docker-deployment)
- [Render Deployment](#render-deployment)
- [GitHub Actions CI Pipeline](#github-actions-ci-pipeline)
- [Production Configuration and Security](#production-configuration-and-security)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

The Intelligent Portfolio Generator helps users create and publish a professional portfolio without manually designing a website. Users can enter profile details, work experience, projects, and skills, or import an existing resume. The application extracts structured information from supported resume files, allows the user to edit the extracted details, and displays an immediately updated preview.

The repository is a small monorepo. The GitHub repository root contains documentation and the active GitHub Actions workflow. The actual application is located in the `portfolio-generator/` directory.

### Main application flow

1. A visitor opens the React application.
2. The visitor edits a sample local draft or registers/logs in to save a portfolio to an account.
3. The visitor enters details manually or uploads/pastes resume content.
4. The Django API extracts resume text and asks Gemini to return structured portfolio data. A heuristic parser is used when Gemini is not configured or unavailable.
5. The editor updates the live preview as the user changes profile, experience, projects, skills, or theme.
6. An authenticated user saves the portfolio to the database and can publish it.
7. Published portfolios can be opened through a public URL in the form `/p/<slug>`.

---

## Features

- **Resume import:** Accepts `.txt`, `.pdf`, and `.docx` files, as well as pasted resume text.
- **Structured resume parsing:** Uses the Google Gen AI SDK and Pydantic response schemas to extract profile, experience, projects, and skills.
- **AI writing assistance:** Reworks profile summaries, experience descriptions, and project descriptions with role-aware STAR-style prompts. The service is instructed not to invent metrics or claims.
- **Manual portfolio editing:** Create and update profile details, career history, project descriptions, project links, and skill tags.
- **Live preview:** The preview synchronizes with the editor without requiring a page reload.
- **Responsive preview modes:** Desktop, tablet (768px), and mobile (375px) preview widths.
- **Three portfolio themes:** Minimalist, Executive, and Modern Dev.
- **Account and portfolio management:** Token-based registration/login and per-user portfolio CRUD operations.
- **Public publishing:** Published portfolios are accessible without authentication; unpublished portfolios are not returned by the public API.
- **Local-first draft:** The current editor draft is persisted in browser `localStorage`.
- **Containerized development:** Dockerfiles for the backend and frontend, plus Docker Compose orchestration.
- **Automated checks:** Django tests, Ruff checks, Vitest component tests, and a Vite production build run in GitHub Actions.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, JavaScript |
| Styling and UI | Tailwind CSS, Lucide React |
| Backend | Python 3.12, Django 5, Django REST Framework |
| Authentication | Django REST Framework Token Authentication |
| Database | SQLite with Django JSON fields |
| AI integration | `google-genai` SDK, Gemini model configured through `GEMINI_MODEL`, Pydantic |
| Resume extraction | `pypdf`, `python-docx`, UTF-8 text decoding |
| Python package management | Astral `uv` and `uv.lock` |
| Frontend tests | Vitest, React Testing Library, jsdom |
| Backend tests | Django test runner / DRF API test client |
| Linting | Ruff |
| Containers | Docker, Docker Compose, Nginx, Gunicorn |
| CI | GitHub Actions |
| Hosting guide | Render Web Service for API + Render Static Site for frontend |

The committed frontend Dockerfile and active CI workflow currently use Node.js 20. Node.js 20 reached end of life on **April 30, 2026**. For a new production deployment, upgrade the Docker image and CI runtime together to a maintained LTS version (for example, Node.js 24 or 26), then run the frontend test and build commands before merging. See the [Node.js release schedule](https://github.com/nodejs/Release#release-schedule).

---

## Repository Layout

```text
intelligent-portfolio-generator/
├── .github/
│   └── workflows/
│       └── main.yml                 # Active GitHub Actions workflow
├── docs/
│   └── plan.md                      # Initial implementation plan
├── plan.md                          # Implementation notes and architecture summary
├── README.md                        # Repository-level documentation
├── projects.code-workspace
└── portfolio-generator/             # Actual application root
    ├── .env.example
    ├── .gitignore
    ├── docker-compose.yml
    ├── README.md                    # Application-level README
    ├── .github/workflows/ci.yml     # Nested copy; not auto-discovered by GitHub Actions
    ├── backend/
    │   ├── Dockerfile
    │   ├── pyproject.toml
    │   ├── uv.lock
    │   ├── manage.py
    │   ├── core/
    │   │   ├── settings.py
    │   │   ├── urls.py
    │   │   ├── asgi.py
    │   │   └── wsgi.py
    │   └── portfolio_engine/
    │       ├── models.py
    │       ├── serializers.py
    │       ├── services.py
    │       ├── views.py
    │       ├── urls.py
    │       ├── migrations/
    │       └── tests/
    └── frontend/
        ├── Dockerfile
        ├── nginx.conf
        ├── package.json
        ├── package-lock.json
        ├── vite.config.js
        ├── tailwind.config.js
        ├── postcss.config.js
        ├── index.html
        └── src/
            ├── App.jsx
            ├── main.jsx
            ├── api/client.js
            ├── components/
            │   ├── Editor/
            │   ├── Preview/
            │   ├── Public/
            │   ├── Navbar.jsx
            │   └── SplitWorkspace.jsx
            └── tests/
```

**Important:** Run the local commands below from `portfolio-generator/` unless a command explicitly changes into `backend/` or `frontend/`.

---

## Prerequisites

Install the following tools:

- Git
- Python 3.12 or later in the supported 3.12 series
- [`uv`](https://docs.astral.sh/uv/)
- Node.js and npm (use a maintained LTS version; see the Node.js note above)
- Docker Desktop or Docker Engine with the Docker Compose plugin (for containerized setup)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/) (optional; the backend has a fallback mode)

Check the installations:

```bash
git --version
python --version
uv --version
node --version
npm --version
docker --version
docker compose version
```

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/Balarithik/intelligent-portfolio-generator.git
cd intelligent-portfolio-generator/portfolio-generator
```

### 2. Create the environment file

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Edit `.env` and set your Gemini key if you want live AI functionality. The backend loads this file from the application root (`portfolio-generator/.env`) or from `backend/.env`.

### 3. Start the Django backend

Open a terminal in `portfolio-generator/backend/`:

```bash
uv sync --extra dev
uv run python manage.py migrate
uv run python manage.py runserver 0.0.0.0:8000
```

The backend is available at:

- API base: `http://127.0.0.1:8000/api/`
- Health check: `http://127.0.0.1:8000/api/public/health/`
- Django admin: `http://127.0.0.1:8000/admin/`

To create an administrator account for Django Admin, run this in another backend terminal:

```bash
uv run python manage.py createsuperuser
```

### 4. Start the React frontend

Open a second terminal in `portfolio-generator/frontend/`:

```bash
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The Vite development server proxies `/api` requests to `http://localhost:8000`, so the local frontend can use the default API base URL without additional configuration.

### 5. Stop the development servers

Press `Ctrl + C` in each terminal.

---

## Environment Variables

The sample values are in `portfolio-generator/.env.example`.

| Variable | Purpose | Local example / default |
|---|---|---|
| `DEBUG` | Enables or disables Django debug mode | `True` locally; `False` in production |
| `SECRET_KEY` | Django cryptographic signing key | Development placeholder in `.env.example`; replace for production |
| `ALLOWED_HOSTS` | Comma-separated Django host names | `localhost,127.0.0.1,backend` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins allowed to call the API | Local Vite and localhost origins |
| `GEMINI_API_KEY` | API key used by the Google Gen AI SDK | `your_gemini_api_key_here` |
| `GEMINI_MODEL` | Gemini model identifier | `gemini-3.8-flash` in the current sample configuration |
| `VITE_API_BASE_URL` | Frontend API base URL, embedded during the Vite build | `/api` locally and in Docker Compose |
| `API_UPSTREAM` | Backend URL used by Nginx in the frontend Docker image | Render backend URL by default; Compose overrides it to `http://backend:8000/api/` |

`GEMINI_API_KEY` is optional for local use. If it is missing or Gemini cannot be reached, the backend falls back to heuristic resume parsing and simple bullet formatting. AI output quality and availability will therefore be reduced without a working API key.

The current backend reads `GEMINI_MODEL` from Django settings. The configured sample model is `gemini-3.8-flash`; confirm model availability and quota for your Google AI project before a production release. See the [official Gemini model list](https://ai.google.dev/gemini-api/docs/models).

**Frontend environment note:** `VITE_API_BASE_URL` is a Vite build-time variable. For a Render Static Site, define it in that service's environment settings before the build. The application-root `.env` file is primarily read by Django; the local frontend uses the Vite proxy and defaults to `/api`.

For the frontend Docker image, Nginx reads `API_UPSTREAM` at container startup instead. The image defaults to `https://intelligent-portfolio-generator.onrender.com/api/`; Docker Compose overrides it with `http://backend:8000/api/`. If your Render backend uses a different hostname, set `API_UPSTREAM` to `https://<backend-service>.onrender.com/api/` in the frontend service's environment settings. `VITE_API_BASE_URL` alone does not configure the Nginx proxy in a prebuilt Docker image.

---

## Application Workflows

### Resume import workflow

1. Select **Import Resume** in the editor.
2. Upload a TXT, PDF, or DOCX file, or paste resume text.
3. The backend extracts text from the file when necessary.
4. The AI service maps the content into profile, experience, project, and skill fields.
5. The user reviews and edits the generated fields in the editor.
6. The preview updates as the content changes.

Current backend limits:

- Maximum upload size: 5 MB.
- Maximum extracted/pasted resume text: 100,000 characters.
- Supported upload extensions: `.txt`, `.pdf`, `.docx`.
- Password-protected PDFs and legacy `.doc` files are not supported.

### AI description enhancement workflow

1. The user enters a profile summary, project description, or experience text.
2. The frontend sends the text and target role to `/api/ai/enhance/`.
3. The backend asks Gemini to improve the wording while preserving the original claims and numeric evidence.
4. If Gemini is not configured or the request fails, a simple bullet-format fallback is returned by the backend.

The enhancement endpoint currently limits input to 10,000 characters.

### Save and publish workflow

1. Users can edit a local draft without signing in; the draft is stored in browser `localStorage`.
2. Signing in or registering enables cloud saving through the Django API.
3. The authenticated user can create, list, retrieve, update, and delete their own portfolios.
4. Publishing changes the portfolio's `is_published` status.
5. A published portfolio can be viewed at `/p/<slug>`; unpublished portfolios return `404` through the public endpoint.

The public page is a client-side route. Static hosting must rewrite requests such as `/p/my-portfolio` to `index.html` so React can render the route on a direct visit or refresh.

---

## API Reference

All API endpoints are prefixed with `/api/`.

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `GET` | `/api/public/health/` | Public | Health check for deployment probes |
| `POST` | `/api/auth/register/` | Public | Create an account and return an auth token |
| `POST` | `/api/auth/login/` | Public | Authenticate and return an auth token |
| `GET` | `/api/auth/me/` | Token | Get the current user's profile |
| `PUT` | `/api/auth/me/` | Token | Update the current user's profile |
| `POST` | `/api/ai/parse-resume/` | Public | Parse pasted text or a multipart file upload |
| `POST` | `/api/ai/enhance/` | Public | Improve a description using the AI service |
| `GET` | `/api/portfolios/` | Token | List the authenticated user's portfolios |
| `POST` | `/api/portfolios/` | Token | Create a portfolio |
| `GET` | `/api/portfolios/<slug>/` | Token | Retrieve one of the user's portfolios |
| `PUT` | `/api/portfolios/<slug>/` | Token | Update one of the user's portfolios |
| `DELETE` | `/api/portfolios/<slug>/` | Token | Delete one of the user's portfolios |
| `GET` | `/api/public/portfolio/<slug>/` | Public | Retrieve a published portfolio |

For authenticated requests, send the token in the HTTP header:

```http
Authorization: Token <your-auth-token>
```

### Example: register a user

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"demo-user","email":"demo@example.com","password":"StrongPassword123!","target_role":"Full Stack Developer"}'
```

### Example: parse pasted resume text

```bash
curl -X POST http://127.0.0.1:8000/api/ai/parse-resume/ \
  -H "Content-Type: application/json" \
  -d '{"resume_text":"Jordan Doe\nSoftware Engineer\nSkills\nPython, Django, React"}'
```

### Example: check service health

```bash
curl http://127.0.0.1:8000/api/public/health/
```

---

## Testing and Code Quality

Run commands from the relevant application directory.

### Backend tests

```bash
cd backend
uv sync --extra dev
uv run python manage.py test portfolio_engine.tests --verbosity=2
```

Run Ruff:

```bash
uv run ruff check .
```

### Frontend tests

```bash
cd frontend
npm ci
npm run test:run
```

Run the production build:

```bash
npm run build
```

Run the Vite development server:

```bash
npm run dev
```

**Linting note:** The frontend `package.json` does not currently define a `lint` script or include ESLint. The active GitHub Actions workflow invokes `npm run lint --if-present`, which therefore skips frontend linting until a lint script is added.

---

## Docker Deployment

Docker Compose is the simplest way to run the complete application locally. It builds the Django backend image and the React/Nginx frontend image, then connects them on the default Compose network.

### Start the complete application

From `portfolio-generator/`:

```bash
docker compose up --build -d
```

Open:

- Frontend: [http://localhost](http://localhost)
- Backend API: [http://localhost:8000/api/](http://localhost:8000/api/)
- Health check: [http://localhost:8000/api/public/health/](http://localhost:8000/api/public/health/)

The frontend Nginx configuration proxies `/api/` requests to the Compose service named `backend` on port `8000`. This hostname works inside the Compose network; it is not automatically resolvable when the frontend is deployed as a separate Render service.

### Useful Docker commands

```bash
# Show running containers
docker compose ps

# Follow logs for both services
docker compose logs -f

# Follow backend logs only
docker compose logs -f backend

# Rebuild and restart after code/configuration changes
docker compose up --build -d

# Stop containers but preserve the database volume
docker compose down
```

To remove the database volume as well as the containers, run:

```bash
docker compose down -v
```

**Warning:** `docker compose down -v` deletes the named `backend_data` volume and therefore removes the SQLite database stored by the Compose deployment. Back up data before running it.

### Docker implementation details

- `backend/Dockerfile` uses a multi-stage Python 3.12 image, installs locked dependencies with `uv`, runs database migrations at container startup, and starts Gunicorn on port `8000`.
- `frontend/Dockerfile` builds the Vite frontend and serves the generated `dist/` directory through Nginx on port `80`.
- `frontend/nginx.conf` proxies API calls to `http://backend:8000` and uses `index.html` as the fallback for client-side routes.
- `docker-compose.yml` publishes frontend port `80` and backend port `8000` and mounts `backend_data` at `/app/data` for database persistence between container restarts.

The current Compose file contains a hard-coded example Django secret key. It is suitable only for local development; replace the secret and review all environment settings before adapting Compose for production.

---

## Render Deployment

The recommended Render topology for this repository is:

- **Backend:** Render Web Service using the existing Django Dockerfile.
- **Frontend:** Render Static Site using the Vite build output.

This is preferable to deploying the current Docker Compose stack as one Render service. The frontend Nginx configuration expects a Docker Compose hostname (`backend`), while a Render Static Site calls the backend through its public HTTPS URL.

There is currently no `render.yaml` Blueprint file in the repository, so create the two services manually in the Render Dashboard or add a Blueprint as a separate infrastructure change.

### A. Deploy the Django backend

1. Open the [Render Dashboard](https://dashboard.render.com/) and select **New → Web Service**.
2. Connect the GitHub repository `Balarithik/intelligent-portfolio-generator`.
3. Select the `main` branch.
4. Configure the service:

   | Setting | Value |
   |---|---|
   | Name | `intelligent-portfolio-api` (or your preferred name) |
   | Runtime | Docker |
   | Root Directory | `portfolio-generator/backend` |
   | Dockerfile Path | `Dockerfile` |
   | Docker Build Context | `.` (the backend root directory) |
   | Health Check Path | `/api/public/health/` |

5. Add the following environment variables in the Render service settings. Replace the example hostnames with the real Render service hostnames.

   | Key | Value |
   |---|---|
   | `DEBUG` | `False` |
   | `SECRET_KEY` | Generate a long, random, private value; do not use the repository placeholder |
   | `ALLOWED_HOSTS` | `<backend-service>.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | `https://<frontend-service>.onrender.com` |
   | `GEMINI_API_KEY` | Your Google AI Studio API key |
   | `GEMINI_MODEL` | `gemini-3.8-flash` |
   | `PORT` | `8000` |

   **Port configuration:** The current backend Dockerfile binds Gunicorn to port `8000`. Render's default `PORT` for web services is `10000`, so set the Render service's `PORT` environment variable to `8000` to match the committed Dockerfile. Alternatively, update the Dockerfile to bind to `${PORT:-8000}` and keep the Render default. Render requires web services to bind to `0.0.0.0`.

6. Deploy the service and wait for the health check to pass. Your backend URL will look similar to:

   ```text
   https://intelligent-portfolio-api.onrender.com
   ```

7. Verify the health endpoint:

   ```text
   https://<backend-service>.onrender.com/api/public/health/
   ```

### B. Configure persistent database storage

The current application uses SQLite. The backend Dockerfile creates `/app/data`, and the Django settings use that directory for the SQLite database inside the Linux container.

Render services have an ephemeral filesystem by default. Without persistent storage, local filesystem changes (including the SQLite database) can be lost on deploy or restart.

To preserve the SQLite database:

1. Add a persistent disk to the backend Web Service.
2. Set the mount path to `/app/data`.
3. Keep the disk attached to the backend service.

Render persistent disks are available for paid services. SQLite on a persistent disk is appropriate for a small, single-instance deployment, but it is not the ideal database architecture for a growing multi-instance application. For a larger production deployment, migrate the Django project to PostgreSQL; the repository currently configures SQLite directly and does **not** include PostgreSQL settings or a PostgreSQL dependency.

### C. Deploy the React frontend

1. In the Render Dashboard, select **New → Static Site**.
2. Connect the same GitHub repository and select the `main` branch.
3. Configure the service:

   | Setting | Value |
   |---|---|
   | Name | `intelligent-portfolio-web` (or your preferred name) |
   | Root Directory | `portfolio-generator/frontend` |
   | Build Command | `npm ci && npm run build` |
   | Publish Directory | `dist` |

4. Add this environment variable before the build:

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://<backend-service>.onrender.com/api` |

5. Add a rewrite rule for React client-side routing:

   | Source | Destination | Action |
   |---|---|---|
   | `/*` | `/index.html` | Rewrite (`200`) |

   This ensures that directly opening or refreshing a published route such as `/p/my-portfolio` serves the React application rather than returning a static-hosting `404`.

6. Deploy the Static Site. Its URL will look similar to:

   ```text
   https://intelligent-portfolio-web.onrender.com
   ```

### D. Final CORS and host configuration

After both services are created, verify the environment values on the backend:

```text
ALLOWED_HOSTS=<backend-service>.onrender.com
CORS_ALLOWED_ORIGINS=https://<frontend-service>.onrender.com
```

Include additional comma-separated hostnames/origins if you attach custom domains. Origins must include the scheme (`https://`) and must match the browser origin exactly.

If you change `VITE_API_BASE_URL`, trigger a new frontend build/deploy because Vite embeds `VITE_` variables into the generated static assets at build time.

### E. Automatic deployments

When the services are linked to the GitHub repository, enable **Auto-Deploy** for the `main` branch. Render can then deploy new commits to each service. The backend and frontend are separate Render services and deploy independently.

The GitHub Actions workflow in this repository validates code; it does not currently build/push Docker images, invoke a Render deploy hook, or perform deployment itself. Render's linked-branch auto-deploy is a separate deployment mechanism.

---

## GitHub Actions CI Pipeline

The active workflow is:

```text
.github/workflows/main.yml
```

It runs for pushes and pull requests targeting `main` or `master`.

### Backend job

Runs from `portfolio-generator/backend/`:

1. Checks out the repository.
2. Installs `uv` and Python 3.12.
3. Runs `uv sync --all-extras --dev`.
4. Runs `uv run ruff check .`.
5. Runs the Django test suite with a dummy CI Gemini key.

### Frontend job

Runs from `portfolio-generator/frontend/`:

1. Checks out the repository.
2. Sets up Node.js 20 and npm caching.
3. Runs `npm ci`.
4. Runs `npm run lint --if-present`.
5. Runs `npm run test:run`.
6. Runs `npm run build`.

The backend and frontend jobs run as independent jobs in the same workflow.

### CI workflow observations

- The workflow is a **continuous integration** pipeline. Despite its display name, it does not currently perform a Render deployment or publish a Docker image.
- The repository also contains `portfolio-generator/.github/workflows/ci.yml`. GitHub Actions only discovers workflows under the repository-root `.github/workflows/` directory, so this nested workflow is not automatically executed.
- The frontend `lint` command is currently skipped because no `lint` script is defined in `frontend/package.json`.
- The committed workflow and frontend Dockerfile use Node.js 20. Upgrade both to the same maintained Node.js LTS version before relying on this pipeline for production releases.

### Recommended branch workflow

```text
Feature branch
    │
    ├── Push commit
    │
    ├── Open Pull Request to main
    │       ├── Backend lint + Django tests
    │       └── Frontend tests + production build
    │
    ├── Fix failures and merge after checks pass
    │
    └── Render auto-deploys the updated backend/frontend services
```

For a team project, configure branch protection on `main` and require the CI jobs to pass before merging.

---

## Production Configuration and Security

Before exposing the application to public traffic, review these items:

1. **Django secret:** `core/settings.py` contains a development fallback secret, and the Compose file contains a hard-coded example secret. Always set a unique production `SECRET_KEY` through Render's environment settings or another secret manager.
2. **Debug mode:** Set `DEBUG=False` in production.
3. **Host validation:** Set `ALLOWED_HOSTS` to the backend Render hostname and any custom API domain.
4. **CORS:** Set `CORS_ALLOWED_ORIGINS` to the exact frontend origins. Do not enable `CORS_ALLOW_ALL_ORIGINS` in production.
5. **SQLite persistence:** Use a Render persistent disk mounted at `/app/data` for the existing SQLite implementation. Without it, the database can be lost on deploy/restart.
6. **AI endpoint exposure:** Resume parsing and description enhancement currently use `AllowAny` permissions. They have DRF throttling configured, but they are still publicly callable. Add authentication, stricter abuse controls, quotas, or other safeguards before offering unrestricted public access to a Gemini-backed service.
7. **Uploaded resumes:** Treat uploaded documents and extracted personal data as sensitive. Review retention, logging, access control, and privacy requirements before handling real users' resumes.
8. **Gemini usage:** Keep `GEMINI_API_KEY` only in backend environment variables. Never expose it through a `VITE_` frontend variable or commit it to Git.
9. **Runtime support:** Upgrade Node.js 20 references in the Dockerfile and CI workflow to a maintained LTS release and verify the complete frontend build/test pipeline.
10. **Database growth:** Move to PostgreSQL and update the Django database configuration before scaling beyond a small single-instance SQLite deployment.
11. **Static admin assets:** The current backend settings define `STATIC_ROOT`, but the backend image does not configure WhiteNoise or another static-file server. If Django Admin is part of the production operational workflow, configure static asset collection and serving before relying on its styling.

---

## Troubleshooting

### Frontend cannot reach the API

- Local development: confirm Django is running on port `8000` and that Vite's `/api` proxy is configured.
- Docker Compose: confirm both containers are running with `docker compose ps`; the Nginx proxy expects the service name `backend`.
- Render: check that `VITE_API_BASE_URL` points to the backend URL plus `/api`, and that the backend's `CORS_ALLOWED_ORIGINS` contains the exact frontend origin.

### CORS errors in the browser

Check that the backend environment variable contains the full frontend origin, including `https://`, with no path component. Redeploy/restart the backend after changing environment variables.

### Direct `/p/<slug>` URL returns 404

For Render Static Sites, add the `/*` → `/index.html` rewrite rule with status `200`. React handles the route after the static host returns the application shell.

### Gemini features fall back or return an error

- Confirm `GEMINI_API_KEY` is set on the backend, not the frontend.
- Confirm `GEMINI_MODEL` is an available model for your API project.
- Check API quota, billing/access restrictions, and backend logs.
- The heuristic parser is expected to run when no Gemini client can be initialized or the Gemini call fails.

### Render backend deploy fails or reports a port error

The committed Dockerfile binds Gunicorn to port `8000`. Set the Render service's `PORT` environment variable to `8000`, or update the Dockerfile to use the Render-provided port and redeploy. The server must bind to `0.0.0.0`.

### SQLite data disappears after deployment

Confirm that a persistent disk is attached to the backend service at `/app/data`. Render's default filesystem is ephemeral.

### Docker cannot bind port 80

Another process may already be using port `80`. Stop that process or change the frontend host-side mapping in `docker-compose.yml` (for example, map `8080:80`) and open the new local port.

### Python dependencies are not installed

Run the commands from `portfolio-generator/backend/` and use the committed lockfile:

```bash
uv sync --extra dev
```

### Frontend dependencies or lockfile are out of sync

Run the commands from `portfolio-generator/frontend/`:

```bash
npm ci
npm run test:run
npm run build
```

---

## Useful Links

- [GitHub Repository](https://github.com/Balarithik/intelligent-portfolio-generator)
- [Render Web Services](https://render.com/docs/web-services)
- [Render Docker Deployments](https://render.com/docs/docker)
- [Render Static Sites](https://render.com/docs/static-sites)
- [Render Persistent Disks](https://render.com/docs/disks)
- [Render Monorepo Support](https://render.com/docs/monorepo-support)
- [Google Gemini API Models](https://ai.google.dev/gemini-api/docs/models)
- [Astral uv Documentation](https://docs.astral.sh/uv/)
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## License

No license file was present in the repository when this README was prepared. Add a `LICENSE` file if you intend to publish the project for reuse or distribution, and update this section accordingly.
