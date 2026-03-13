Vite & Single-SPA Integration Troubleshooting

When using Vite as the bundler and dev server for a Single-SPA architecture, you may encounter module resolution errors during local development. This happens because Vite's build-time static analysis conflicts with Single-SPA's runtime browser import maps.

Below are the two most common errors and their architectural fixes.
1. The Root Config Entry Point Error

The Error:
Plaintext

Internal server error: Failed to resolve import "@comp/root-config" from "index.html".

The Reason:
Vite reads the index.html file before serving it. If it sees an inline script like <script type="module"> import '@comp/root-config'; </script>, Vite attempts to resolve @comp/root-config immediately by searching node_modules and local directories. Because our dynamic mapping for this exists in registry.json—which is a browser feature executed at runtime—Vite fails to find the module and crashes.

The Fix:
Do not use the import map to load the Root Config itself. Instead, point Vite directly to the local TypeScript file using a standard HTML src attribute. Vite natively understands this and will compile it on the fly.

Update index.html:
HTML

<script type="module" src="/src/root-config.ts"></script>

Also remove @comp/root-config from the registry.json file, as it is no longer needed there.
2. The Dynamic Import Static Analysis Error

The Error:
Plaintext

Pre-transform error: Failed to resolve import "@comp/auth-utility" from "src/root-config.ts".

The Reason:
Vite is incredibly aggressive about statically analyzing code to make the dev server fast. When it sees a hardcoded string literal inside a dynamic import (e.g., import('@comp/auth-utility')), it completely takes over. It attempts to find a local file at that path, panics when it cannot, and throws an error—often ignoring the /* @vite-ignore */ comment entirely.

The Fix (The Variable Trick):
We must hide the hardcoded string from Vite's scanner. By assigning the module name to a variable first, Vite recognizes that it cannot statically determine the string's value at build time. It skips the analysis, leaving the import statement intact for the browser's import map to handle at runtime.

Update src/root-config.ts:
TypeScript

// BAD: Vite statically analyzes the hardcoded string and crashes
registerApplication({
  name: '@comp/auth-utility',
  app: () => import(/* @vite-ignore */ '@comp/auth-utility'),
  activeWhen: ['/'], 
});

// GOOD: Hiding the string in a variable bypasses Vite's scanner
const authUtilityName = '@comp/auth-utility';
registerApplication({
  name: authUtilityName,
  app: () => import(/* @vite-ignore */ authUtilityName),
  activeWhen: ['/'], 
});

(Note: single-spa-layout automatically uses variables for its dynamic imports under the hood, which is why the UI routes do not throw this error).

3. The Dynamic Bootstrapper Pattern (Separation of Concerns)

The Context:
Native browser specifications currently forbid the src attribute on <script type="importmap"> tags for security reasons. While we could fetch the map and inject it directly inside an inline <script> in our index.html, this violates enterprise separation of concerns, pollutes the structural HTML with network logic, and prevents Vite from properly analyzing and minifying the initialization code.

The Enterprise Fix:
We extract all network fetching and DOM injection logic into a dedicated entry point (src/main.ts), keeping index.html strictly for layout structure.

1. The Entry Point (src/main.ts):
TypeScript

// 1. Fetch the external registry dynamically
fetch('/registry.json')
  .then((response) => response.json())
  .then((importMap) => {
    // 2. Inject it as an INLINE import map to satisfy browser security specs
    const mapScript = document.createElement('script');
    mapScript.type = 'importmap';
    mapScript.textContent = JSON.stringify(importMap);
    document.head.appendChild(mapScript);

    // 3. Chain the import so Vite knows to bundle the router
    return import('./root-config.ts');
  })
  .catch((error) => console.error('Failed to load MFE registry:', error));

2. The Clean Shell (index.html):
HTML

<script type="module" src="/src/main.ts"></script>

3. The Vite Config (vite.config.ts):
Update Vite to recognize the new entry point and output the files cleanly.
TypeScript

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'src/main.ts', 
      preserveEntrySignatures: 'strict',
      output: {
        format: 'es',
        entryFileNames: '[name].js' // Outputs main.js and root-config.js
      }
    }
  }
});

4. TypeScript Error TS5097: allowImportingTsExtensions

The Error:
Plaintext

An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.ts(5097)

The Context:
When using explicit file extensions in dynamic imports (e.g., import('./root-config.ts')), older TypeScript configurations will throw an error. Historically, TypeScript assumed it was solely responsible for emitting the final code and worried that leaving .ts in the compiled output would break the browser.

The Enterprise Fix:
In a modern stack, Vite (the bundler) handles resolving and compiling the extensions, not TypeScript. Furthermore, explicit extensions are the standard for ES Modules. We resolve this by updating tsconfig.json to embrace modern bundler resolution rather than removing the extensions from our source code.

Update tsconfig.json:
JSON

{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}

(Note: allowImportingTsExtensions strictly requires "noEmit": true or "emitDeclarationOnly": true to be set, as TS delegates the actual building process entirely to Vite).

5. Routing Strategy: Parameter Handling (Path & Query)
The Context:
When navigating to routes that require specific data parameters (e.g., loading a specific user at /profile?userId=123 or /profile/123), there is often confusion about whether the Root Config or the Microfrontend should parse this URL data.

The Enterprise Pattern (Decentralized URL Parsing):
To maintain strict separation of concerns, the Root Config must remain entirely ignorant of MFE-specific business logic or data requirements.

The Root Config is strictly responsible for prefix matching. The single-spa-layout engine natively treats <route path="profile"> as a wildcard prefix. It will mount the Profile MFE for /profile, /profile?userId=123, and /profile/123.

The Microfrontend is strictly responsible for parameter parsing. Once mounted, the isolated MFE (e.g., using react-router-dom's useSearchParams or useParams) reads the browser's URL natively to extract the required IDs and fetch the corresponding data.

Why we do this: This prevents the Root Config from becoming a tightly coupled bottleneck. If an MFE team decides to alter their internal URL parameter structure, they do not need to coordinate a deployment with the Root Config team.

6. Build Optimization: Cache-Busting the Root Config
The Context:
Microfrontends rely on static URLs defined in registry.json to be located, which often requires disabling file hashing for MFE output bundles. However, the Root Config itself is not loaded via the registry; it is the entry point of the application.

The Enterprise Pattern (Native HTML Resolution):
We do not disable filename hashing for the Root Config. Instead, we rely on Vite's default behavior of using index.html as the build entry point.

How it works:
Vite statically analyzes the index.html file, locates the bootstrapper (<script type="module" src="/src/main.ts">), compiles the TypeScript, generates highly optimized files with cache-busting hashes (e.g., main-8b3a21.js), and automatically injects the exact hashed paths into the final production dist/index.html. This ensures users never receive a stale, cached version of the enterprise shell upon a new deployment.

The Simplified vite.config.ts:

TypeScript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 9000
  }
});
That leaves our Root Config lean, secure, and ready for production cache-busting.

7. MFE Tooling: The React Preamble Crash
The Error:

Plaintext
Uncaught Error: application '@comp/navbar' died in status LOADING_SOURCE_CODE: @vitejs/plugin-react can't detect preamble.
The Context:
The default @vitejs/plugin-react requires an index.html file to inject scripts for Hot Module Replacement (Fast Refresh). Because our Microfrontends are headless modules injected into the Root Config, they lack an HTML file, causing the React plugin to crash during local development.

The Enterprise Pattern (ESBuild Native Compilation):
We absolutely do not pollute the framework-agnostic Root Config shell with React-specific preamble scripts. Instead, we remove the @vitejs/plugin-react dependency entirely from the MFE's vite.config.ts. Vite's underlying ESBuild engine natively compiles .tsx and JSX without requiring the plugin, resulting in a cleaner, faster, and crash-free headless build.

