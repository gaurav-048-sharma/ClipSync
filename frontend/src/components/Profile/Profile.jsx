import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchProfileData = async () => {
    try {
      const profileResponse = await axios.get('http://localhost:5000/api/users/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(profileResponse.data);

      const username = profileResponse.data.authId.username;
      const followersResponse = await axios.get(`http://localhost:5000/api/users/followers/${username}`);
      setFollowersCount(followersResponse.data.followers.length);

      const followingResponse = await axios.get(`http://localhost:5000/api/users/following/${username}`);
      setFollowingCount(followingResponse.data.following.length);
    } catch (err) {
      console.error('Profile fetch error:', err);
      if (err.response && [401, 404, 500].includes(err.response.status)) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Refresh counts when navigating back to profile
  useEffect(() => {
    const handleFocus = () => fetchProfileData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token, navigate]);

  if (!profile) return <div className="text-center mt-10 text-lg">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center space-y-6">
          <img
            src={profile.profilePicture || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gray-200"
          />
          <div className="text-center space-y-2">
            <p className="text-lg md:text-xl font-semibold">{profile.authId.username}</p>
            <p className="text-md md:text-lg text-gray-700">{profile.authId.name}</p>
            <p className="text-sm md:text-md text-gray-600">{profile.bio || 'No bio yet'}</p>
          </div>
          <div className="flex flex-col space-y-4 w-full max-w-xs">
            <Button variant="outline" onClick={() => navigate('/edit-profile')}>
              Edit Profile
            </Button>
            <Button variant="outline" onClick={() => navigate(`/reels/${profile.authId.username}`)}>
              View Reels
            </Button>
            <Button variant="outline" onClick={() => navigate('/upload-reel')}>
              Upload Reel
            </Button>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/followers/${profile.authId.username}`)}
                className="w-full"
              >
                Followers
              </Button>
              <p className="text-sm text-gray-600 text-center">{followersCount}</p>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/following/${profile.authId.username}`)}
                className="w-full"
              >
                Following
              </Button>
              <p className="text-sm text-gray-600 text-center">{followingCount}</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/suggested-users')} className="w-full">
              Suggested Users
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;