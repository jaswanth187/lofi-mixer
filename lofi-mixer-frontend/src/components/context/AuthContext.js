import { createContext, useState, useContext, useEffect } from "react";
import { api } from '../services/api';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // Set loading to false after checking storage
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await api.get("/auth/me");
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
        }
      }
    };

    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000); // Check every 5 minutes

    // Initial check
    checkAuthStatus();

    return () => clearInterval(interval);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    // Clear all cookies
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
