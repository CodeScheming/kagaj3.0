"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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
  wallet_address?: string;
  articles: Article[];
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Wallet edit state
  const { user } = useAuth();
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [walletInput, setWalletInput] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const isOwnProfile = user && profile && user.id === profile.id;

  useEffect(() => {
    fetchAPI(`/users/${unwrappedParams.id}`)
      .then(data => {
        setProfile(data);
        setWalletInput(data.wallet_address || '');
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [unwrappedParams.id]);

  const handleSaveWallet = async () => {
    setSaveLoading(true);
    try {
      const updatedUser = await fetchAPI('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ wallet_address: walletInput }),
      });
      setProfile(prev => prev ? { ...prev, wallet_address: updatedUser.wallet_address } : null);
      setIsEditingWallet(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update wallet address');
    } finally {
      setSaveLoading(false);
    }
  };

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
        
        {/* Wallet Address Section */}
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'inline-block', textAlign: 'left', minWidth: '300px' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Solana Wallet Address</div>
          {isOwnProfile && isEditingWallet ? (
            <div>
              <input 
                type="text" 
                value={walletInput} 
                onChange={e => setWalletInput(e.target.value)} 
                className="form-input"
                placeholder="Enter Solana public key"
                style={{ marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSaveWallet} disabled={saveLoading} className="btn btn-primary" style={{ flex: 1 }}>{saveLoading ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setIsEditingWallet(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
              <span style={{ fontFamily: 'monospace', color: profile.wallet_address ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {profile.wallet_address || 'Not set'}
              </span>
              {isOwnProfile && (
                <button onClick={() => setIsEditingWallet(true)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Edit</button>
              )}
            </div>
          )}
        </div>
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
