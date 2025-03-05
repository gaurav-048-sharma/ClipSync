import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
//import { Button } from '../ui/button';

const Reels = () => {
  const { username } = useParams(); // Get username from URL
  const [reels, setReels] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/profile/reels/user/${username}`);
        setReels(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch reels');
      }
    };
    fetchReels();
  }, [username]);

  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (reels.length === 0) return <div className="text-center mt-10 text-gray-600">No reels found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">{username} Reels</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {reels.map((reel) => (
            <Card key={reel._id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold truncate">{reel.caption || 'Untitled'}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <video
                  src={reel.videoUrl}
                  controls
                  className="w-full h-48 object-cover rounded-md"
                />
                <p className="mt-2 text-sm text-gray-600">Views: {reel.views}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reels;