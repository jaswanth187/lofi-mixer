import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';

const UploadTrack = () => {
  const [file, setFile] = useState(null);
  const [trackInfo, setTrackInfo] = useState({ name: '', artist: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploadProgress(0);

    try {
      if (!file) {
        throw new Error('Please select an audio file');
      }

      // Validate input fields
      if (!trackInfo.name.trim() || !trackInfo.artist.trim()) {
        throw new Error('Track name and artist are required');
      }

      // Validate file type
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only MP3 and WAV files are allowed');
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`File size (${(file.size/1024/1024).toFixed(2)}MB) exceeds 10MB limit`);
      }

      const formData = new FormData();
      formData.append('audio', file);
      formData.append('name', trackInfo.name.trim());
      formData.append('artist', trackInfo.artist.trim());

      const response = await api.post('/upload/track', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.status === 201) {
        toast.success('Track uploaded successfully');
        navigate('/my-tracks');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };


  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl">
        <p className="text-white text-center">Please login to upload tracks</p>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
    <div className="max-w-md mx-auto mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Upload Track</h2>
      {error && (
        <div className="mb-4 p-2 bg-red-500/10 border border-red-500 rounded text-red-500">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Track Name"
          onChange={(e) => setTrackInfo({...trackInfo, name: e.target.value})}
          className="w-full p-2 rounded bg-white/10 text-white"
          required
        />
        <input
          type="text"
          placeholder="Artist Name"
          onChange={(e) => setTrackInfo({...trackInfo, artist: e.target.value})}
          className="w-full p-2 rounded bg-white/10 text-white"
          required
        />
        <input
          type="text"
          placeholder="Cover Art URL (optional)"
          onChange={(e) => setTrackInfo({...trackInfo, coverArt: e.target.value})}
          className="w-full p-2 rounded bg-white/10 text-white"
        />
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full p-2 rounded bg-white/10 text-white"
          required
        />
        <button 
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload Track'}
        </button>
      </form>
    </div>
    </div>
  );
};

export default UploadTrack;