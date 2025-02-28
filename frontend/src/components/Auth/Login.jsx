import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      console.log('Manual Login successful:', response.data);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/google-login', {
        token: credentialResponse.credential,
      });
      localStorage.setItem('token', response.data.token);
      console.log('Google Login successful:', response.data);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google Login failed');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">Log In</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Manual Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-5">
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
            <Button type="submit" className="w-full py-2 text-lg">Log In</Button>
          </form>

          {/* Google Login */}
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-gray-600">Or Login with Google</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="signin_with"
              shape="rectangular"
              size="large"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <p className="text-sm text-center text-gray-600">
            Don’t have an account?{' '}
            <a href="/signup" className="text-blue-500 hover:underline">Sign up</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;