import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    };
    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear token
    navigate('/login'); // Redirect to login
  };

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
          <div className="flex flex-col space-y-2 w-full max-w-xs">
            <Button variant="outline" onClick={() => navigate('/edit-profile')}>
              Edit Profile
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;