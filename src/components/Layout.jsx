import { Outlet, Link } from 'react-router-dom';
import { Eye, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, increment, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Layout() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [showVisitors, setShowVisitors] = useState(false);

  useEffect(() => {
    const initVisitorCount = async () => {
      const docRef = doc(db, 'settings', 'main');
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, { visitorCount: 1, showVisitors: true, ytLink: 'https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID' });
      } else {
        // Increment visitor count on load (in a real app, maybe use session storage to avoid double counting)
        if (!sessionStorage.getItem('visited')) {
          await updateDoc(docRef, {
            visitorCount: increment(1)
          });
          sessionStorage.setItem('visited', 'true');
        }
      }
    };
    
    initVisitorCount();

    const unsub = onSnapshot(doc(db, 'settings', 'main'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setVisitorCount(data.visitorCount || 0);
        setShowVisitors(data.showVisitors !== false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <>
      <nav className="nav-bar">
        <Link to="/" className="brand">
          <ShieldAlert className="brand-icon" size={28} />
          <span>PODCASTER</span>
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {showVisitors && (
            <div className="visitor-count" title="Current Visitors">
              <Eye size={16} />
              {visitorCount.toLocaleString()}
            </div>
          )}
          <Link to="/admin" className="btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
            Admin
          </Link>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
