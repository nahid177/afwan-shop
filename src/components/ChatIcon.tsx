// components/ChatIcon.tsx
import { FaComment } from 'react-icons/fa';
import Link from 'next/link';

const ChatIcon = () => {
  return (
    <Link href="/contactUs">
      <div
        className="fixed bottom-14 right-0 mb-4 mr-4 bg-blue-500 p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 chat-icon"
        aria-label="Chat with us"
      >
        <FaComment className="text-white text-3xl" />
      </div>
    </Link>
  );
};

export default ChatIcon;
