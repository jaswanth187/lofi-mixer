import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import styles from './Auth.module.css';

export default function Register() {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(userData);
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2 className={styles.authTitle}>Register</h2>
        <input
          type="text"
          placeholder="Username"
          className={styles.authInput}
          onChange={(e) => setUserData({...userData, username: e.target.value})}
        />
        <input
          type="password"
          placeholder="Password"
          className={styles.authInput}
          onChange={(e) => setUserData({...userData, password: e.target.value})}
        />
        <input
          type="email"
          placeholder="Email"
          className={styles.authInput}
          onChange={(e) => setUserData({...userData, email: e.target.value})}
        />
        <button type="submit" className={styles.authButton}>
          Register
        </button>
      </form>
    </div>
  );
}