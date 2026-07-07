"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchAPI(`/articles/${unwrappedParams.id}`)
      .then((data) => {
        setTitle(data.title);
        setContent(data.content);
        if (user && user.id !== data.author_id) {
          router.push('/');
        }
      })
      .catch(() => setError('Failed to load article'))
      .finally(() => setLoading(false));
  }, [unwrappedParams.id, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await fetchAPI(`/articles/${unwrappedParams.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
      });
      router.push(`/article/${unwrappedParams.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update article');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: '#ef4444' }}>{error}</div>;

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title">Edit Article</h1>
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
            style={{ resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px' }}>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
