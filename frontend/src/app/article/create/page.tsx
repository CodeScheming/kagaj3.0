"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function CreateArticlePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const article = await fetchAPI('/articles', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });
      router.push(`/article/${article.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create article');
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title">Write a New Article</h1>
      {error && <p style={{ color: '#ef4444', marginBottom: '15px' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="A catching title..."
            style={{ fontSize: '1.5rem', fontWeight: 600, padding: '15px 20px' }}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="content">Content</label>
          <textarea
            id="content"
            className="form-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={12}
            placeholder="Share your thoughts..."
            style={{ resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px' }}>
            Publish
          </button>
        </div>
      </form>
    </div>
  );
}
