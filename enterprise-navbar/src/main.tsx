import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import App from './App';

// 1. Wrap our React App using the adapter
const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: App,
  // We handle errors gracefully so one broken MFE doesn't crash the whole page
  errorBoundary(err, info, props) {
    console.error("Navbar failed to load!", err, info, props);
    return <div style={{ color: 'red' }}>Navbar failed to load!</div>;
  },
});

// 2. Export the required Single-SPA lifecycle methods!
export const { bootstrap, mount, unmount } = lifecycles;