# Implementation Plan: Intelligent Portfolio Generator

> **Status:** ✅ **COMPLETED (100%)**  
> **Production Codebase:** [`d:\projects\portfolio-generator\`](file:///d:/projects/portfolio-generator/)  
> **Backend:** Django 5.0+, DRF, SQLite JSONField, uv, Google Gemini 2.0 Flash SDK  
> **Frontend:** React 18+, Vite, Tailwind CSS (Apple Minimalist Design Tokens), Lucide Icons  
> **DevOps:** Multi-stage Dockerfiles, Docker Compose, GitHub Actions CI/CD  

---

## 1. System Overview & Technology Stack

- **Backend**: Python 3.12, Django 5.0+, Django REST Framework (DRF), `django-cors-headers`, SQLite with native `JSONField`.
- **Python Package Manager**: Astral `uv` (`pyproject.toml` based).
- **AI Integration**: Official `google-genai` SDK (`gemini-2.0-flash`), Pydantic Structured Output, STAR-method enhancement prompt engineering.
- **Frontend**: React 18+, Vite, Tailwind CSS, Lucide React icons.
- **Design System**: Human-centered, Apple-minimalist aesthetic adhering strictly to `#F5F5F7`, `#1D1D1F`, `#AAAAAA`, `#007AFF`.
- **DevOps**: Docker, multi-stage Dockerfiles, `docker-compose.yml`, and GitHub Actions CI/CD (`.github/workflows/ci.yml`).
- **Testing**: Django `APITestCase` with mocked AI calls, Vitest + React Testing Library for frontend component synchronization.

---

## 2. Directory Structure & Implementation Mapping

All 33 target files and directories have been fully authored and verified:

```text
portfolio-generator/
├── backend/
│   ├── pyproject.toml                     # uv pyproject configuration with python 3.12, django 5.0, google-genai
│   ├── uv.lock                            # uv lock manifest
│   ├── Dockerfile                         # Multi-stage Python 3.12 + uv runtime image
│   ├── .dockerignore                      # Docker ignore rules for backend
│   ├── manage.py                          # Django management entry point
│   ├── core/
│   │   ├── __init__.py
│   │   ├── settings.py                    # CORS, DRF TokenAuth, SQLite & Gemini SDK settings
│   │   ├── urls.py                        # Root urlconf routing /admin/ and /api/
│   │   ├── wsgi.py                        # WSGI entry point for Gunicorn
│   │   └── asgi.py                        # ASGI entry point
│   └── portfolio_engine/
│       ├── __init__.py
│       ├── apps.py                        # PortfolioEngineConfig app definition
│       ├── models.py                      # UserProfile & Portfolio models with auto slug generation
│       ├── serializers.py                 # DRF serializers for Auth, Portfolios & AI endpoints
│       ├── services.py                    # Official google-genai SDK, Pydantic schemas & STAR enhancer
│       ├── views.py                       # REST APIs: Auth, AI Parsing, Enhancing, Portfolios, Public
│       ├── urls.py                        # App route definitions
│       └── tests/
│           ├── __init__.py
│           ├── test_models.py             # UserProfile & Portfolio slug collision unit tests
│           ├── test_views.py              # Auth, permissions, user isolation & endpoint tests
│           └── test_services.py           # Mocked Gemini structured output & fallback tests
├── frontend/
│   ├── Dockerfile                         # Multi-stage Node 20 build + Nginx static asset runner
│   ├── nginx.conf                         # Reverse proxy for /api/ & SPA client fallback routing
│   ├── .dockerignore                      # Frontend docker ignore rules
│   ├── package.json                       # React 18, Vite, Tailwind CSS, Vitest & Lucide icons
│   ├── vite.config.js                     # Vite build & Vitest test runner configuration
│   ├── tailwind.config.js                 # Apple design tokens (#F5F5F7, #1D1D1F, #AAAAAA, #007AFF)
│   ├── postcss.config.js                  # Tailwind & Autoprefixer plugin config
│   ├── index.html                         # Studio HTML shell
│   └── src/
│       ├── index.css                      # Global styles, scrollbar styling & typography
│       ├── main.jsx                       # React DOM entry point
│       ├── App.jsx                        # Application root, auth modal & state management
│       ├── api/
│       │   └── client.js                  # REST API client with Token header & fallback resilience
│       ├── components/
│       │   ├── Navbar.jsx                 # Apple-minimalist header, status indicator & quick publish
│       │   ├── SplitWorkspace.jsx         # 2-column split editor (45%) & live preview (55%)
│       │   ├── Editor/
│       │   │   ├── SectionTabs.jsx        # Pill-style tab navigation
│       │   │   ├── ProfileForm.jsx        # Profile fields with integrated AIEnhanceButton
│       │   │   ├── ExperienceForm.jsx     # Experience CRUD with STAR optimization
│       │   │   ├── ProjectsForm.jsx       # Project showcase with tech tags & live links
│       │   │   ├── SkillsForm.jsx         # Tag-based skill editor with quick-add recommendations
│       │   │   ├── ResumeDropzone.jsx     # Drag & drop / paste resume modal with Gemini parser
│       │   │   └── AIEnhanceButton.jsx    # One-click STAR AI achievement optimizer
│       │   ├── Preview/
│       │   │   ├── ViewportShell.jsx      # Sticky responsive frame container
│       │   │   ├── PortfolioLivePreview.jsx # Minimalist, Executive & Modern theme renderers
│       │   │   └── ResponsiveControls.jsx # Desktop (100%), Tablet (768px), Mobile (375px) toggles
│       │   └── Public/
│       │       └── PublicPortfolioView.jsx # Dedicated public page for published portfolios (/p/:slug)
│       └── tests/
│           ├── setup.js                   # Vitest setup & DOM cleanup
│           └── SplitWorkspace.test.jsx    # Instant live sync, AI enhance & viewport switch tests
├── .github/
│   └── workflows/
│       └── ci.yml                         # Parallel GitHub Actions CI workflow for Backend & Frontend
├── docker-compose.yml                     # Multi-container orchestration (Backend :8000, Frontend :80)
├── .env.example                           # Sample configuration variables
├── .gitignore                             # Monorepo ignore rules for Python, Node & Docker
└── README.md                              # Complete architecture documentation & quickstart
```

---

## 3. Phase 1: Django Backend & AI Services (Complete)

### 3.1. Package Management with uv
- Fully initialized in [`backend/pyproject.toml`](file:///d:/projects/portfolio-generator/backend/pyproject.toml):
  - `django>=5.0,<6.0`
  - `djangorestframework>=3.15`
  - `django-cors-headers>=4.3`
  - `google-genai>=0.1.1`
  - `pydantic>=2.7`
  - `python-dotenv>=1.0`
  - `gunicorn>=22.0.0`
  - Dev dependencies: `pytest-django`, `ruff`

### 3.2. Database Models
- Created in [`backend/portfolio_engine/models.py`](file:///d:/projects/portfolio-generator/backend/portfolio_engine/models.py):
  - **`UserProfile`**: Linked 1:1 with `User`, stores `target_role`, `bio`, and `skills` JSON.
  - **`Portfolio`**: Foreign key to `User`, unique auto-incrementing `slug`, `theme`, `sections_data` native JSON, and `is_published` flag.

### 3.3. Gemini AI Service
- Created in [`backend/portfolio_engine/services.py`](file:///d:/projects/portfolio-generator/backend/portfolio_engine/services.py):
  - Uses official `google-genai` SDK with `gemini-2.0-flash`.
  - Pydantic models: `ParsedExperience`, `ParsedProject`, `ParsedResumeSchema`.
  - `parse_resume_text(resume_text: str)`: Structured output generation mapping directly to portfolio sections.
  - `enhance_description(raw_text: str, target_role: str)`: Executive STAR method prompt engineering producing quantified achievements.
  - Graceful fallback parser and enhancer when offline or running in mock testing environments.

### 3.4. REST API Endpoints
- Implemented in [`backend/portfolio_engine/views.py`](file:///d:/projects/portfolio-generator/backend/portfolio_engine/views.py) and [`backend/portfolio_engine/urls.py`](file:///d:/projects/portfolio-generator/backend/portfolio_engine/urls.py):
  - `POST /api/auth/register/` & `POST /api/auth/login/`: Token-based authentication with automatic profile creation.
  - `GET/PUT /api/auth/me/`: Retrieve and update user profile.
  - `POST /api/ai/parse-resume/`: Resume text or document upload to structured portfolio JSON.
  - `POST /api/ai/enhance/`: STAR bullet optimization tailored to target role.
  - `GET/POST /api/portfolios/`: List and create portfolios for authenticated user.
  - `GET/PUT/DELETE /api/portfolios/<slug>/`: Isolated CRUD by slug.
  - `GET /api/public/portfolio/<slug>/`: Unauthenticated public endpoint (returns 200 for published, 404 for drafts).
  - `GET /api/public/health/`: Container healthcheck probe.

---

## 4. Phase 2: Frontend Architecture & UI/UX (Complete)

### 4.1. Design Tokens & Styling
- Configured in [`frontend/tailwind.config.js`](file:///d:/projects/portfolio-generator/frontend/tailwind.config.js):
  - `bg-slate`: `#F5F5F7`
  - `dark-charcoal`: `#1D1D1F`
  - `border-gray`: `#AAAAAA`
  - `accent-blue`: `#007AFF`
  - Apple font family and subtle card drop shadows (`shadow-apple-subtle`, `shadow-apple-card`).

### 4.2. 2-Column Split Workspace
- Authored in [`frontend/src/components/SplitWorkspace.jsx`](file:///d:/projects/portfolio-generator/frontend/src/components/SplitWorkspace.jsx):
  - **Left Column (45% width, scrollable)**:
    - Title editing, slug badge, Draft/Published status, and publish toggle.
    - Quick action toolbar: `ResumeDropzone` modal for drag-and-drop or copy-pasted resumes.
    - Section navigation tabs: Profile, Experience, Projects, Skills, Theme.
    - Forms: `ProfileForm`, `ExperienceForm`, `ProjectsForm`, `SkillsForm`.
    - `AIEnhanceButton`: Instant STAR optimization directly alongside textarea inputs.
  - **Right Column (55% width, sticky)**:
    - `ResponsiveControls`: Desktop (100%), Tablet (768px), Mobile (375px), and Copy Link.
    - `ViewportShell`: Frames the active preview within responsive constraints.
    - `PortfolioLivePreview`: Instant real-time updates without latency across 3 presentation themes:
      1. **Minimalist**: Clean typography, generous whitespace, subtle lines (Apple aesthetic).
      2. **Executive**: Distinguished corporate layout with classic timeline.
      3. **Modern Dev**: Dark high-contrast styling with terminal-inspired tech badges.
  - **Public View**: `PublicPortfolioView` for standalone access at `/p/:slug`.

---

## 5. Phase 3: Docker & CI/CD Pipeline (Complete)

### 5.1. Dockerization
- [`backend/Dockerfile`](file:///d:/projects/portfolio-generator/backend/Dockerfile): Multi-stage Python 3.12 image using `ghcr.io/astral-sh/uv:latest`, running Gunicorn on port 8000 with automated migration startup.
- [`frontend/Dockerfile`](file:///d:/projects/portfolio-generator/frontend/Dockerfile): Multi-stage Node 20 build producing static artifacts served via Alpine Nginx on port 80.
- [`frontend/nginx.conf`](file:///d:/projects/portfolio-generator/frontend/nginx.conf): Reverse-proxies `/api/` to backend container and provides SPA client-side routing.
- [`docker-compose.yml`](file:///d:/projects/portfolio-generator/docker-compose.yml): Coordinates backend, frontend, volume persistence, and healthchecks.

### 5.2. GitHub Actions CI/CD
- Authored in [`.github/workflows/ci.yml`](file:///d:/projects/portfolio-generator/.github/workflows/ci.yml):
  - **Backend Job**: Python 3.12 setup, uv dependency cache, `uv run ruff check`, and `python manage.py test`.
  - **Frontend Job**: Node 20 setup, npm cache, `npm ci`, Vitest component tests (`npm run test:run`), and production build verification (`npm run build`).

---

## 6. Phase 4: Testing & Verification Strategy (Complete)

### 6.1. Backend Test Suite
- [`backend/portfolio_engine/tests/test_models.py`](file:///d:/projects/portfolio-generator/backend/portfolio_engine/tests/test_models.py): UserProfile creation, slug auto-generation, collision resolution (`slug`, `slug-1`, `slug-2`).
- [`backend/portfolio_engine/tests/test_services.py`](file:///d:/projects/portfolio-generator/backend/portfolio_engine/tests/test_services.py): Mocked Gemini structured output validation and fallback handling.
- [`backend/portfolio_engine/tests/test_views.py`](file:///d:/projects/portfolio-generator/backend/portfolio_engine/tests/test_views.py): User registration, login, portfolio CRUD, user isolation, public vs draft access permissions, and AI endpoints.

### 6.2. Frontend Test Suite
- [`frontend/src/tests/SplitWorkspace.test.jsx`](file:///d:/projects/portfolio-generator/frontend/src/tests/SplitWorkspace.test.jsx):
  - **Live Synchronization**: Verifies typing into `ProfileForm` immediately updates the live preview frame.
  - **Responsive Controls**: Verifies viewport width resizing between desktop, tablet (768px), and mobile (375px).
  - **AI Enhancement**: Verifies clicking `AIEnhanceButton` calls the API and updates state with STAR bullet points.

---

## 7. Execution & Running Instructions

### Running with Docker Compose (Recommended)
```bash
cd d:\projects\portfolio-generator
docker-compose up --build
```
- Open `http://localhost` for the Frontend Studio.
- Access `http://localhost:8000/api/` for the Django REST API.

### Running Backend Locally
```bash
cd d:\projects\portfolio-generator\backend
uv sync
uv run python manage.py migrate
uv run python manage.py test portfolio_engine.tests
uv run python manage.py runserver 0.0.0.0:8000
```

### Running Frontend Locally
```bash
cd d:\projects\portfolio-generator\frontend
npm install
npm run test:run
npm run dev
```
Open `http://localhost:5173` to interact with the studio.

