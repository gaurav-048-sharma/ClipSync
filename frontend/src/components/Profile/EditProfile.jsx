import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const EditProfile = ({ onClose, onSave, initialData, token }) => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: '',
    profilePicture: null,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('EditProfile mounted, initialData:', initialData); // Debug initial data
    if (initialData) {
      setFormData({
        username: initialData.authId.username || '',
        name: initialData.authId.name || '',
        bio: initialData.bio || '',
        profilePicture: null,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    if (e.target.name === 'profilePicture') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    const data = new FormData();
    data.append('username', formData.username);
    data.append('name', formData.name);
    data.append('bio', formData.bio);
    if (formData.profilePicture) {
      data.append('profilePicture', formData.profilePicture);
    }

    try {
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Profile updated successfully, response.data:', response.data); // Debug response
      onSave(response.data); // Pass updated data back to Profile
      onClose(); // Close modal on success
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md shadow-lg bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
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
            <div className="flex space-x-4">
              <Button type="submit" className="w-full py-2 text-lg">Save Changes</Button>
              <Button variant="outline" className="w-full py-2 text-lg" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;