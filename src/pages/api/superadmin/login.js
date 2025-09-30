import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function SuperAdminLoginPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    const response = await fetch('/api/superadmin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      router.push('/superadmin/dashboard');
    } else {
      const data = await response.json();
      setMessage(data.message || 'Login failed.');
      setIsLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>Super Admin Access</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '12px', maxWidth: '300px' }}>
          <input
            type="password"
            placeholder="Master Password"
            value={password}
            onChange={(e) => setPassword(e.taget.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Enter'}
          </button>
        </div>
      </form>
      {message && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: '#ffebee',
            color: '#c62828',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}