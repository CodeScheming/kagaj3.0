"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="nav-brand">
          Kagaj Platform
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link href="/article/create" className="btn btn-primary">
                Write Article
              </Link>
              <Link href={`/profile/${user.id}`} className="nav-link">
                Profile
              </Link>
              <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
