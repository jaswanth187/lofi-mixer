import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, Coffee, Moon, Settings } from 'lucide-react';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Home className="w-6 h-6 text-white/80 hover:text-white cursor-pointer" />
            <Coffee className="w-6 h-6 text-white/80 hover:text-white cursor-pointer" />
          </div>
          <div className="text-xl font-bold text-white/90">Lofi Mixer</div>
          <div className="flex items-center space-x-4">
            <Moon className="w-6 h-6 text-white/80 hover:text-white cursor-pointer" />
            <Settings className="w-6 h-6 text-white/80 hover:text-white cursor-pointer" />
            <button 
              onClick={handleLogout}
              className="text-white/80 hover:text-white cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;