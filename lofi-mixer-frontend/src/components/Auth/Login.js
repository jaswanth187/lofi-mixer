import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, googleAuth, resendVerification } from "../services/api";
import styles from "./Auth.module.css";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    try {
      await resendVerification(userEmail);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error) {
      toast.error(error.message || "Failed to resend verification email");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    googleAuth();
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!credentials.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(credentials.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!credentials.password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await loginUser(credentials);
      login(data.user);
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      if (error.message.includes("Email not verified")) {
        setNeedsVerification(true);
        setUserEmail(credentials.email);
        toast.error("Please verify your email first");
      } else {
        setErrors({ form: error.message });
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h2 className={styles.authTitle}>Login</h2>

        <div className="space-y-1">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={credentials.email}
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
            className={`${styles.authInput} ${
              errors.email ? "border-red-500" : ""
            }`}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        <div className="relative space-y-1">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            className={`${styles.authInput} pr-10 ${
              errors.password ? "border-red-500" : ""
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <Link to="/forgot-password" className={styles.link}>
            Forgot Password?
          </Link>
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

        {needsVerification && (
          <div className="mt-4 text-center bg-amber-100/10 p-4 rounded-lg">
            <p className="text-amber-400 mb-2">
              Email not verified. Please check your inbox or get a new
              verification link.
            </p>
            <button
              type="button"
              onClick={() => handleResendVerification(userEmail)}
              className="text-emerald-500 hover:text-emerald-400 text-sm font-medium"
            >
              Resend verification email
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
