import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const EmailVerification = () => {
  const [status, setStatus] = useState('verifying');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        {status === 'verifying' && <p>Verifying your email...</p>}
        {status === 'success' && <p>Email verified successfully! Redirecting to login...</p>}
        {status === 'error' && <p>Verification failed. Please try again or contact support.</p>}
      </div>
    </div>
  );
};

export default EmailVerification;