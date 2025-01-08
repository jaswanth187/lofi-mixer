import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LofiMixer from './components/LofiMixer/LofiMixer';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { AuthProvider } from './components/context/AuthContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <LofiMixer />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;