# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Conduit — an Angular 21 implementation of the RealWorld (Medium-style) blogging app. It is used by Bondar Academy as a target app for practicing test automation (e.g. Playwright), so DOM structure, CSS classes and visible text are effectively a public contract for external test suites — avoid changing them gratuitously.

This repo is frontend-only. The backend is the hosted API at `https://conduit-api.bondaracademy.com/api`.

## Commands

- `npm install` — install deps (Node `^20.19.0 || ^22.12.0 || >=24.0.0`)
- `npm start` — dev server at http://localhost:4200 (development config)
- `npm run build` — production build to `dist/angular-conduit/` (budgets: 500kb warn / 1mb error initial; 2kb/4kb per component style)
- `npm test` — Karma/Jasmine via `ng test`. There are currently no `*.spec.ts` files. To run a single spec: `npx ng test --include src/app/path/to/file.spec.ts`
- `npm run lint` — note: no ESLint builder is configured in `angular.json`, so this won't work until one is added.
- Formatting: Prettier runs on staged `ts/html/css/json/md` files via a husky pre-commit hook (`lint-staged`). Code style is double quotes and trailing commas.

## Architecture

Standalone-component app (no NgModules), bootstrapped from `src/main.ts` with `src/app/app.config.ts`.

**HTTP pipeline** (`app.config.ts`, functional interceptors in `core/interceptors/`, applied in order):
1. `apiInterceptor` — prefixes every request URL with the API base URL. Services therefore call relative paths like `/articles` or `/user`; to point at a different backend, change this interceptor.
2. `tokenInterceptor` — adds `Authorization: Token <jwt>` when a token exists.
3. `errorInterceptor` — rethrows `err.error` (the API's `{ errors: {...} }` body), so subscribers receive the payload directly rather than an `HttpErrorResponse`. `shared/components/list-errors.component` renders this shape.

**Auth** (`core/auth/`): the JWT is stored in `localStorage["jwtToken"]` (`JwtService`). `UserService` holds the current user in a `BehaviorSubject` and exposes `currentUser` / `isAuthenticated` observables. An app initializer calls `GET /user` on startup if a token exists (a failure purges auth). Route guards are inline functions in `app.routes.ts` built on `isAuthenticated`. The `*ifAuthenticated` structural directive toggles template blocks by auth state — it exists in duplicate in `core/auth/` and `shared/directives/`; both are in use.

**Routing** (`app.routes.ts`): all pages are lazy-loaded with `loadComponent`/`loadChildren`, which is why page components and route files use `export default`. Profile has nested child routes (`features/profile/profile.routes.ts`) for the articles/favorites tabs. `login` and `register` share `AuthComponent`, which switches mode based on the URL.

**Layout**: `core/` holds app-wide pieces (auth, interceptors, header/footer, shared models); `features/<area>/` holds `pages/`, `components/`, `services/`, `models/` per feature (article, profile, settings); `shared/` holds reusable components, directives, and the `markdown` pipe (uses `marked` to render article bodies).

**Article lists**: `ArticleListComponent` is driven by an `ArticleListConfig` (`type: "all" | "feed"` plus filters like tag/author/favorited/limit/offset) and tracks fetch state with the `LoadingState` enum. Home and the profile tabs reuse it by passing different configs.

State is plain RxJS (observables + `async` pipe, `takeUntilDestroyed` for subscriptions); there is no store library. Templates use the new control-flow syntax (`@if`, `@for`).

## Deployment

`Dockerfile` builds the app and serves `dist/` from nginx on port 8080 (`nginx.conf`). `src/_redirects` provides SPA fallback for Netlify-style hosts.
