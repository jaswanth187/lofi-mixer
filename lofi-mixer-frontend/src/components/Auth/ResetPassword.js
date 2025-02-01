import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../services/api";
import { toast } from "react-hot-toast";
import styles from "./Auth.module.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    console.log("Reset password token:", token);
  }, [token]);

  const validateForm = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[0-9])/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (password !== confirmPassword) {
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
      console.log("Attempting password reset with token:", token);
      const response = await resetPassword(token, password);
      console.log("Password reset response:", response);
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Password reset failed");
      setErrors({ form: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2 className={styles.authTitle}>Reset Password</h2>

        {errors.form && (
          <div className="text-red-500 text-sm text-center mb-4">
            {errors.form}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.authInput} ${
                errors.password ? "border-red-500" : ""
              }`}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${styles.authInput} ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`${styles.authButton} ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
