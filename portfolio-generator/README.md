# Intelligent Portfolio Generator

Production-ready, AI-driven portfolio builder powered by Django, React, Tailwind CSS, and Google Gemini Flash with Pydantic Structured Outputs.

---

## Key Features

- **2-Column Split-Workspace**: Instant real-time preview synchronization as you edit profile, experiences, projects, and skills.
- **AI Resume Parsing**: Drop or paste an existing resume to automatically extract structured portfolio sections via Gemini Flash (`parse_resume_text`).
- **STAR-Method Bullet Enhancement**: One-click AI optimization transforming raw project and work experience bullets into high-impact, quantified achievement statements tailored to your target role (`enhance_description`).
- **Responsive Viewport Previews**: Switch seamlessly between Desktop (100%), Tablet (768px), and Mobile (375px) preview frames.
- **Multiple Visual Themes**: Minimalist (Apple aesthetic), Executive (distinguished leadership), and Modern (accent card grids).
- **Public Publishing & Sharing**: Generate unique slugs and share live portfolio URLs.
- **Enterprise DevOps**: Multi-stage Docker builds, docker-compose orchestration, and GitHub Actions CI/CD.

---

## Tech Stack

### Backend
- **Framework**: Python 3.12, Django 5.0+, Django REST Framework (DRF)
- **Database**: SQLite with native `JSONField` support
- **AI SDK**: Official `google-genai` SDK with configurable `gemini-3.8-flash` default & Pydantic structured output validation
- **Package Manager**: Astral `uv` (`pyproject.toml` based)
- **CORS & Auth**: `django-cors-headers`, DRF Token Authentication

### Frontend
- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS adhering strictly to Apple-minimalist design tokens:
  - Slate Background: `#F5F5F7`
  - Dark Charcoal: `#1D1D1F`
  - Border Gray: `#AAAAAA`
  - Accent Blue: `#007AFF`
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library

---

## Directory Structure

```text
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
```

---

## Quickstart

### Prerequisites
- Python 3.12+ and [uv](https://github.com/astral-sh/uv) (or standard pip)
- Node.js 20+ and npm
- Google Gemini API Key (get one from [Google AI Studio](https://aistudio.google.com/))

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your `GEMINI_API_KEY` to the `.env` file.

### 2. Backend Setup
```bash
cd backend
uv sync
uv run python manage.py migrate
uv run python manage.py runserver 0.0.0.0:8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Docker Deployment

To spin up both backend and frontend containers with a single command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost`
- Backend API: `http://localhost:8000/api/`

---

## Running Tests

### Backend Tests
```bash
cd backend
uv run python manage.py test portfolio_engine.tests
```

### Frontend Tests
```bash
cd frontend
npm run test:run
```

