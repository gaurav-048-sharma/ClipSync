import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
//import { FcGoogle } from 'react-icons/fc';
import { BsMicrosoft } from 'react-icons/bs';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, formData);
      console.log('Manual Signup successful:', response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google-login`, {
        token: credentialResponse.credential,
      });
      localStorage.setItem('token', response.data.token);
      console.log('Google Signup successful:', response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Signup error:', err);
      setError('Google Signup failed');
    }
  };

  const handleMicrosoftSignup = async () => {
    try {
      const loginResponse = await instance.loginPopup(loginRequest);
      const msalToken = loginResponse.idToken;
      localStorage.setItem('msalToken', msalToken);

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/microsoft-login`, {
        token: msalToken,
      });
      localStorage.setItem('token', response.data.token);
      console.log('Microsoft Signup successful:', response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Microsoft Signup error:', err);
      setError('Microsoft Signup failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">Sign Up</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleManualSignup} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <Button type="submit" className="w-full py-2 text-lg">Sign Up</Button>
          </form>

          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-gray-600">Or sign up with</p>
            <GoogleLogin
              onSuccess={handleGoogleSignup}
              onError={() => setError('Google Signup failed')}
              text="signup_with"
              shape="rectangular"
              size="large"
            />
            <Button
              onClick={handleMicrosoftSignup}
              className="w-[50%]  flex items-center justify-center space-x-2 bg-white text-black border border-gray-300 hover:bg-gray-100"
            >
              <BsMicrosoft className="w-5 h-5" />
              <span>Sign up with Microsoft</span>
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <p className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} className="text-blue-500 hover:underline cursor-pointer">
              Log in
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;