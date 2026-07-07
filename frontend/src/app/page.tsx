"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';

interface Article {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author_id: number;
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAPI('/articles')
      .then(setArticles)
      .catch((err) => setError('Failed to load articles'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading articles...</div>;
  if (error) return <div style={{ textAlign: 'center', color: '#ef4444', marginTop: '50px' }}>{error}</div>;

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="page-title">Latest Articles</h1>
        <p className="page-subtitle">Discover the latest thoughts and stories.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {articles.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No articles found. Be the first to write one!
          </p>
        ) : (
          articles.map((article) => (
            <Link href={`/article/${article.id}`} key={article.id}>
              <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{article.title}</h2>
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
