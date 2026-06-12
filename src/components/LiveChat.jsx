import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { MessageSquare, Send } from 'lucide-react';

const ADJECTIVES = ['Unknown', 'Classified', 'Redacted', 'Agent', 'Shadow', 'Phantom', 'Cosmic', 'Encrypted'];
const NOUNS = ['Observer', 'Entity', 'Operative', 'Protocol', 'Signal', 'Anomaly', 'Traveler', 'Source'];

function generateIdentity() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj} ${noun} ${num}`;
}

export default function LiveChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [identity, setIdentity] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let savedIdentity = localStorage.getItem('chatIdentity');
    if (!savedIdentity) {
      savedIdentity = generateIdentity();
      localStorage.setItem('chatIdentity', savedIdentity);
    }
    setIdentity(savedIdentity);

    const q = query(collection(db, 'chat'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsub();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const msg = input.trim();
    setInput('');
    
    await addDoc(collection(db, 'chat'), {
      text: msg,
      author: identity,
      createdAt: serverTimestamp()
    });
  };

  return (
    <div className="glass-panel chat-container">
      <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
        <MessageSquare color="var(--accent-glow)" />
        <h3 style={{ margin: 0 }}>SECURE CHAT</h3>
      </div>
      
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className="chat-message animate-fade-in">
            <div className="chat-meta">
              <span className="chat-author">{msg.author}</span>
              <span className="chat-time">
                {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
              </span>
            </div>
            <div className="chat-text">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          className="input" 
          placeholder="Transmit message..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={200}
        />
        <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
