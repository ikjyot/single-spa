import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import App from './App';

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: App,
  errorBoundary(err, info, props) {
    console.error('Profile Error:', err, info, props);
    return <div style={{ color: 'red', padding: '1rem' }}>Profile Error: Failed to load module.</div>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;