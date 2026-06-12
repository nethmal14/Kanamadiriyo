import LiveStream from '../components/LiveStream';
import LiveChat from '../components/LiveChat';
import PostList from '../components/PostList';

export default function Home() {
  return (
    <div>
      <div className="main-layout">
        <div>
          <LiveStream />
        </div>
        <div>
          <LiveChat />
        </div>
      </div>
      <PostList />
    </div>
  );
}
