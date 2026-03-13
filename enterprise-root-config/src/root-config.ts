import { registerApplication, start } from 'single-spa';
import {
    constructApplications,
    constructRoutes,
    constructLayoutEngine,
} from 'single-spa-layout';

// 1. Assign the string to a variable so Vite can't statically analyze it
const authUtilityName = '@comp/auth-utility';

// 2. Register the application using the variable. Background Utilities (No UI, loads on all routes)
registerApplication({
    name: authUtilityName,
    app: () => import(/* @vite-ignore */ authUtilityName),
    activeWhen: ['/'],
});

// 3. Parse the HTML Layout Template
const layoutTemplate = document.querySelector('#single-spa-layout') as HTMLTemplateElement;
const routes = constructRoutes(layoutTemplate);

// 4. Construct the UI Applications
const applications = constructApplications({
    routes,
    loadApp: ({ name }) => import(/* @vite-ignore */ name),
});

// 5. Create the Layout Engine
const layoutEngine = constructLayoutEngine({ routes, applications });

// 6. Register and Start
applications.forEach(registerApplication);
layoutEngine.activate();
start();