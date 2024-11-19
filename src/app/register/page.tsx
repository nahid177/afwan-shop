// src/app/register/page.tsx

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setMessage('User registered successfully!');
        setTimeout(() => {
          router.push('/smsLogin');
        }, 1500);
      } else {
        setMessage(data.message || 'Registration failed.');
      }
    } catch {
      setMessage('Registration failed due to a network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-center">Register</h2>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input input-bordered w-full"
          />
          <button
            onClick={handleRegister}
            className={`btn btn-primary w-full mt-4 ${loading ? 'loading' : ''}`}
            disabled={loading || !username.trim()}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          {message && (
            <div className={`alert ${message.startsWith('User registered') ? 'alert-success' : 'alert-info'} mt-4`}>
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
