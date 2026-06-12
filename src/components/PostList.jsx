import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FileText } from 'lucide-react';

export default function PostList() {
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

  if (posts.length === 0) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        <FileText color="var(--text-secondary)" />
        INTELLIGENCE BRIEFS
      </h2>
      <div className="grid">
        {posts.map(post => (
          <div key={post.id} className="glass-panel post-card animate-fade-in">
            <h3>{post.title}</h3>
            <div className="post-date">
              {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '...'}
            </div>
            {/* User requested HTML support for posts */}
            <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        ))}
      </div>
    </div>
  );
}
