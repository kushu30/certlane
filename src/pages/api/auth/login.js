import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      router.push('/admin'); // Redirect to the admin dashboard on success
    } else {
      const data = await response.json();
      setMessage(data.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '12px', maxWidth: '300px' }}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
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