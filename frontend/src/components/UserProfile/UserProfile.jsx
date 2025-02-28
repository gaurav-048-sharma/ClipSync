import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

const UserProfile = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setError('Please log in to view user profiles');
        return;
      }

      try {
        console.log('Fetching user data for:', username, 'with token:', token);
        const userResponse = await axios.get(`http://localhost:5000/api/auth/user/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('User response:', userResponse.data);
        setUserData(userResponse.data);

        const profileResponse = await axios.get('http://localhost:5000/api/users/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const followingResponse = await axios.get(
          `http://localhost:5000/api/users/following/${profileResponse.data.authId.username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const followingList = followingResponse.data.following.map((user) => user.authId.username);
        console.log('Following list:', followingList);
        setIsFollowing(followingList.includes(username));
      } catch (err) {
        console.error('Fetch error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.response?.data?.message || 'Failed to fetch user profile');
      }
    };
    fetchUserData();
  }, [username, token]);

  const handleFollowToggle = async () => {
    const action = isFollowing ? 'unfollow' : 'follow';

    setIsFollowing(!isFollowing);

    try {
      const url = `http://localhost:5000/api/users/${action}/${username}`;
      console.log('Sending request to:', url, 'with token:', token);
      const response = await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`${action.charAt(0).toUpperCase() + action.slice(1)}ed ${username}:`, response.data);
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

  const handleBack = () => {
    navigate(-1);
  };

  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!userData) return <div className="text-center mt-10 text-lg">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            {userData.authId?.username ? `${userData.authId.username}'s Profile` : 'Profile'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center space-y-6">
          <img
            src={userData.profilePicture || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gray-200"
          />
          <div className="text-center space-y-2">
            <p className="text-lg md:text-xl font-semibold">{userData.authId?.username || 'Unknown'}</p>
            <p className="text-md md:text-lg text-gray-700">{userData.authId?.name || 'No name'}</p>
            <p className="text-sm md:text-md text-gray-600">{userData.bio || 'No bio yet'}</p>
          </div>
          {token && (
            <Button
              variant={isFollowing ? 'destructive' : 'outline'}
              onClick={handleFollowToggle}
              className="w-full max-w-xs"
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
          <Button variant="outline" onClick={handleBack} className="w-full max-w-xs">
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;