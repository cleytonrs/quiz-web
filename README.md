# Quiz App - Frontend

Single-page application (SPA) for a quiz platform that allows users to browse quizzes, take timed sessions, view results, and manage quiz content through an admin interface. Built with Angular 21 and communicates with the .NET backend REST API.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 21 (standalone components) |
| Language | TypeScript 5.9 |
| Styling | SCSS (component-scoped) |
| State Management | Angular Signals |
| Forms | Reactive Forms |
| HTTP | HttpClient + functional interceptors |
| Routing | Angular Router (lazy-loaded modules) |
| Testing | Vitest + fast-check (property-based testing) |
| Package Manager | npm 10 |

## Prerequisites

- [Node.js](https://nodejs.org/) v20+ (LTS recommended)
- [npm](https://www.npmjs.com/) v10+
- [Angular CLI](https://angular.dev/tools/cli) v21+
- Backend API running (see `backend/README.md`)

### Installing Angular CLI

```bash
npm install -g @angular/cli
```

## Configuration

### API Proxy

The dev server proxies API requests to the backend. Configuration is in `proxy.conf.json`:

```json
{
  "/api": {
    "target": "https://localhost:7013",
    "secure": false,
    "changeOrigin": true
  }
}
```

- `target` — The backend URL (HTTPS on port 7013 by default)
- `secure: false` — Accepts the development self-signed certificate
- `changeOrigin: true` — Sets the `Host` header to match the target

Change the `target` to match your backend URL. The proxy is automatically used by `ng serve`.

### Environment

No additional environment files are needed for development. The proxy handles API routing transparently — all API calls use relative paths (`/api/...`).

## Getting Started

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Start the development server

```bash
ng serve
```

The application will be available at `http://localhost:4200/`.

> **Note:** The backend API must be running for API calls to work. See `backend/README.md` for setup instructions.

### 3. Build for production

```bash
ng build
```

Build artifacts are output to `dist/quiz-app/`.

## Running Tests

```bash
ng test
```

Tests include:
- **Unit tests** — Components, services, interceptors
- **Property-based tests (fast-check)** — 8 formal correctness properties with 100+ iterations each

### Running specific test files

```bash
npx ng test --include="src/app/admin/**/*.spec.ts" --no-watch
```

## Project Structure

```
frontend/
├── proxy.conf.json              # API proxy configuration
├── angular.json                 # Angular workspace configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── src/
    ├── main.ts                  # Application bootstrap
    ├── styles.scss              # Global styles
    └── app/
        ├── app.ts               # Root component
        ├── app.html             # Root template (navbar + router-outlet)
        ├── app.routes.ts        # Top-level route definitions
        ├── app.config.ts        # Application providers (HTTP, routing, interceptors)
        │
        ├── admin/               # Quiz management module (lazy-loaded, auth-protected)
        │   ├── admin.routes.ts
        │   ├── confirm-dialog/  # Reusable confirmation modal
        │   ├── quiz-form/       # Create/Edit quiz form (reactive forms)
        │   ├── quiz-management-list/  # Quiz list with CRUD actions
        │   └── services/        # QuizAdminService (POST, PUT, DELETE)
        │
        ├── auth/                # Authentication module (lazy-loaded)
        │   ├── auth.routes.ts
        │   ├── login/           # Login page
        │   └── register/        # Registration page
        │
        ├── core/                # Singleton services and infrastructure
        │   ├── guards/          # authGuard (route protection)
        │   ├── interceptors/    # authInterceptor, errorInterceptor
        │   └── services/        # AuthService, NotificationService
        │
        ├── dashboard/           # User dashboard (lazy-loaded, auth-protected)
        │   ├── dashboard.routes.ts
        │   ├── dashboard.component.*
        │   └── services/        # DashboardService
        │
        ├── quiz/                # Quiz-taking module (lazy-loaded, public)
        │   ├── quiz.routes.ts
        │   ├── quiz-list/       # Browse available quizzes
        │   ├── quiz-session/    # Take a quiz (question-by-question)
        │   ├── quiz-result/     # View session results
        │   └── services/        # QuizService, QuizSessionService
        │
        └── shared/              # Shared utilities
            ├── models/          # TypeScript interfaces (DTOs)
            └── components/      # Reusable UI components (toast)
```

## Route Map

| Path | Component | Auth Required | Description |
|------|-----------|---------------|-------------|
| `/quizzes` | QuizListComponent | No | Browse all available quizzes |
| `/quizzes/:id/session` | QuizSessionComponent | No | Take a quiz |
| `/quizzes/:id/result` | QuizResultComponent | No | View quiz result |
| `/auth/login` | LoginComponent | No | User login |
| `/auth/register` | RegisterComponent | No | User registration |
| `/dashboard` | DashboardComponent | Yes | User's quiz history |
| `/admin/quizzes` | QuizManagementListComponent | Yes | Manage quizzes (list) |
| `/admin/quizzes/create` | QuizFormComponent | Yes | Create a new quiz |
| `/admin/quizzes/:id/edit` | QuizFormComponent | Yes | Edit an existing quiz |

## Features

### Public (No Authentication)

- **Browse Quizzes** — View all available quizzes with topic, description, and question count
- **Take Quizzes** — Start a session, answer questions one-by-one, see immediate feedback
- **View Results** — Score percentage, correct/incorrect count, elapsed time, pass/fail (≥70%)
- **Guest Access** — Take quizzes without creating an account

### Authenticated

- **Registration & Login** — JWT-based authentication with email/password
- **Dashboard** — Complete history of all quiz attempts with scores and dates
- **Quiz Management (Admin)** — Full CRUD for quizzes:
  - Create quizzes with multiple questions (4 answer options each, exactly 1 correct)
  - Edit existing quizzes (topic, description, questions, answers)
  - Delete quizzes with confirmation dialog
  - Inline validation errors from the backend
  - Dynamic add/remove questions

### Infrastructure

- **Lazy Loading** — Each module is loaded on demand for fast initial load
- **Route Guards** — Protected routes redirect to login if unauthenticated
- **JWT Interceptor** — Automatically attaches token to all API requests
- **Error Interceptor** — Global error handling (401 → logout, 500 → toast, network → toast)
- **Toast Notifications** — Success/error messages via NotificationService
- **Reactive State** — Angular Signals for component state management
- **Accessibility** — ARIA attributes, focus traps, keyboard navigation in dialogs

## Authentication Flow

1. User registers or logs in → backend returns JWT token
2. Token is stored in `localStorage`
3. `authInterceptor` attaches `Authorization: Bearer <token>` to every request
4. `authGuard` checks `AuthService.isAuthenticated()` for protected routes
5. On 401 response, `errorInterceptor` clears token and redirects to login
6. Token expires after 60 minutes (configurable on backend)

## Correctness Properties (Property-Based Tests)

| # | Property | File | Description |
|---|----------|------|-------------|
| 1 | Quiz List Completeness | `quiz-management-list.properties.spec.ts` | Every quiz renders with topic, description, count, edit/delete buttons |
| 2 | Question Add/Remove Invariant | `quiz-form.properties.spec.ts` | Add → N+1, Remove (N>1) → N-1, Remove (N=1) → blocked |
| 3 | Form Population Round-Trip | `quiz-form.properties.spec.ts` | QuizDetail → form → extract = equivalent data |
| 4 | Deletion Removes Quiz from List | `quiz-management-list.properties.spec.ts` | After delete, list length is N-1 and quiz is absent |
| 5 | Answer Option Structure Invariant | `quiz-form.properties.spec.ts` | Every question always has exactly 4 answer options |
| 6 | Correct Answer Exclusivity | `quiz-form.properties.spec.ts` | setCorrectAnswer → exactly 1 isCorrect=true |
| 7 | Correct Answer Validation | `quiz-form.properties.spec.ts` | Validator rejects count≠1, accepts count=1 |
| 8 | Service Request Correctness | `quiz-admin.service.properties.spec.ts` | Correct HTTP method and URL for create/update/delete |

## Available Scripts

| Command | Description |
|---------|-------------|
| `ng serve` | Start dev server at `http://localhost:4200` with API proxy |
| `ng build` | Production build to `dist/` |
| `ng test` | Run all unit and property tests (Vitest) |
| `ng test --no-watch` | Run tests once without watch mode |
| `ng generate component <name>` | Scaffold a new component |

## Troubleshooting

### API requests return 401 after login

- Check that the backend is running and accessible
- Verify the proxy target in `proxy.conf.json` matches the backend URL
- If using HTTP backend, ensure `UseHttpsRedirection` is disabled in development (causes 307 redirects that strip the Authorization header)

### Tests fail with "Cannot find module"

```bash
npm install
```

### Port 4200 already in use

```bash
ng serve --port 4201
```

### Proxy not working

Ensure `angular.json` has `"proxyConfig": "proxy.conf.json"` under `serve > options`. The proxy only works with `ng serve`, not with production builds.
