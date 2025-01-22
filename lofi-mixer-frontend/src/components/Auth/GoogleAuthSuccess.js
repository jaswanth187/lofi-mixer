// In GoogleAuthSuccess.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkAuthStatus } from '../services/api';

export default function GoogleAuthSuccess() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { user } = await checkAuthStatus();
        if (user) {
          login(user);
          navigate('/');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Authentication verification failed:', error);
        navigate('/login');
      }
    };

    verifyAuth();
  }, [login, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-white text-xl">
        Completing authentication...
      </div>
    </div>
  );
}