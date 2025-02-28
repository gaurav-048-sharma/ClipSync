import { Routes, Route } from 'react-router-dom';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import Profile from './components/Profile/Profile';
import EditProfile from './components/Profile/EditProfile';
import Reels from './components/Reels/Reels';
import UploadReel from './components/Reels/UploadReel';
import FollowList from './components/Follow/FollowList';
import SuggestedUsers from './components/SuggestedUsers/SuggestedUsers';
import UserProfile from './components/UserProfile/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {

  return (
    <div className="min-h-screen bg-gray-100">
    <Routes>
       <Route element={<PublicRoute />}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<h1 className="text-3xl font-bold text-center mt-10">Welcome to Reels App</h1>} />
        </Route>
      <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/reels/:username" element={<Reels />} />
          <Route path="/upload-reel" element={<UploadReel />} />
          <Route path="/followers/:username" element={<FollowList type="followers" />} />
          <Route path="/following/:username" element={<FollowList type="following" />} />
          <Route path="/suggested-users" element={<SuggestedUsers />} />
          <Route path="/user/:username" element={<UserProfile />} />
          {/* Add more protected routes here later (e.g., reels, followers) */}
        </Route>
    </Routes>
  </div>
  )
}

export default App
