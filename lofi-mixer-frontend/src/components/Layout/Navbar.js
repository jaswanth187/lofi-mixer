import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Upload, Music, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Handle initial auth from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    if (userParam) {
      const userData = JSON.parse(decodeURIComponent(userParam));
      login(userData);
      navigate('/');
    }
  }, [login, navigate]);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Enhanced logout handler
  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:3000/auth/logout', { 
        withCredentials: true 
      });
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-white">
            Lofi Mixer
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="text-white/80 hover:text-white transition-colors duration-200">
              <Home className="w-5 h-5" />
            </Link>

            {user && (
              <>
                <Link to="/upload" className="text-white/80 hover:text-white transition-colors duration-200">
                  <Upload className="w-5 h-5" />
                </Link>
                <Link to="/my-tracks" className="text-white/80 hover:text-white transition-colors duration-200">
                  <Music className="w-5 h-5" />
                </Link>
              </>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
                >
                  <UserCircle className="w-6 h-6" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-900/95 backdrop-blur-lg ring-1 ring-white/10">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-white/90 border-b border-white/10">
                        {user.username}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="text-white/80 hover:text-white transition-colors duration-200"
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