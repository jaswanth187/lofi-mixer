import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {api} from '../services/api';
const UploadTrack = () => {
  const [file, setFile] = useState(null);
  const [trackInfo, setTrackInfo] = useState({
    name: '',
    artist: '',
    coverArt: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    if (!file) {
      setError('Please select an audio file');
      setLoading(false);
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('name', trackInfo.name);
      formData.append('artist', trackInfo.artist);
      formData.append('coverArt', trackInfo.coverArt || './images/default-cover.jpg');
  
      console.log('Uploading file:', file.name);
      
      const response = await api.post('/upload/track', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
  
      console.log('Upload response:', response.data);
      
      if (response.status === 201) {
        navigate('/my-tracks');
      }
    } catch (error) {
      console.error('Upload failed:', error.response?.data || error);
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
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
  );
};

export default UploadTrack;