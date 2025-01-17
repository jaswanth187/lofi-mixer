import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, Coffee, Moon } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    if (userParam) {
      const userData = JSON.parse(decodeURIComponent(userParam));
      login(userData);
      navigate('/'); // Remove query params from URL
    }
  }, [login, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // First call the backend logout endpoint
      await axios.get('http://localhost:3000/auth/logout', { 
        withCredentials: true 
      });
      
      // Then clear frontend state and storage
      await logout();
      
      // Finally navigate
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('');
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
          <div className="flex items-center space-x-4 relative">
            <Moon className="w-6 h-6 text-white/80 hover:text-white cursor-pointer" />
            {user && (
              <div className="relative" ref={dropdownRef}>
                <div 
                  className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center cursor-pointer"
                  onClick={toggleDropdown}
                >
                  <span className="text-center">{getInitials(user.username)}</span>
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm">{user.username}</div>
                    <div className="border-t border-gray-700"></div>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
            {!user && (
              <button 
                onClick={() => navigate('/login')}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;