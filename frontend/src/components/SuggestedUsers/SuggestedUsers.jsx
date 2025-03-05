import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

const SuggestedUsers = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('Please log in to see suggested users');
        return;
      }

      try {
        const profileResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const username = profileResponse.data.authId.username;
        console.log('Logged-in username:', username);

        const followingResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/following/${username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const followingList = followingResponse.data.following.map((user) => user.authId.username);
        setFollowing(followingList);
        console.log('Initial following list:', followingList);

        const usersResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/all`);
        console.log('All users from backend:', usersResponse.data);

        const filteredUsers = usersResponse.data.filter((user) => user.username !== username);
        console.log('Filtered suggested users:', filteredUsers);

        setSuggestedUsers(filteredUsers);
      } catch (err) {
        console.error('Fetch error:', err.message, err.response?.data, err.response?.status);
        setError(err.response?.data?.message || 'Failed to fetch suggested users');
      }
    };
    fetchData();
  }, [token]);

  const handleFollowToggle = async (targetUsername) => {
    const isFollowing = following.includes(targetUsername);
    const action = isFollowing ? 'unfollow' : 'follow';

    setFollowing((prev) => {
      const newFollowing = isFollowing
        ? prev.filter((u) => u !== targetUsername)
        : [...prev, targetUsername];
      console.log(`Optimistic ${action} - Target: ${targetUsername}, New following:`, newFollowing);
      return newFollowing;
    });

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/users/${action}/${targetUsername}`;
      console.log('Sending request to:', url, 'with token:', token);
      const response = await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`${action.charAt(0).toUpperCase() + action.slice(1)}ed ${targetUsername}:`, response.data);
    } catch (err) {
      console.error(`${action} error:`, {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setFollowing((prev) => {
        const revertedFollowing = isFollowing
          ? [...prev, targetUsername]
          : prev.filter((u) => u !== targetUsername);
        console.log(`Reverted ${action} - Following:`, revertedFollowing);
        return revertedFollowing;
      });
      setError(err.response?.data?.message || `${action} failed`);
    }
  };

  const handleUserClick = (username) => {
    console.log('Navigating to user profile:', username);
    navigate(`/user/${username}`);
  };

  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (suggestedUsers.length === 0) return <div className="text-center mt-10 text-gray-600">No suggested users found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">Suggested Users</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {suggestedUsers.map((user) => (
            <Card key={user._id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle
                  className="text-lg font-semibold cursor-pointer hover:text-blue-500"
                  onClick={() => handleUserClick(user.username)} // Pass username directly
                >
                  {user.username}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex justify-between items-center">
                <p className="text-md text-gray-700">{user.name || 'No name'}</p>
                {token && (
                  <Button
                    variant={following.includes(user.username) ? 'destructive' : 'outline'}
                    onClick={() => handleFollowToggle(user.username)}
                  >
                    {following.includes(user.username) ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestedUsers;