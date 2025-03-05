import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import Navbar from '../Dashboard/Navbar'; // Updated path
import EditProfile from './EditProfile';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [reels, setReels] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { instance, accounts } = useMsal();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchProfileData = async () => {
    try {
      const profileResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let graphData = {};
      if (accounts.length > 0) {
        const graphResponse = await instance.acquireTokenSilent({
          scopes: ['User.Read'],
          account: accounts[0],
        });
        graphData = await axios.get('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${graphResponse.accessToken}` },
        }).then((res) => res.data);
      }

      setProfile({
        authId: {
          username: profileResponse.data.authId.username,
          name: graphData.displayName || profileResponse.data.authId.name,
        },
        profilePicture: profileResponse.data.profilePicture,
        bio: profileResponse.data.bio,
        segregation: profileResponse.data.segregation,
      });

      const username = profileResponse.data.authId.username;
      const followersResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/followers/${username}`);
      setFollowersCount(followersResponse.data.followers.length);

      const followingResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/following/${username}`);
      setFollowingCount(followingResponse.data.following.length);

      // Placeholder for reels
      setReels([1, 2, 3, 4, 5, 6]);
    } catch (err) {
      console.error('Profile fetch error:', err);
      if (err.response && [401, 404, 500].includes(err.response.status)) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfileData();
  }, [token, navigate]);

  useEffect(() => {
    const handleFocus = () => fetchProfileData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token, navigate]);

  const handleSaveProfile = (updatedData) => {
    console.log('Saving profile data:', updatedData); // Debug save
    // Adjust based on actual server response structure
    setProfile({
      authId: {
        username: updatedData.username || profile.authId.username, // Fallback to current if missing
        name: updatedData.name || profile.authId.name,
      },
      profilePicture: updatedData.profilePicture || profile.profilePicture,
      bio: updatedData.bio || profile.bio,
      segregation: profile.segregation, // Preserve unchanged data
    });
  };

  const handleEditClick = () => {
    console.log('Edit Profile clicked, opening modal'); // Debug click
    setIsEditModalOpen(true);
  };

  if (!profile) return <div className="text-center mt-10 text-lg">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Left Sidebar: Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="w-full md:w-4/5 md:ml-64 p-4 flex flex-col">
        {/* Profile Header */}
        <div className="w-full max-w-4xl mx-auto mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 p-4">
            <img
              src={profile.profilePicture || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-gray-300"
            />
            <div className="flex-1 text-center md:text-left">
              {/* Username */}
              <h2 className="text-xl md:text-2xl font-semibold mb-2">{profile.authId.username}</h2>

              {/* Stats (Posts, Followers, Following) */}
              <div className="flex justify-center md:justify-start space-x-6 mb-4">
                <div className="text-center">
                  <span className="font-bold">{reels.length}</span>
                  <p className="text-sm text-gray-600">Posts</p>
                </div>
                <div
                  className="text-center cursor-pointer hover:underline"
                  onClick={() => navigate(`/followers/${profile.authId.username}`)}
                >
                  <span className="font-bold">{followersCount}</span>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div
                  className="text-center cursor-pointer hover:underline"
                  onClick={() => navigate(`/following/${profile.authId.username}`)}
                >
                  <span className="font-bold">{followingCount}</span>
                  <p className="text-sm text-gray-600">Following</p>
                </div>
              </div>

              {/* Name and Bio */}
              <div className="mb-4">
                <p className="text-md font-medium text-gray-900">{profile.authId.name}</p>
                <p className="text-sm text-gray-600">{profile.bio || 'No bio yet'}</p>
                {profile.segregation && profile.segregation.type === 'student' && (
                  <p className="text-sm text-gray-500">
                    {profile.segregation.year}-{profile.segregation.dept}-{profile.segregation.roll}
                  </p>
                )}
              </div>

              {/* Edit Profile Button */}
              <Button
                variant="outline"
                className="w-full max-w-xs py-2 text-sm font-semibold"
                onClick={handleEditClick}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Posted Reels Section */}
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
                    onClick={() => navigate(`/reels/${profile.authId.username}`)}
                  >
                    <span className="text-white text-sm">Reel {index + 1}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <EditProfile
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveProfile}
            initialData={profile}
            token={token}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;