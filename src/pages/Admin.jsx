import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Settings, Eye, EyeOff, Radio, Trash2, Edit3 } from 'lucide-react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Settings
  const [ytLink, setYtLink] = useState('');
  const [showVisitors, setShowVisitors] = useState(true);
  
  // New Post
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  
  // Chat Moderation
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Load Settings
    const loadSettings = async () => {
      const docRef = doc(db, 'settings', 'main');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setYtLink(snap.data().ytLink || '');
        setShowVisitors(snap.data().showVisitors !== false);
      }
    };
    loadSettings();

    // Load Chat for moderation
    const q = query(collection(db, 'chat'), orderBy('createdAt', 'desc'));
    const unsubChat = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubChat();
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') { 
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Access Denied');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'settings', 'main'), {
        ytLink,
        showVisitors
      });
      alert('Settings updated successfully');
    } catch (error) {
      console.error(error);
      alert('Error updating settings');
    }
  };

  const handleToggleVisitors = async () => {
    const newVal = !showVisitors;
    setShowVisitors(newVal);
    try {
      await updateDoc(doc(db, 'settings', 'main'), { showVisitors: newVal });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;
    try {
      await addDoc(collection(db, 'posts'), {
        title: postTitle,
        content: postContent,
        createdAt: serverTimestamp()
      });
      setPostTitle('');
      setPostContent('');
      alert('Post published');
    } catch (error) {
      console.error(error);
      alert('Error publishing post');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm('Delete this message?')) {
      try {
        await deleteDoc(doc(db, 'chat', id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login brutalist-panel animate-fade-in" style={{ padding: '3rem 2rem' }}>
        <ShieldIcon />
        <h2 style={{ marginBottom: '2rem', letterSpacing: '0.1em' }}>CLEARANCE REQUIRED</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            className="input mono-text" 
            placeholder="ENTER PASSCODE" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '0.2em' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            AUTHORIZE
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard animate-fade-in" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>COMMAND CENTER</h1>
        <button className="btn" onClick={handleLogout}>END SESSION</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Stream Settings */}
        <div className="brutalist-panel admin-section">
          <h3><Radio /> Stream Configuration</h3>
          <form onSubmit={handleUpdateSettings}>
            <div className="form-group">
              <label className="mono-text">YouTube Embed URL</label>
              <input 
                type="text" 
                className="input" 
                value={ytLink} 
                onChange={(e) => setYtLink(e.target.value)} 
                placeholder="https://www.youtube.com/embed/..." 
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label className="mono-text" style={{ margin: 0 }}>Visitor Counter:</label>
              <button type="button" className="btn" onClick={handleToggleVisitors}>
                {showVisitors ? <Eye size={18} /> : <EyeOff size={18} />}
                {showVisitors ? 'VISIBLE' : 'HIDDEN'}
              </button>
            </div>
            <button type="submit" className="btn btn-primary">SAVE CONFIG</button>
          </form>
        </div>

        {/* New Post */}
        <div className="brutalist-panel admin-section">
          <h3><Edit3 /> Dispatch Intelligence Brief</h3>
          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <label className="mono-text">Title</label>
              <input 
                type="text" 
                className="input" 
                value={postTitle} 
                onChange={(e) => setPostTitle(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="mono-text">Content (HTML Supported)</label>
              <textarea 
                className="input" 
                value={postContent} 
                onChange={(e) => setPostContent(e.target.value)} 
                required 
                placeholder="<p>Classified details...</p>"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">PUBLISH BRIEF</button>
          </form>
        </div>
      </div>

      {/* Chat Moderation */}
      <div className="brutalist-panel admin-section" style={{ marginTop: '2rem' }}>
        <h3><Settings /> Chat Interception</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: '#111' }}>
                <th className="mono-text" style={{ padding: '1rem' }}>Time</th>
                <th className="mono-text" style={{ padding: '1rem' }}>Identity</th>
                <th className="mono-text" style={{ padding: '1rem' }}>Message</th>
                <th className="mono-text" style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(msg => (
                <tr key={msg.id} style={{ borderBottom: '1px solid #222' }}>
                  <td className="mono-text" style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString() : '...'}
                  </td>
                  <td className="mono-text" style={{ padding: '1rem', color: 'var(--text-primary)' }}>{msg.author}</td>
                  <td style={{ padding: '1rem', wordBreak: 'break-all', color: '#ccc' }}>{msg.text}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-danger" onClick={() => handleDeleteMessage(msg.id)} style={{ padding: '0.4rem 0.8rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan="4" className="mono-text" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>NO INTERCEPTED MESSAGES.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--alert)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem' }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
