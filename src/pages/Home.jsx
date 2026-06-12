import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { X, ArrowRight } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

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
      <div style={{ marginBottom: '4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
        <h1>CLASSIFIED DECRYPT</h1>
        <p className="mono-text" style={{ color: 'var(--text-primary)' }}>
          STATUS: ACTIVE | CLEARANCE: LEVEL 5
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="brutalist-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <h3 className="mono-text">NO FILES FOUND</h3>
        </div>
      ) : (
        <div className="dossier-grid">
          {posts.map(post => (
            <div key={post.id} className="brutalist-panel dossier-card">
              <div>
                <div className="card-header">
                  <span className="mono-text tag">FILE #{post.id.slice(0,6).toUpperCase()}</span>
                  <span className="mono-text">
                    {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'UNKNOWN'}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{post.title}</h2>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'space-between', marginTop: '2rem' }}
                onClick={() => setSelectedPost(post)}
              >
                READ REPORT <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reading Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="mono-text tag" style={{ marginBottom: '1rem' }}>
                  FILE #{selectedPost.id.toUpperCase()}
                </div>
                <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{selectedPost.title}</h1>
              </div>
              <button className="btn" onClick={() => setSelectedPost(null)} style={{ padding: '0.5rem' }}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div 
                className="post-content-html" 
                dangerouslySetInnerHTML={{ __html: selectedPost.content }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
