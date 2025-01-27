import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import styles from './Auth.module.css';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function Register() {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!userData.username || !userData.password || !userData.email) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await registerUser(userData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
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
        <h2 className={styles.authTitle}>Register</h2>
        <input
          type="text"
          placeholder="Username"
          className={styles.authInput}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className={styles.authInput}
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className={styles.authInput}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
        />
        <button type="submit" className={styles.authButton}>
          Register
        </button>
        <p className={styles.authLink}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Login here
          </Link>
        </p>
        {/* <button
          onClick={() => window.location.href = 'http://localhost:3000/auth/google'}
          className={styles.googleButton}
        >
          Register with Google
        </button> */}
      </form>
      <Toaster position="top-right" />
    </div>
  );
}