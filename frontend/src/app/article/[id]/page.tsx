"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Article {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author_id: number;
}

interface UserProfile {
  id: number;
  username: string;
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [author, setAuthor] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchAPI(`/articles/${unwrappedParams.id}`)
      .then(async (data) => {
        setArticle(data);
        const authorData = await fetchAPI(`/users/${data.author_id}`);
        setAuthor(authorData);
      })
      .catch(() => setError('Failed to load article'))
      .finally(() => setLoading(false));
  }, [unwrappedParams.id]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await fetchAPI(`/articles/${unwrappedParams.id}`, { method: 'DELETE' });
        router.push('/');
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (error || !article) return <div style={{ textAlign: 'center', color: '#ef4444', marginTop: '50px' }}>{error || 'Article not found'}</div>;

  const isAuthor = user && user.id === article.author_id;

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
      <h1 className="page-title" style={{ marginBottom: '10px' }}>{article.title}</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <div style={{ color: 'var(--text-secondary)' }}>
          By <Link href={`/profile/${article.author_id}`} style={{ color: 'var(--accent-color)', fontWeight: 500 }}>{author?.username || 'Unknown'}</Link> 
          {' • '} {new Date(article.created_at).toLocaleDateString()}
        </div>
        
        {isAuthor && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href={`/article/${article.id}/edit`} className="btn btn-secondary">
              Edit
            </Link>
            <button onClick={handleDelete} className="btn" style={{ backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}>
              Delete
            </button>
          </div>
        )}
      </div>

      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '1.1rem' }}>
        {article.content}
      </div>
    </div>
  );
}
