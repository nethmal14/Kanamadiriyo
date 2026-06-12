import LiveStream from '../components/LiveStream';
import LiveChat from '../components/LiveChat';

export default function Live() {
  return (
    <div className="live-layout animate-fade-in">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>TRANSMISSION</h1>
        <div style={{ flex: 1, minHeight: '400px' }}>
          <LiveStream />
        </div>
      </div>
      <div>
        <LiveChat />
      </div>
    </div>
  );
}
