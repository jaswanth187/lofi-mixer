import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import styles from "./Auth.module.css";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    email: "",
    confirmPassword: "", // Added confirm password
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!userData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (userData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(userData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!userData.password) {
      newErrors.password = "Password is required";
    } else if (userData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[0-9])/.test(userData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(userData);
      toast.success(
        "Registration successful! Please check your email for verification link.",
        {
          duration: 6000,
          icon: "✅",
        }
      );
      navigate("/login", {
        state: {
          message: "Please verify your email before logging in.",
        },
      });
    } catch (error) {
      const errorMessage = error.message;

      if (errorMessage.includes("Username already exists")) {
        setErrors({
          username: "Username already taken",
          form: "Please choose a different username",
        });
        toast.error("Username already taken", {
          duration: 4000,
          icon: "❌",
        });
      } else if (errorMessage.includes("Email already exists")) {
        setErrors({
          email: "Email already registered",
          form: "Please use a different email",
        });
        toast.error("Email already registered", {
          duration: 4000,
          icon: "❌",
        });
      } else {
        setErrors({ form: errorMessage });
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2 className={styles.authTitle}>Register</h2>

        {/* {errors.form && (
          <div className="mb-4 p-2 bg-red-500/10 border border-red-500 rounded text-red-500">
            {errors.form}
          </div>
        )} */}

        <div className="space-y-1">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={userData.username}
            onChange={handleChange}
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
            type="email"
            name="email"
            placeholder="Email"
            value={userData.email}
            onChange={handleChange}
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
            value={userData.password}
            onChange={handleChange}
            className={`${styles.authInput} pr-10`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>

        <div className="relative space-y-1">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={userData.confirmPassword}
            onChange={handleChange}
            className={`${styles.authInput} pr-10`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className={`${styles.authButton} ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>

        <p className={styles.authLink}>
          Already have an account?{" "}
          <Link to="/login" className={styles.link}>
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
