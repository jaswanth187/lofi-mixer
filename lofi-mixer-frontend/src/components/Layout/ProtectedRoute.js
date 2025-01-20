import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state or spinner while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
