"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';

interface Article {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  article_type?: string;
  created_at: string;
  author_id: number;
  cover_image_url?: string;
  tags?: string;
}

const TYPE_COLORS: Record<string, string> = {
  article: '#6366f1',
  blog: '#6366f1',
  review: '#f59e0b',
  poem: '#ec4899',
  essay: '#10b981',
  journal: '#8b5cf6',
  other: '#6b7280',
};

function getTypeLabel(type?: string): string {
  if (!type) return 'Article';
  const labels: Record<string, string> = {
    article: 'Article',
    blog: 'Blog',
    review: 'Review',
    poem: 'Poem',
    essay: 'Essay',
    journal: 'Journal',
    other: 'Writing',
  };
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      fetchAPI(`/articles${query}`)
        .then(setArticles)
        .catch(() => setError('Failed to load articles'))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="page-title">Latest Articles</h1>
        <p className="page-subtitle">Discover the latest thoughts and stories.</p>
        
        <div style={{ maxWidth: '500px', margin: '20px auto 0' }}>
          <input 
            type="text" 
            placeholder="Search by title, content, or tags..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ borderRadius: '20px', padding: '12px 20px', textAlign: 'center' }}
          />
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading articles...</div>}
      {error && !loading && <div style={{ textAlign: 'center', color: '#ef4444', marginTop: '50px' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {articles.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No articles found.
            </p>
          ) : (
            articles.map((article) => (
              <Link href={`/article/${article.id}`} key={article.id}>
                <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                  {article.cover_image_url && (
                    <div style={{ height: '150px', backgroundImage: `url(${article.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  )}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    {/* Article type badge */}
                    {article.article_type && (
                      <span style={{
                        display: 'inline-block',
                        width: 'fit-content',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        marginBottom: '10px',
                        color: '#fff',
                        background: TYPE_COLORS[article.article_type] || TYPE_COLORS.other,
                      }}>
                        {getTypeLabel(article.article_type)}
                      </span>
                    )}
                    
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{article.title}</h2>
                    
                    {article.tags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        {article.tags.split(',').map(tag => (
                          <span key={tag} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', color: 'var(--text-secondary)' }}>
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '15px', flexGrow: 1 }}>
                      {article.excerpt
                        ? article.excerpt.substring(0, 120) + (article.excerpt.length > 120 ? '...' : '')
                        : article.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...'
                      }
                    </p>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(article.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
