import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, googleAuth } from '../services/api';
import styles from './Auth.module.css';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    googleAuth();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!credentials.username || !credentials.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const data = await loginUser(credentials);
      login(data.user);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2 className={styles.authTitle}>Login</h2>
        <input
          type="text"
          placeholder="Username"
          className={styles.authInput}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className={styles.authInput}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        />
        <button type="submit" className={styles.authButton}>
          Login
        </button>
        <button
          onClick={handleGoogleLogin}
          className={styles.googleButton}
          type="button"
        >
          Login with Google
        </button>
        <p className={styles.authLink}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>
            Register here
          </Link>
        </p>
      </form>
      <Toaster position="top-right" />
    </div>
  );
}