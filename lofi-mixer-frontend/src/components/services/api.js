import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear local storage and cookies
      localStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      // Force logout and redirect
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const googleAuth = () => {
  // Using absolute URL for backend
  window.location.href = 'http://localhost:3000/auth/google';
};

export const checkAuthStatus = async () => {
  try {
    const response = await api.get('/auth/me', {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.get('/auth/logout', {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please try again later.';
  } else {
    // Request setup error
    return 'Error setting up request. Please try again.';
  }
};