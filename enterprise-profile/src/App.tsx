import { BrowserRouter, useSearchParams } from 'react-router-dom';

// The actual UI Component
const ProfileContent = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');

  return (
    <div style={{ padding: '2rem', background: '#e0f7fa', borderRadius: '8px', border: '1px solid #b2ebf2' }}>
      <h1 style={{ marginTop: 0, color: '#006064' }}>User Profile Portal</h1>

      {!userId ? (
        <div style={{ padding: '1rem', background: '#fff', borderRadius: '4px' }}>
          <h3>No User Selected</h3>
          <p>Please provide a User ID in the URL. For example:</p>
          <code>http://localhost:9000/profile?userId=12345</code>
        </div>
      ) : (
        <div style={{ padding: '1rem', background: '#fff', borderRadius: '4px' }}>
          <h3>Viewing Profile Data</h3>
          <p><strong>Database ID:</strong> {userId}</p>
          <p style={{ color: '#00838f' }}>
            <em>In a real app, this component would now fetch `/api/users/{userId}` from our Spring Boot backend.</em>
          </p>
        </div>
      )}
    </div>
  );
};

// The Enterprise Pattern: We wrap our MFE in its own isolated Router
export default function App() {
  return (
    <BrowserRouter>
      <ProfileContent />
    </BrowserRouter>
  );
}