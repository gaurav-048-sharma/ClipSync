import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

const UploadReel = () => {
  const [formData, setFormData] = useState({
    caption: '',
    video: null,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    if (e.target.name === 'video') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('caption', formData.caption);
    data.append('video', formData.video);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/profile/reels`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Reel uploaded:', response.data);
      navigate(`/profile`); // Redirect to profile after upload
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">Upload Reel</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="caption" className="text-sm font-medium">Caption</Label>
              <Input
                id="caption"
                name="caption"
                type="text"
                value={formData.caption}
                onChange={handleChange}
                placeholder="Enter a caption"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video" className="text-sm font-medium">Video</Label>
              <Input
                id="video"
                name="video"
                type="file"
                accept="video/*"
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full py-2 text-lg">Upload Reel</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadReel;