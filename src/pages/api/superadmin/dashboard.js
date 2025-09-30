import React, { useState } from 'react';
import { verify } from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;
const cookieName = 'SuperAdminToken';
const absoluteUrl = process.env.NEXT_PUBLIC_ABSOLUTE_URL || 'http://localhost:3000';

export async function getServerSideProps(context) {
  const { req } = context;
  const token = req.cookies[cookieName];

  if (!token) {
    return {
      redirect: {
        destination: '/superadmin/login',
        permanent: false,
      },
    };
  }

  try {
    verify(token, jwtSecret);
    
    const response = await fetch(`${absoluteUrl}/api/superadmin/pending-users`, {
      headers: {
        'Cookie': `${cookieName}=${token}`
      }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch pending users');
    }

    const pendingUsers = await response.json();
    return { props: { initialUsers: pendingUsers } };

  } catch (error) {
    return {
      redirect: {
        destination: '/superadmin/login',
        permanent: false,
      },
    };
  }
}

export default function SuperAdminDashboard({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState('');

  const handleAction = async (action, userId) => {
    setMessage('');
    const endpoint = `/api/superadmin/${action}-user`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (response.ok) {
      setUsers(currentUsers => currentUsers.filter(user => user._id !== userId));
      setMessage(data.message);
    } else {
      setMessage(`Error: ${data.message}`);
    }
  };

  return (
    <div className="container">
      <h1>Super Admin Dashboard</h1>
      <p>Pending User Registrations</p>

      {message && <div style={{ marginBottom: '16px' }}>{message}</div>}
      
      {users.length === 0 ? (
        <div>No pending registrations.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Registered At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.email}</td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleAction('approve', user._id)}>
                      Approve
                    </button>
                    <button 
                        onClick={() => handleAction('delete', user._id)} 
                        style={{ backgroundColor: '#b71c1c' }}>
                      Deny
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}