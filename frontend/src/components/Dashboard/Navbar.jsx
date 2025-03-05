import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('msalToken');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 w-full md:w-64 h-auto md:h-screen bg-black text-white p-4 flex flex-col shadow-lg z-10 font-serif">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Reels App</h1>
      </div>
      <div className="flex flex-col space-y-4 md:flex-1">
        <Button
          variant="ghost"
          className="w-full py-2 text-lg text-white hover:bg-gray-700 hover:text-white justify-start"
          onClick={() => navigate('/dashboard')}
        >
          Home
        </Button>
        <Button
          variant="ghost"
          className="w-full py-2 text-lg text-white hover:bg-gray-700 hover:text-white justify-start"
          onClick={() => navigate('/messages')}
        >
          Messages
        </Button>

        <Button
          variant="ghost"
          className="w-full py-2 text-lg text-white hover:bg-gray-700 hover:text-white justify-start"
          onClick={() => navigate('/profile')}
        >
          Profile
        </Button>
        <Button
          variant="ghost"
          className="w-full py-2 text-lg text-white hover:bg-gray-700 hover:text-white justify-start"
          onClick={() => navigate('/upload-reel')}
        >
          Upload Reel
        </Button>
        <Button
          variant="ghost"
          className="w-full py-2 text-lg text-white hover:bg-gray-700 hover:text-white justify-start"
          onClick={() => navigate('/suggested-users')}
        >
          Suggested Users
        </Button>
        {token && (
          <Button
            variant="destructive"
            className="w-full py-2 text-lg bg-red-600 hover:bg-red-700 justify-start"
            onClick={handleLogout}
          >
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;