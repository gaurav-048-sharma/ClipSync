import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import Navbar from '../Dashboard/Navbar';

const FollowList = ({ type }) => { // type: "followers" or "following"
  const { username } = useParams();
  const [list, setList] = useState([]);
  const [reels, setReels] = useState([]); // Placeholder for reels
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/${type}/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setList(type === 'followers' ? response.data.followers : response.data.following);

        // Placeholder for reels (update with actual endpoint later)
        // const reelsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/reels/${username}`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setReels(reelsResponse.data);
        setReels([1, 2, 3]); // Dummy data for now
      } catch (err) {
        setError(err.response?.data?.message || `Failed to fetch ${type}`);
        console.error(`Fetch ${type} error:`, err.response?.data || err.message);
      }
    };
    fetchData();
  }, [username, type, token, navigate]);

  const handleFollowToggle = async (targetUsername, isFollowing) => {
    try {
      const url = isFollowing
        ? `${import.meta.env.VITE_BACKEND_URL}/api/users/unfollow/${targetUsername}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/users/follow/${targetUsername}`;
      await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setList((prev) =>
        isFollowing
          ? prev.filter((user) => user.authId.username !== targetUsername)
          : [...prev, { authId: { username: targetUsername } }]
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
      console.error('Follow toggle error:', err.response?.data || err.message);
    }
  };

  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Left Sidebar: Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="w-full md:w-4/5 md:ml-64 p-4 flex flex-col">
        {/* Follow List Header */}
        <div className="w-full max-w-4xl mx-auto mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">
            {username}'s {type.charAt(0).toUpperCase() + type.slice(1)}
          </h1>
          <div className="space-y-4">
            {list.length === 0 ? (
              <p className="text-center text-gray-600">No {type} found</p>
            ) : (
              list.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 border-b border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.profilePicture || 'https://via.placeholder.com/40'}
                      alt={user.authId.username}
                      className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    />
                    <div>
                      <p
                        className="text-sm font-semibold hover:text-blue-500 cursor-pointer"
                        onClick={() => navigate(`/user/${user.authId.username}`)}
                      >
                        {user.authId.username}
                      </p>
                      <p className="text-xs text-gray-600">{user.authId.name || 'No name'}</p>
                    </div>
                  </div>
                  {token && (
                    <Button
                      variant={type === 'following' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => handleFollowToggle(user.authId.username, type === 'following')}
                    >
                      {type === 'following' ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reels Section */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-center mb-4">{username}'s Reels</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {reels.length === 0 ? (
                <p className="text-center text-gray-600 col-span-full">No reels posted yet</p>
              ) : (
                reels.map((reel, index) => (
                  <div
                    key={index}
                    className="aspect-video bg-gray-200 flex items-center justify-center cursor-pointer hover:opacity-80 rounded-md"
                    onClick={() => navigate(`/reels/${username}`)}
                  >
                    <span className="text-gray-700 text-sm">Reel {index + 1}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowList;