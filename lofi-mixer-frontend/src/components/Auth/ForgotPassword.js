import React, { useState } from "react";
import { sendPasswordResetEmail } from "../services/api";
import { toast } from "react-hot-toast";
import styles from "./Auth.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await sendPasswordResetEmail(email);
      console.log("Reset email sent:", response);
      toast.success("Password reset link sent to your email");
      setEmail(""); // Clear the form
    } catch (error) {
      console.error("Reset email error:", error);
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2 className={styles.authTitle}>Reset Password</h2>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.authInput}
            required
          />
          <button
            type="submit"
            className={styles.authButton}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
