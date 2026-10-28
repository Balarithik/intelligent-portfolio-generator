Implementation Plan
Production Implementation Plan: Intelligent Portfolio Generator
1. System Overview & Technology Stack
Backend: Python 3.12, Django 5.0+, Django REST Framework (DRF), django-cors-headers, SQLite with native JSONField.
Python Package Manager: Astral uv (pyproject.toml based).
AI Integration: Official google-genai SDK (gemini-2.0-flash), Pydantic Structured Output, STAR-method enhancement prompt engineering.
Frontend: React 18+, Vite, Tailwind CSS, Lucide React icons.
Design System: Human-centered, Apple-minimalist aesthetic adhering strictly to #F5F5F7, #1D1D1F, #AAAAAA, #007AFF.
DevOps: Docker, multi-stage Dockerfiles, docker-compose.yml, and GitHub Actions CI/CD (.github/workflows/ci.yml).
Testing: Django APITestCase with mocked AI calls, Vitest + React Testing Library for frontend component synchronization.
2. Directory Structure
text
portfolio-generator/
├── backend/
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── manage.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── portfolio_engine/
│       ├── __init__.py
│       ├── apps.py
│       ├── models.py
│       ├── serializers.py
│       ├── services.py
│       ├── views.py
│       ├── urls.py
│       └── tests/
│           ├── __init__.py
│           ├── test_models.py
│           ├── test_views.py
│           └── test_services.py
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── index.css
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   └── client.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── SplitWorkspace.jsx
│       │   ├── Editor/
│       │   │   ├── SectionTabs.jsx
│       │   │   ├── ProfileForm.jsx
│       │   │   ├── ExperienceForm.jsx
│       │   │   ├── ProjectsForm.jsx
│       │   │   ├── SkillsForm.jsx
│       │   │   ├── ResumeDropzone.jsx
│       │   │   └── AIEnhanceButton.jsx
│       │   ├── Preview/
│       │   │   ├── ViewportShell.jsx
│       │   │   ├── PortfolioLivePreview.jsx
│       │   │   └── ResponsiveControls.jsx
│       │   └── Public/
│       │       └── PublicPortfolioView.jsx
│       └── tests/
│           ├── setup.js
│           └── SplitWorkspace.test.jsx
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
3. Phase 1: Django Backend & AI Services
3.1. Package Management with uv

Initialize uv project with:

django>=5.0,<6.0
djangorestframework>=3.15
django-cors-headers>=4.3
google-genai>=0.1.1
pydantic>=2.7
python-dotenv>=1.0
pytest-django, ruff for dev/testing.
3.2. Database Models (portfolio_engine/models.py)
UserProfile:
user: OneToOneField(User, on_delete=CASCADE, related_name="profile")
target_role: CharField(max_length=255)
bio: TextField(blank=True)
skills: JSONField(default=list)
Portfolio:
user: ForeignKey(User, on_delete=CASCADE, related_name="portfolios")
title: CharField(max_length=255)
slug: SlugField(unique=True, max_length=255)
theme: CharField(max_length=50, default="minimalist")
sections_data: JSONField(default=dict) -> Schema: { "profile": {...}, "experience": [...], "projects": [...], "skills": [...] }
is_published: BooleanField(default=False)
created_at: DateTimeField(auto_now_add=True)
updated_at: DateTimeField(auto_now=True)
3.3. Gemini AI Service (portfolio_engine/services.py)

Using the official google-genai SDK with gemini-2.0-flash:

parse_resume_text(resume_text: str) -> dict:
Pydantic models: ParsedExperience, ParsedProject, ParsedResumeSchema.
Uses client.models.generate_content() with config={'response_mime_type': 'application/json', 'response_schema': ParsedResumeSchema}.
Extracts structured fields: full_name, target_role, summary, skills, experience, projects.
enhance_description(raw_text: str, target_role: str) -> str:
Specific system instructions to apply the STAR method (Situation, Task, Action, Result) with quantified metrics tailored to the target role.
Returns concise, high-impact bullet points without boilerplate or filler phrasing.
3.4. REST API Endpoints (views.py & urls.py)
POST /api/auth/register/ & POST /api/auth/login/: Token/session-based authentication with user profile creation.
POST /api/ai/parse-resume/: Accepts raw text or uploaded document text, returns structured portfolio sections.
POST /api/ai/enhance/: Accepts { "raw_text": "...", "target_role": "..." }, returns { "enhanced_text": "..." }.
GET /api/portfolios/ & POST /api/portfolios/: List and create portfolios for authenticated user.
GET/PUT/DELETE /api/portfolios/<slug>/: Retrieve, update layout JSON, or delete portfolio.
GET /api/public/portfolio/<slug>/: Unauthenticated endpoint returning published portfolio data.
4. Phase 2: Frontend Architecture & UI/UX
4.1. Design Tokens & Styling

Tailwind configuration strictly mapped to:

bg-slate: #F5F5F7
dark-charcoal: #1D1D1F
border-gray: #AAAAAA
accent-blue: #007AFF
Fonts: Crisp system sans-serif (-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif).
Card styles: Crisp white surfaces (#FFFFFF), subtle thin borders (#AAAAAA/20%), delicate shadows, rounded-xl borders.
4.2. 2-Column Split Workspace (SplitWorkspace.jsx)
Left Column (45% width, scrollable):
Header with title, slug preview, status badge (Draft / Published), and Publish button.
Quick action toolbar: Upload / Paste Resume drawer with drag & drop support.
Section navigation tabs: Profile, Experience, Projects, Skills, Theme.
Form sections with input validation and instant state updates.
AIEnhanceButton: One-click button beside text areas displaying loading spinner and smoothly replacing content with STAR-optimized text.
Right Column (55% width, sticky):
Top bar with Viewport Toggle: Desktop (100%), Tablet (768px), Mobile (375px), and Preview Link button.
Live Preview Frame: Renders the active portfolio theme in real-time as state updates without delay.
Support for multiple clean presentation templates (Minimalist, Executive, Modern).
5. Phase 3: Docker & CI/CD Pipeline
5.1. Dockerization
Backend Dockerfile: Multi-stage Python build using ghcr.io/astral-sh/uv:latest, running Django with Gunicorn.
Frontend Dockerfile: Multi-stage Node 20 build producing static artifacts served via high-performance Nginx.
docker-compose.yml: Orchestrates backend (port 8000) and frontend (port 80) with shared networking and environment variables.
5.2. GitHub Actions (.github/workflows/ci.yml)
Backend Pipeline:
Python 3.12 setup + uv cache.
Dependency installation via uv sync.
Code formatting & lint check (ruff).
Unit & Integration test runner (python manage.py test).
Frontend Pipeline:
Node.js 20 setup + npm cache.
npm ci.
Linting (npm run lint).
Component tests (npm run test:run).
Production build verification (npm run build).
6. Phase 4: Testing & Verification Strategy
Backend Tests:
Model tests for UserProfile and Portfolio slug auto-generation.
Authentication endpoint tests (/api/auth/register/, /api/auth/login/).
Portfolio CRUD tests with user isolation and public endpoint permissions.
Mocked Gemini tests for parse_resume_text and enhance_description.
Frontend Tests:
Live synchronization test: Typing into ProfileForm immediately updates the name/bio inside the PortfolioLivePreview container.
AI Enhance button trigger and state mutation test.
Responsive viewport toggle test.
End-to-End Validation:
Verification that both backend and frontend compile with zero errors or warnings.
Verification of Docker build configs.
Confirmation & Approval

Please review this plan. Upon your approval, implementation will start immediately with the backend setup, models, AI services, APIs, followed by frontend UI, Docker setup, and CI/CD.