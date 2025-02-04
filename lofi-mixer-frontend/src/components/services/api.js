import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// const FRONTEND_URL = "http://localhost:3001";

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Don't redirect to login for password reset related routes
    const isPasswordResetRoute =
      window.location.pathname.includes("reset-password") ||
      window.location.pathname.includes("forgot-password");

    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login") &&
      !isPasswordResetRoute
    ) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export const sendPasswordResetEmail = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", {
      email: credentials.email.toLowerCase(),
      password: credentials.password,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Registration failed. Please try again.");
  }
};
export const resendVerification = async (email) => {
  try {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const googleAuth = () => {
  // Using absolute URL for backend
  window.location.href = `${BACKEND_URL}/auth/google`;
};

export const checkAuthStatus = async () => {
  try {
    const response = await api.get("/auth/me", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.get("/auth/logout", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.message || "An error occurred";
  } else if (error.request) {
    // Request made but no response
    return "No response from server. Please try again later.";
  } else {
    // Request setup error
    return "Error setting up request. Please try again.";
  }
};
