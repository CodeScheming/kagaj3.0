"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI, getAuthToken } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import RichTextEditor from '@/components/RichTextEditor';

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchAPI(`/articles/${unwrappedParams.id}`)
      .then((data) => {
        setTitle(data.title);
        setContent(data.content);
        setTags(data.tags || '');
        setCoverImageUrl(data.cover_image_url || '');
        if (user && user.id !== data.author_id) {
          router.push('/');
        }
      })
      .catch(() => setError('Failed to load article'))
      .finally(() => setLoading(false));
  }, [unwrappedParams.id, user, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setCoverImage(file);
    setUploadingImage(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');
      const data = await response.json();
      setCoverImageUrl(data.url);
    } catch (err: any) {
      alert(err.message);
      setCoverImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content === '<p><br></p>') {
      setError('Content is required');
      return;
    }
    setError('');
    setPublishing(true);

    try {
      await fetchAPI(`/articles/${unwrappedParams.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          title, 
          content,
          tags: tags.trim(),
          cover_image_url: coverImageUrl || undefined
        }),
      });
      router.push(`/article/${unwrappedParams.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update article');
      setPublishing(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: '#ef4444' }}>{error}</div>;

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
      <h1 className="page-title" style={{ marginBottom: '30px' }}>Edit Article</h1>
      {error && <p style={{ color: '#ef4444', marginBottom: '15px' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Cover Image Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label className="form-label" style={{ margin: 0 }}>Cover Image</label>
          {coverImageUrl ? (
            <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', backgroundImage: `url(${coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <button 
                type="button" 
                onClick={() => { setCoverImageUrl(''); setCoverImage(null); }}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('cover-upload')?.click()}>
              {uploadingImage ? 'Uploading...' : 'Click to add a cover image'}
              <input type="file" id="cover-upload" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            </div>
          )}
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="A catching title..."
            style={{ fontSize: '2rem', fontWeight: 700, padding: '15px 0', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: '0', background: 'transparent' }}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        <div className="form-group">
          <label className="form-label">Tags</label>
          <input
            type="text"
            className="form-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Web3, Solana, Tutorial (comma separated)"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '15px' }}>
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 40px', fontSize: '1.1rem' }} disabled={publishing || uploadingImage}>
            {publishing ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
