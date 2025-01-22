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
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials, {
    withCredentials: true
  });
  return response.data;
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