"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';

interface Article {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  articles: Article[];
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAPI(`/users/${unwrappedParams.id}`)
      .then(setProfile)
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [unwrappedParams.id]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile...</div>;
  if (error || !profile) return <div style={{ textAlign: 'center', color: '#ef4444', marginTop: '50px' }}>{error || 'Profile not found'}</div>;

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--bg-glass)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 700, color: 'var(--accent-color)' }}>
          {profile.username.charAt(0).toUpperCase()}
        </div>
        <h1 className="page-title" style={{ marginBottom: '5px' }}>{profile.username}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Member</p>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
        Articles by {profile.username}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {profile.articles.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', color: 'var(--text-secondary)' }}>
            This user hasn't written any articles yet.
          </p>
        ) : (
          profile.articles.map((article) => (
            <Link href={`/article/${article.id}`} key={article.id}>
              <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{article.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '15px', flexGrow: 1 }}>
                  {article.content.substring(0, 100)}...
                </p>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(article.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
