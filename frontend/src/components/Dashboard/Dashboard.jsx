import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '../Dashboard/Navbar';

const Dashboard = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard mounted, token:', token);
    const fetchData = async () => {
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      try {
        console.log('Fetching profile data...');
        const profileResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Profile response:', profileResponse.data);
        const username = profileResponse.data.authId.username;

        console.log('Fetching following list for:', username);
        const followingResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/following/${username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const followingList = followingResponse.data.following.map((user) => user.authId.username);
        console.log('Following list:', followingList);
        setFollowing(followingList);

        console.log('Fetching all users...');
        const usersResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/all`);
        console.log('All users response:', usersResponse.data);
        const filteredUsers = usersResponse.data.filter((user) => user.username !== username);
        console.log('Filtered suggested users:', filteredUsers);
        setSuggestedUsers(filteredUsers);
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError('Failed to load dashboard data');
        if (err.response?.status === 401) {
          console.log('Unauthorized, redirecting to login');
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchData();
  }, [token, navigate]);

  const handleFollowToggle = async (targetUsername) => {
    const isFollowing = following.includes(targetUsername);
    const action = isFollowing ? 'unfollow' : 'follow';

    setFollowing((prev) =>
      isFollowing ? prev.filter((u) => u !== targetUsername) : [...prev, targetUsername]
    );

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/users/${action}/${targetUsername}`;
      await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`${action} successful for ${targetUsername}`);
    } catch (err) {
        setFollowing((prev) => {
            isFollowing ? [...prev, targetUsername]: prev.filter((u) => u !== targetUsername )
          })
      setError(`Failed to ${action} user`);
      console.error(`Follow toggle error:`, err.response?.data || err.message);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/user/${username}`);
  };

  console.log('Rendering Dashboard, suggestedUsers:', suggestedUsers, 'error:', error);

  if (!token) return <div className="text-center mt-10 text-red-500">Please log in</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Left Sidebar: Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="w-full md:w-4/5 md:ml-64 p-4 flex flex-col md:flex-row">
        {/* Reels Feed */}
        <div className="w-full md:w-3/5 p-4">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Reels Feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-gray-600">
                <p className="text-lg">Reels coming soon!</p>
                <p className="text-sm">This section will display your reels feed.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggested Users */}
        <div className="w-full md:w-2/5 p-4">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold">Suggested Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestedUsers.length === 0 ? (
                <p className="text-center text-gray-600">No suggested users found</p>
              ) : (
                suggestedUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-2 border-b border-gray-200">
                    <div
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={() => handleUserClick(user.username)}
                    >
                      <img
                        src={user.profilePicture || 'https://via.placeholder.com/40'}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold hover:text-blue-500">{user.username}</p>
                        <p className="text-xs text-gray-600">{user.name || 'No name'}</p>
                      </div>
                    </div>
                    <Button
                      variant={following.includes(user.username) ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => handleFollowToggle(user.username)}
                    >
                      {following.includes(user.username) ? 'Unfollow' : 'Follow'}
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;