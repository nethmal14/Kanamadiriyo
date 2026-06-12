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
    <div className="brutalist-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0' }}>
      <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', background: '#111' }}>
        <Radio color="var(--alert)" className="animate-pulse" size={18} />
        <h2 style={{ fontSize: '1rem', margin: 0, letterSpacing: '0.1em' }}>LIVE FEED</h2>
      </div>
      <div className="video-container" style={{ border: 'none', borderRadius: 0 }}>
        {ytLink ? (
          <iframe 
            src={ytLink} 
            title="Live Broadcast" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen>
          </iframe>
        ) : (
          <div className="mono-text" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            NO ACTIVE TRANSMISSION
          </div>
        )}
      </div>
    </div>
  );
}
