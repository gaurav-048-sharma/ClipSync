import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import Navbar from '../Dashboard/Navbar';

const UserProfile = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [reels, setReels] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        console.log('Fetching user data for:', username, 'with token:', token);
        const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/user/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('User response:', userResponse.data);
        setUserData(userResponse.data);

        const followersResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/followers/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowersCount(followersResponse.data.followers.length);

        const followingResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/following/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowingCount(followingResponse.data.following.length);

        const profileResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const followingResponseCurrent = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/following/${profileResponse.data.authId.username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const followingList = followingResponseCurrent.data.following.map((user) => user.authId.username);
        console.log('Following list:', followingList);
        setIsFollowing(followingList.includes(username));

        setReels([1, 2, 3]);
      } catch (err) {
        console.error('Fetch error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.response?.data?.message || 'Failed to fetch user profile');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchUserData();
  }, [username, token, navigate]);

  const handleFollowToggle = async () => {
    const action = isFollowing ? 'unfollow' : 'follow';
    setIsFollowing(!isFollowing);

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/users/${action}/${username}`;
      console.log('Sending request to:', url, 'with token:', token);
      await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`${action.charAt(0).toUpperCase() + action.slice(1)}ed ${username}`);
      setFollowersCount((prev) => (action === 'follow' ? prev + 1 : prev - 1));
    } catch (err) {
      console.error(`${action} error:`, {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setIsFollowing(isFollowing);
      setError(err.response?.data?.message || `${action} failed`);
    }
  };

  const handleMessageClick = () => {
    if (userData && userData._id) {
      console.log('Navigating to messages with userId:', userData._id);
      navigate(`/messages/${userData._id}`);
    } else {
      console.error('User ID not available in userData:', userData);
      setError('User ID not available');
    }
  };

  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!userData) return <div className="text-center mt-10 text-lg">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <Navbar />
      <div className="w-full md:w-4/5 md:ml-64 p-4 flex flex-col">
        <div className="w-full max-w-4xl mx-auto mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 p-4">
            <img
              src={userData.profilePicture || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-gray-300"
            />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-semibold mb-2">{userData.authId?.username || 'Unknown'}</h2>
              <div className="flex justify-center md:justify-start space-x-6 mb-4">
                <div className="text-center">
                  <span className="font-bold">{reels.length}</span>
                  <p className="text-sm text-gray-600">Posts</p>
                </div>
                <div
                  className="text-center cursor-pointer hover:underline"
                  onClick={() => navigate(`/followers/${userData.authId?.username}`)}
                >
                  <span className="font-bold">{followersCount}</span>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div
                  className="text-center cursor-pointer hover:underline"
                  onClick={() => navigate(`/following/${userData.authId?.username}`)}
                >
                  <span className="font-bold">{followingCount}</span>
                  <p className="text-sm text-gray-600">Following</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-md font-medium text-gray-900">{userData.authId?.name || 'No name'}</p>
                <p className="text-sm text-gray-600">{userData.bio || 'No bio yet'}</p>
                {userData.segregation && userData.segregation.type === 'student' && (
                  <p className="text-sm text-gray-500">
                    {userData.segregation.year}-{userData.segregation.dept}-{userData.segregation.roll}
                  </p>
                )}
              </div>
              {token && (
                <div className="flex justify-center md:justify-start space-x-2">
                  <Button
                    variant={isFollowing ? 'destructive' : 'outline'}
                    className="w-full max-w-[120px] py-2 text-sm font-semibold"
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full max-w-[120px] py-2 text-sm font-semibold"
                    onClick={handleMessageClick}
                  >
                    Message
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full max-w-4xl mx-auto">
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-center mb-4">Posts</h3>
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {reels.length === 0 ? (
                <p className="text-center text-gray-600 col-span-3">No reels posted yet</p>
              ) : (
                reels.map((reel, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-300 flex items-center justify-center cursor-pointer hover:opacity-80"
                    onClick={() => navigate(`/reels/${userData.authId?.username}`)}
                  >
                    <span className="text-white text-sm">Reel {index + 1}</span>
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

export default UserProfile;