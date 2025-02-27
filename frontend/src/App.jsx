import { Routes, Route } from 'react-router-dom';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import Profile from './components/Profile/Profile';
import EditProfile from './components/Profile/EditProfile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <div className="min-h-screen bg-gray-100">
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<h1 className="text-3xl font-bold text-center mt-10">Welcome to Reels App</h1>} />

      <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          {/* Add more protected routes here later (e.g., reels, followers) */}
        </Route>
    </Routes>
  </div>
  )
}

export default App
