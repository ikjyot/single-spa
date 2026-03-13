import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import App from './App';

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: App,
  errorBoundary(err, info, props) {
    console.error('Dashboard Error:', err, info, props);
    return <div style={{ color: 'red', padding: '1rem' }}>Dashboard Error: Failed to load module.</div>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;