import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '../Dashboard/Navbar';
import MessageInput from './MessageInput';

const Conversation = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchConversation = async () => {
      try {
        // Fetch current user
        const currentUserResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUserId(currentUserResponse.data.authId._id);

        // Fetch conversation
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/messages/conversation/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(response.data.messages);

        // Fetch recipient username by ID
        const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/userById/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipientUsername(userResponse.data.authId.username || 'Unknown');
      } catch (err) {
        console.error('Fetch conversation error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load conversation');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else if (err.response?.status === 404) {
          console.log(`User ID ${userId} not found in database`);
        }
      }
    };
    fetchConversation();
  }, [userId, token, navigate]);

  const handleSendMessage = async (content) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/messages/send`,
        { recipientId: userId, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, response.data.data]);
    } catch (err) {
      console.error('Send message error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <Navbar />
      <div className="w-full md:w-4/5 md:ml-64 p-4 flex flex-col">
        <Card className="w-full max-w-4xl mx-auto shadow-lg flex-1 flex flex-col">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold">Chat with {recipientUsername}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4 overflow-y-auto max-h-[70vh]">
            {messages.length === 0 ? (
              <p className="text-center text-gray-600">No messages yet</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`p-2 rounded-lg max-w-xs ${
                    msg.recipient._id === currentUserId
                      ? 'bg-gray-200 self-start'
                      : 'bg-blue-500 text-white self-end'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              ))
            )}
          </CardContent>
          <div className="p-4 border-t border-gray-200">
            <MessageInput onSend={handleSendMessage} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Conversation;