// src/components/Profile/EditProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: '',
    profilePicture: null,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData({
          username: response.data.authId.username,
          name: response.data.authId.name,
          bio: response.data.bio || '',
          profilePicture: null,
        });
      } catch (err) {
        console.error('Fetch profile error:', err);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    if (e.target.name === 'profilePicture') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('username', formData.username);
    data.append('name', formData.name);
    data.append('bio', formData.bio);
    if (formData.profilePicture) {
      data.append('profilePicture', formData.profilePicture);
    }

    try {
      const response = await axios.put('http://localhost:5000/api/users/', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Profile updated:', response.data);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
              <Input
                id="bio"
                name="bio"
                type="text"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Enter your bio"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profilePicture" className="text-sm font-medium">Profile Picture</Label>
              <Input
                id="profilePicture"
                name="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="w-full"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full py-2 text-lg">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;