import React, { useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setIsError(false);
      setMessage(data.message);
    } else {
      setIsError(true);
      setMessage(data.message || 'An unexpected error occurred.');
    }
    
    setIsLoading(false);
  }

  return (
    <div className="container">
      <h1>Register for Service</h1>
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
            placeholder="Password (min. 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength="8"
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
      {message && (
        <div 
          style={{ 
            marginTop: '16px', 
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: isError ? '#ffebee' : '#e8f5e9',
            color: isError ? '#c62828' : '#2e7d32',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}