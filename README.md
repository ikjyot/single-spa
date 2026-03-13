# Micro-Frontend Architecture Blueprint: Monolith to Single-SPA

## 1. Executive Summary
This document outlines the architecture for migrating our enterprise application to a Micro-Frontend (MFE) architecture using Single-SPA. The design prioritizes high team autonomy (multi-repo), strict TypeScript usage, decoupled RxJS state, RBAC security, and dynamic UI orchestration powered by `single-spa-layout` and Vite.

## 2. Core Architecture: Single-SPA Root Config & Layout Engine
The orchestrator is a lightweight shell containing the layout definitions and the module registry.
* **Vite HTML-First Resolution:** By default, Vite looks for `index.html` first and treats it as the application's true entry point and module graph root, completely eliminating the need for complex custom Rollup entry configurations.
* **Declarative Routing (`single-spa-layout`):** The Root Config uses an HTML template to define the DOM structure and routes. UI components swap dynamically based on URL paths (`<route>`), while layout elements persist.
* **Dynamic Bootstrapper:** Referenced directly in the `index.html`, the Root Config entry point (`main.ts`) dynamically fetches the external `registry.json` and injects it to satisfy strict browser security policies before loading the layout engine.
* **Externalized Assets:** Layout styling is decoupled into external CSS files.
* **Localized Framework Bundling:** Each UI MFE bundles its own required version of React using Vite.

## 3. Repositories & Local Development (Dual-Mode Execution)
* **Isolated Codebases:** Every UI app, utility, and shared library lives in its own Git repository.
* **Vite Local Overrides:** Developers use in-browser overrides to route a specific module to their local Vite server.
* **Local Boot Orchestration (DX):** To maintain Dev/Prod parity, the Root Config *does not* contain local-only polling or auto-reloading logic for sleeping MFEs. Instead, developers boot the required MFE ecosystem simultaneously using workspace orchestrators (e.g., `concurrently`), and eventually Kubernetes-native local tools like **Tilt** or **Skaffold**.
* **Dual-Mode Execution:** To guarantee high developer velocity, MFEs must run in two modes:
    a. Integrated Mode: Headlessly loaded by the Root Config layout engine.
    b. Standalone Mode: Run in isolation (e.g., localhost:8083) via a local index.html file, allowing teams to develop with full Vite Hot Module Replacement (HMR) without booting the enterprise shell.

## 4. Performance-First Shared UI (Design System)
* A tree-shakable, framework-agnostic Design System compiled as ES Modules with `"sideEffects": false`.

## 5. Reactive State Management & Event Bus (RxJS)
* **State Utility MFE (`@comp/global-store`):** Manages cross-app data via RxJS `BehaviorSubjects`.

## 6. Security: Authentication & Authorization (RBAC)
* **Auth Utility MFE (`@comp/auth`):** Exposes an RxJS stream of user permissions for granular component-level guarding.

## 7. Infrastructure: Kubernetes CI/CD Deployment
* CI pipelines build versioned Vite bundles, push to NGINX pods, and update the live `registry.json`.

---

## Architectural Decisions & Implementation Details

### Routing Strategy: Parameter Handling (Path & Query)
To maintain strict separation of concerns, the Root Config remains entirely ignorant of MFE-specific business logic or data requirements. 
* **The Root Config** handles prefix matching via `single-spa-layout`.
* **The Microfrontend** parses the parameters natively once mounted (e.g., using React Router's `useSearchParams`). This allows MFE teams to alter their URL structures without coordinating Root Config deployments.

### Routing Strategy: Cross-MFE Navigation
**The Context:** Using standard HTML anchor tags (`<a href="...">`) or even framework-specific routing links (like React Router's `<Link>`) for navigating *between* different Microfrontends will trigger a full browser reload, destroying the SPA shell and global state.
**The Enterprise Pattern:** Cross-MFE links must utilize Single-SPA's native routing interceptor. By adding `onClick={navigateToUrl}` (imported from `single-spa`) to standard anchor tags, we prevent the default browser refresh and trigger a client-side layout swap, preserving headless utility state (like RxJS sessions) perfectly in memory.

### TypeScript Module Resolution (TS5097)
Because Vite handles bundling and resolution, `tsconfig.json` is configured with `"moduleResolution": "bundler"` and `"allowImportingTsExtensions": true` to support native ES Module file extensions without throwing TypeScript compilation errors.

### Build Optimization: Cache-Busting the Root Config
**The Context:** Unlike the UI Microfrontends (which require static filenames to be located by the `registry.json`), the Root Config is the absolute entry point of the application and requires cache-busting hashes for production deployments.
**The Enterprise Pattern:** We completely remove custom Rollup input configurations from the Root Config's `vite.config.ts`. By relying on Vite's default behavior, Vite statically analyzes `index.html`, bundles the TypeScript, and automatically generates secure, hashed filenames (e.g., `main-8b3a21.js`) injected back into the production HTML.
*Root Config `vite.config.ts`:*
```typescript
import { defineConfig } from 'vite';

// We omit custom Rollup inputs to allow Vite's default HTML entry point 
// to automatically handle production hashing and cache-busting.
export default defineConfig({
  server: {
    port: 9000
  }
});
```

### MFE Tooling: Vite + React HMR Resolution
**The Context:** Native Vite React plugins inject a Fast Refresh preamble into the DOM. Because MFEs lack an `index.html` when loaded by the Root Config, the `@vitejs/plugin-react` will crash the application natively looking for this preamble.
**The Enterprise Pattern (The DX Compromise):** While we strive for a framework-agnostic shell, we prioritize Developer Experience (HMR). We retain `vite-plugin-single-spa` and `@vitejs/plugin-react` in the MFE for full standalone HMR. To prevent integration crashes, we inject a dev-only React Fast Refresh preamble script directly into the Root Config's `index.html`. This script satisfies the MFE's checks during local development and is excluded from production builds.

### Cross-MFE Imports (RxJS Event Bus)
**The Context:** When one MFE imports a module from another (e.g., an RxJS state stream), Vite's local dev server will crash during import analysis because the module does not exist in local `node_modules`. 
**The Enterprise Pattern:** We apply a two-pronged externalization strategy. 
1. `build.rollupOptions.external` prevents the module from being bundled in production.
2. `vite-plugin-externalize-dependencies` forces the Vite Dev Server to ignore the bare import locally, allowing the browser's Import Map to correctly resolve the utility module at runtime.

### Design System: Centralized shadcn/ui & Tailwind Scoping
**The Context:** `shadcn/ui` and Tailwind CSS natively encourage copying source code and generating global utility classes. In a Single-SPA environment, this leads to visual drift and severe CSS class collisions when multiple MFEs mount simultaneously in the DOM.
**The Enterprise Pattern:** We strictly forbid running the `shadcn` CLI in individual MFE repositories. Instead, we centralize all UI components in a dedicated `@comp/design-system` module. 
1. **Tailwind Prefixing:** The design system's Tailwind configuration must use a strict prefix (e.g., `prefix: 'ds-'`) to guarantee global CSS isolation.
2. **Consumption:** MFEs consume these components as externalized ES Module imports (e.g., `import { Button } from '@comp/design-system'`) resolved via the browser's Import Map at runtime, guaranteeing a single source of truth for enterprise styling.
3. **The Customization Contract (`className` Merging):** To maintain visual consistency while allowing contextual layout flexibility, MFE teams must not use aggressive standard CSS overrides (e.g., `!important` tags on colors or borders). Instead, the Design System exposes a controlled `className` prop on all components using `tailwind-merge`. MFE teams pass layout-specific classes (e.g., margins, widths, grid placement) via this prop, which safely merges with the enterprise base styles without causing visual drift.

#### Shadcn CLI Integration with Vite 7
**The Context:** Modern Vite templates split TypeScript configuration into `tsconfig.app.json` (browser) and `tsconfig.node.json` (build). The `shadcn` CLI's static analysis fails if it cannot find the `@/` path alias directly in the root `tsconfig.json`.
**The Enterprise Pattern:** 1. Define the `"paths": { "@/*": ["./src/*"] }` alias in `tsconfig.app.json` for compilation.
2. Duplicate the exact same alias block into the root `tsconfig.json` purely to satisfy the CLI's preflight checks.
3. Define the alias resolution in `vite.config.ts` using `path.resolve`.
4. After `shadcn init`, strictly enforce the `"prefix": "ds:"` property in `components.json` before adding any components.

#### Tailwind v4 Strict Prefixing & `@apply`
**The Context:** When initializing `shadcn/ui`, the CLI automatically generates a global `@layer base` block inside `index.css` to establish default theme styles (e.g., `body { @apply bg-background text-foreground; }`). 
**The Enterprise Pattern:** Because Tailwind v4 strictly enforces our `ds:` prefix namespace, the compiler will instantly crash when it reads these unprefixed `@apply` directives. After running `shadcn init`, you must manually edit `index.css` and append the enterprise prefix to every utility class within the base layer (e.g., `body { @apply ds:bg-background ds:text-foreground; }`) to satisfy the compiler and maintain global isolation.