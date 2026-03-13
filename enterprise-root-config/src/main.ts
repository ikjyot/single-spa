// src/main.ts

// 1. Fetch the external registry dynamically
fetch('/registry.json')
    .then((response) => response.json())
    .then((importMap) => {

        // 2. Inject it as an INLINE import map to satisfy browser security specs
        const mapScript = document.createElement('script');
        mapScript.type = 'importmap';
        mapScript.textContent = JSON.stringify(importMap);
        document.head.appendChild(mapScript);

        // 3. ONLY AFTER the map is injected, dynamically load the Root Config.
        // Vite sees this and automatically knows to bundle root-config.ts!
        return import('./root-config.ts');

    })
    .catch((error) => {
        console.error('Failed to load the MFE registry:', error);
        // In a real enterprise app, we might render a "System Offline" fallback UI here
    });