import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LofiMixer from './components/LofiMixer/LofiMixer';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import GoogleAuthSuccess from './components/Auth/GoogleAuthSuccess';
import { AuthProvider } from './components/context/AuthContext';
import PublicRoute from './components/Layout/PublicRoute';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import UploadTrack from './components/Upload/UploadTrack';
import UserTracks from './components/Tracks/UserTracks';
import Navbar from './components/Layout/Navbar';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<LofiMixer />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/auth/google/success"
              element={
                <PublicRoute>
                  <GoogleAuthSuccess />
                </PublicRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadTrack />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-tracks"
              element={
                <ProtectedRoute>
                  <UserTracks />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;