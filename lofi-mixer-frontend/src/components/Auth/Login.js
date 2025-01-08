import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import styles from './Auth.module.css';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(credentials);
      login(data.user);
      navigate('/'); // Redirect to root path after successful login
    } catch (error) {
      console.error('Login failed:', error);
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
          onChange={(e) => setCredentials({...credentials, username: e.target.value})}
        />
        <input
          type="password"
          placeholder="Password"
          className={styles.authInput}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        />
        <button type="submit" className={styles.authButton}>
          Login
        </button>
        <button 
          onClick={() => window.location.href = 'http://localhost:3000/auth/google'}
          className={styles.googleButton}
        >
          Login with Google
        </button>
      </form>
    </div>
  );
}