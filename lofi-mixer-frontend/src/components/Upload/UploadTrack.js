import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import { Music, Upload, AlertCircle } from 'lucide-react';

const ErrorAlert = ({ message }) => (
  <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
    <AlertCircle className="h-5 w-5 flex-shrink-0" />
    <p>{message}</p>
  </div>
);

const UploadTrack = () => {
  const [file, setFile] = useState(null);
  const [trackInfo, setTrackInfo] = useState({ name: '', artist: '', coverArt: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const [trackCount, setTrackCount] = useState(0);
  const UPLOAD_LIMIT = 4;
  const navigate = useNavigate();

  useEffect(() => {
    // Check existing track count
    const checkTrackCount = async () => {
      try {
        const response = await api.get('/upload/tracks', { withCredentials: true });
        setTrackCount(response.data.length);
      } catch (error) {
        console.error('Error checking track count:', error);
      }
    };
    checkTrackCount();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploadProgress(0);

    try {
      if (trackCount >= UPLOAD_LIMIT) {
        throw new Error(`Upload limit reached. Maximum ${UPLOAD_LIMIT} tracks allowed.`);
      }
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
        setTrackCount(prev => prev + 1);
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
  const renderUploadLimitWarning = () => {
    if (trackCount >= UPLOAD_LIMIT) {
      return (
        <div className="p-4 mb-6 rounded-lg bg-yellow-500/10 border border-yellow-500/50 text-yellow-400">
          <p>Upload limit reached. Maximum {UPLOAD_LIMIT} tracks allowed.</p>
        </div>
      );
    }
    return (
      <p className="text-white/50 text-sm">
        {UPLOAD_LIMIT - trackCount} uploads remaining
      </p>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="w-full max-w-md mx-4 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="text-center space-y-4">
            <Music className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-white/80">Please login to upload tracks</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 px-4">
      <div className="max-w-xl mx-auto">
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              <Upload className="w-6 h-6 text-emerald-500" />
              Upload Your Track
            </h2>
          </div>

          <div className="p-6">
          {renderUploadLimitWarning()}
            {error && <ErrorAlert message={error} />}
            
            <form onSubmit={handleSubmit} className="space-y-6" disabled={trackCount >= UPLOAD_LIMIT}>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Track Name"
                    onChange={(e) => setTrackInfo({...trackInfo, name: e.target.value})}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 
                             focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    required
                  />
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Artist Name"
                    onChange={(e) => setTrackInfo({...trackInfo, artist: e.target.value})}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 
                             focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    required
                  />
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cover Art URL (optional)"
                    onChange={(e) => setTrackInfo({...trackInfo, coverArt: e.target.value})}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 
                             focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <label className="block w-full cursor-pointer">
                    <div className="p-8 rounded-lg border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-all">
                      <div className="text-center">
                        <Music className="mx-auto h-12 w-12 text-emerald-500/80" />
                        <div className="mt-4 flex text-sm leading-6 text-white/70 justify-center">
                          <span className="relative rounded-md font-semibold text-emerald-400 focus-within:outline-none focus-within:ring-2">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => setFile(e.target.files[0])}
                              className="sr-only"
                              required
                            />
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-white/50 mt-2">MP3 or WAV up to 10MB</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {uploadProgress > 0 && (
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full p-3 rounded-lg bg-emerald-500 text-white font-medium
                         hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500/20
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Uploading...' : 'Upload Track'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadTrack;