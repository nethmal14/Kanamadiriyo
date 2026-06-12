import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Radio } from 'lucide-react';

export default function LiveStream() {
  const [ytLink, setYtLink] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'main'), (doc) => {
      if (doc.exists() && doc.data().ytLink) {
        setYtLink(doc.data().ytLink);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '2px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
        <Radio color="var(--danger)" className="animate-pulse" />
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>LIVE TRANSMISSION</h2>
      </div>
      <div className="video-container" style={{ borderRadius: '0 0 16px 16px', border: 'none' }}>
        {ytLink ? (
          <iframe 
            src={ytLink} 
            title="Live Broadcast" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen>
          </iframe>
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            No active broadcast.
          </div>
        )}
      </div>
    </div>
  );
}
