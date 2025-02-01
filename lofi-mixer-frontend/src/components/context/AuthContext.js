import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        if (response.data.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    api
      .get("/auth/logout")
      .then(() => navigate("/login"))
      .catch((err) => console.error("Logout error:", err));
  }, [navigate]);

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
