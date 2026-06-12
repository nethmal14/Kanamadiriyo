import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FileText, ChevronRight } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(docs);
    });

    return () => unsub();
  }, []);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1>DECRYPTED FILES</h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
            Access the latest intelligence briefs, intercepted transmissions, and classified analyses.
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
          <h3>NO FILES FOUND</h3>
          <p>Awaiting decryption...</p>
        </div>
      ) : (
        <div className="slider-container">
          {posts.map(post => (
            <div key={post.id} className="glass-panel cinematic-card">
              <div className="card-content-overlay">
                <span className="card-tag">Classified</span>
                <h2 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.8rem', lineHeight: '1.2' }}>{post.title}</h2>
                <div 
                  className="post-content-html" 
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>
                    {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '...'}
                  </span>
                  <div style={{ color: 'var(--accent-glow)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                    Read Full <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
