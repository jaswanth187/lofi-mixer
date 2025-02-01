import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Allow access to reset-password route even if user is authenticated
  if (location.pathname.includes("/reset-password/")) {
    return children;
  }

  if (user) {
    // Redirect to the page they tried to visit or home
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return children;
}
