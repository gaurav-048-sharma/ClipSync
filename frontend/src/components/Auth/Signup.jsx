import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manual Signup
  const handleManualSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', formData);
      console.log('Manual Signup successful:', response.data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  // Google Signup
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/google-login', {
        token: credentialResponse.credential,
      });
      localStorage.setItem('token', response.data.token);
      console.log('Google Signup successful:', response.data);
      navigate('/profile'); // Redirect to profile since user is authenticated
    } catch (err) {
      setError(err.response?.data?.message || 'Google Signup failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google Signup failed');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">Sign Up</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Manual Signup Form */}
          <form onSubmit={handleManualSignup} className="space-y-5">
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
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full"
                required
              />
            </div>
            <Button type="submit" className="w-full py-2 text-lg">Sign Up</Button>
          </form>

          {/* Google Signup */}
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-gray-600">Or sign up with Google</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="signup_with" // Changed to "signup_with" for signup context
              shape="rectangular"
              size="large"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <p className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-500 hover:underline">Log in</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;