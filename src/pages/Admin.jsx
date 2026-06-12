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
    if (password === 'admin123') { // Simple hardcoded password as requested for simplicity
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
      <div className="admin-login glass-panel animate-fade-in" style={{ padding: '2rem' }}>
        <ShieldIcon />
        <h2 style={{ marginBottom: '1.5rem' }}>RESTRICTED ACCESS</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            className="input" 
            placeholder="Enter Passcode" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: '1rem', textAlign: 'center', letterSpacing: '0.2em' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            AUTHORIZE
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>COMMAND CENTER</h2>
        <button className="btn" onClick={handleLogout}>Log Out</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Stream Settings */}
        <div className="glass-panel admin-section">
          <h3><Radio /> Stream Configuration</h3>
          <form onSubmit={handleUpdateSettings}>
            <div className="form-group">
              <label>YouTube Embed URL</label>
              <input 
                type="text" 
                className="input" 
                value={ytLink} 
                onChange={(e) => setYtLink(e.target.value)} 
                placeholder="https://www.youtube.com/embed/..." 
              />
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Note: Use the embed URL, not the watch URL.</p>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ margin: 0 }}>Visitor Counter:</label>
              <button type="button" className="btn" onClick={handleToggleVisitors}>
                {showVisitors ? <Eye size={18} /> : <EyeOff size={18} />}
                {showVisitors ? 'Visible' : 'Hidden'}
              </button>
            </div>
            <button type="submit" className="btn btn-primary">Save Configuration</button>
          </form>
        </div>

        {/* New Post */}
        <div className="glass-panel admin-section">
          <h3><Edit3 /> Dispatch Intelligence Brief</h3>
          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <label>Title</label>
              <input 
                type="text" 
                className="input" 
                value={postTitle} 
                onChange={(e) => setPostTitle(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Content (HTML Supported)</label>
              <textarea 
                className="input" 
                value={postContent} 
                onChange={(e) => setPostContent(e.target.value)} 
                required 
                placeholder="<p>Classified details...</p>"
              />
            </div>
            <button type="submit" className="btn btn-primary">Publish Brief</button>
          </form>
        </div>
      </div>

      {/* Chat Moderation */}
      <div className="glass-panel admin-section" style={{ marginTop: '2rem' }}>
        <h3><Settings /> Chat Interception</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '0.5rem' }}>Time</th>
                <th style={{ padding: '0.5rem' }}>Identity</th>
                <th style={{ padding: '0.5rem' }}>Message</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(msg => (
                <tr key={msg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString() : '...'}
                  </td>
                  <td style={{ padding: '0.5rem', color: 'var(--accent-glow)' }}>{msg.author}</td>
                  <td style={{ padding: '0.5rem', wordBreak: 'break-all' }}>{msg.text}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                    <button className="btn btn-danger" onClick={() => handleDeleteMessage(msg.id)} style={{ padding: '0.3rem 0.6rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No intercepted messages.</td>
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
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
