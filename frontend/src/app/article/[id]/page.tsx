"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import parse from 'html-react-parser';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface Article {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author_id: number;
  content_hash?: string;
  tx_signature?: string;
  author_wallet?: string;
  cover_image_url?: string;
  tags?: string;
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
  
  // Solana Tipping Hooks
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [tipAmount, setTipAmount] = useState('0.1');
  const [tipLoading, setTipLoading] = useState(false);

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

  const handleTip = async () => {
    if (!publicKey) return alert('Connect wallet first!');
    if (!article?.author_wallet) return alert('Author has no wallet address set.');
    
    setTipLoading(true);
    try {
      const recipientPubKey = new PublicKey(article.author_wallet);
      const lamports = parseFloat(tipAmount) * LAMPORTS_PER_SOL;
      
      const transaction = new Transaction().add(
          SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: recipientPubKey,
              lamports,
          })
      );
      
      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight }
      } = await connection.getLatestBlockhashAndContext();
      
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      const signature = await sendTransaction(transaction, connection, { minContextSlot });
      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
      
      alert(`Tip sent successfully! Signature: ${signature}`);
    } catch (err: any) {
      alert(`Tip failed: ${err.message}`);
    } finally {
      setTipLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (error || !article) return <div style={{ textAlign: 'center', color: '#ef4444', marginTop: '50px' }}>{error || 'Article not found'}</div>;

  const isAuthor = user && user.id === article.author_id;

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
      
      {article.cover_image_url && (
        <div style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', backgroundImage: `url(${article.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '30px' }} />
      )}
      
      <h1 className="page-title" style={{ marginBottom: '10px' }}>{article.title}</h1>
      
      {article.tags && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {article.tags.split(',').map(tag => (
            <span key={tag} style={{ fontSize: '0.85rem', padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
              {tag.trim()}
            </span>
          ))}
        </div>
      )}
      
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

      {article.tx_signature && (
        <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#10b981', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Verified ✓
          </h3>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p><strong>Owner Wallet:</strong> <span style={{ fontFamily: 'monospace' }}>{article.author_wallet || 'Not set'}</span></p>
            <p><strong>Publication Time:</strong> {new Date(article.created_at).toLocaleString()}</p>
            <p><strong>Content Hash:</strong> <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{article.content_hash}</span></p>
            <p><strong>Transaction:</strong> <a href={`https://explorer.solana.com/tx/${article.tx_signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline', fontFamily: 'monospace', wordBreak: 'break-all' }}>{article.tx_signature}</a></p>
          </div>
        </div>
      )}
      
      {/* Tipping Section */}
      {!isAuthor && article.author_wallet && (
        <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Tip Author</h3>
          {publicKey ? (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input 
                type="number" 
                min="0.01" 
                step="0.01" 
                value={tipAmount} 
                onChange={(e) => setTipAmount(e.target.value)}
                className="form-input"
                style={{ width: '100px', margin: 0 }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>SOL</span>
              <button onClick={handleTip} disabled={tipLoading} className="btn btn-primary">
                {tipLoading ? 'Sending...' : 'Send Tip'}
              </button>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>Connect your wallet to tip the author directly.</p>
              <WalletMultiButton />
            </div>
          )}
        </div>
      )}

      {/* Render parsed HTML */}
      <div className="rich-text-content" style={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
        {parse(article.content)}
      </div>
    </div>
  );
}
