import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, googleAuth } from "../services/api";
import styles from "./Auth.module.css";
import { toast } from "react-hot-toast";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    googleAuth();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!credentials.password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginUser(credentials);
      if (data.user) {
        login(data.user);
        toast.success("Login successful");
        navigate("/");
      }
    } catch (error) {
      setErrors({ form: error.message });
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h2 className={styles.authTitle}>Login</h2>

        {errors.form && (
          <div className="mb-4 p-2 bg-red-500/10 border border-red-500 rounded text-red-500">
            {errors.form}
          </div>
        )}

        <div className="space-y-1">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
            className={`${styles.authInput} ${
              errors.username ? "border-red-500" : ""
            }`}
            disabled={isLoading}
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username}</p>
          )}
        </div>

        <div className="space-y-1">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            className={`${styles.authInput} ${
              errors.password ? "border-red-500" : ""
            }`}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className={`${styles.authButton} ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className={styles.googleButton}
          disabled={isLoading}
        >
          Login with Google
        </button>

        <p className={styles.authLink}>
          Don't have an account?{" "}
          <Link to="/register" className={styles.link}>
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
