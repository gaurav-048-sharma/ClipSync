import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '../Dashboard/Navbar';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchConversations = async () => {
      try {
        // Fetch current user to exclude self from conversation list
        const currentUserResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentUserId = currentUserResponse.data.authId._id;

        // Fetch all users
        const usersResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch conversations for each user (excluding self)
        const conversationPromises = usersResponse.data
          .filter((user) => user._id !== currentUserId) // Exclude current user
          .map(async (user) => {
            const convoResponse = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/messages/conversation/${user._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const messages = convoResponse.data.messages;
            return {
              userId: user._id,
              username: user.username,
              latestMessage: messages.length > 0 ? messages[messages.length - 1].content : 'No messages yet',
              timestamp: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
            };
          });

        const convos = await Promise.all(conversationPromises);
        setConversations(convos.filter((convo) => convo.latestMessage !== 'No messages yet')); // Show only active convos
      } catch (err) {
        console.error('Fetch conversations error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load conversations');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchConversations();
  }, [token, navigate]);

  const handleConversationClick = (userId) => {
    navigate(`/messages/${userId}`);
  };

  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="w-full md:w-4/5 md:ml-64 p-4 flex flex-col">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold">Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversations.length === 0 ? (
              <p className="text-center text-gray-600">No conversations yet</p>
            ) : (
              conversations.map((convo) => (
                <div
                  key={convo.userId}
                  className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleConversationClick(convo.userId)}
                >
                  <div>
                    <p className="text-lg font-semibold">{convo.username}</p>
                    <p className="text-sm text-gray-600 truncate max-w-xs">{convo.latestMessage}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {convo.timestamp ? new Date(convo.timestamp).toLocaleTimeString() : ''}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;