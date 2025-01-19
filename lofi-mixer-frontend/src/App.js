import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LofiMixer from './components/LofiMixer/LofiMixer';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { AuthProvider } from './components/context/AuthContext';
import PublicRoute from './components/Layout/PublicRoute';
import UploadTrack from './components/Upload/UploadTrack';
import UserTracks from './components/Tracks/UserTracks';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
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
          <Route path="/" element={<LofiMixer />} />
          <Route path="/upload" element={<UploadTrack />} />
          <Route path='/my-tracks' element={<UserTracks />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;