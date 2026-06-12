import { Outlet, Link, useLocation } from 'react-router-dom';
import { Eye, ShieldAlert, Radio } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, increment, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Layout() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [showVisitors, setShowVisitors] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const initVisitorCount = async () => {
      const docRef = doc(db, 'settings', 'main');
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, { visitorCount: 1, showVisitors: true, ytLink: 'https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID' });
      } else {
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
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {showVisitors && (
            <div className="mono-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }} title="Current Visitors">
              <Eye size={16} />
              {visitorCount.toLocaleString()}
            </div>
          )}
          {location.pathname !== '/live' && (
            <Link to="/live" className="btn btn-danger">
              <Radio size={16} /> INTERCEPT STREAM
            </Link>
          )}
          {location.pathname === '/live' && (
            <Link to="/" className="btn">
              RETURN TO FILES
            </Link>
          )}
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
