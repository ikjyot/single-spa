// We import the compiled component from our enterprise library!
import { Button } from '@comp/design-system';
// We import our enterprise security wrapper directly from the shared library!
import { ProtectedRoute } from '@comp/react-core';

export default function App() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div style={{ padding: '2rem', background: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginTop: 0, color: '#333' }}>Enterprise Dashboard</h1>
        <p style={{ color: '#666' }}>
          Welcome to your main control panel. This Microfrontend was dynamically loaded because the URL matches <code>/dashboard</code>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ padding: '1rem', background: '#f8f9fa', border: '1px solid #dee2e6' }}>
            <h3>System Status</h3>
            <p style={{ color: 'green', fontWeight: 'bold' }}>All Systems Operational</p>
          </div>
          <div style={{ padding: '1rem', background: '#f8f9fa', border: '1px solid #dee2e6' }}>
            <h3>Recent Activity</h3>
            <p>No new alerts.</p>
          </div>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            This Microfrontend is consuming components directly from the Centralized Design System.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {/* Using the standard default variant */}
            <Button onClick={() => alert('System Scan Initiated')}>
              Run System Scan
            </Button>

            {/* Using the destructive variant with a custom layout class */}
            <Button variant="destructive" className="ds:ml-auto">
              Purge Cache
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}