"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await fetchAPI('/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '20px' }}>Join Kagaj</h1>
      {error && <p style={{ color: '#ef4444', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Create Account
        </button>
      </form>
    </div>
  );
}
