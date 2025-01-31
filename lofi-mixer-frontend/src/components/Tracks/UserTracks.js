import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Music, Clock } from 'lucide-react';
import { Howl, Howler } from 'howler';
import { api } from '../services/api';
import Navbar from '../Layout/Navbar';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '--:--';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const VolumeSlider = ({ value, onChange }) => {
  return (
    <div className="relative group w-full">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-700/50 rounded-full appearance-none cursor-pointer 
                 hover:bg-gray-600/50 transition-all"
        style={{
          background: `linear-gradient(to right, rgba(16, 185, 129, 0.8) ${value}%, rgba(31, 41, 55, 0.3) ${value}%)`
        }}
      />
    </div>
  );
};

const TrackCard = ({ track, onTogglePlay, onVolumeChange, isLoading,onDelete }) => (
  <div className="group relative rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden
                 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl
                 hover:shadow-emerald-500/10">
    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
    
    <div className="relative h-48 overflow-hidden">
      <img
        src={track.coverImage} 
        alt={track.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = DEFAULT_COVERS[0];
        }}
      />
      
      <button
        onClick={() => onTogglePlay(track._id)}
        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 
                 group-hover:opacity-100 transition-all duration-300"
        disabled={isLoading}
      >
        <div className="p-4 rounded-full bg-emerald-500/80 hover:bg-emerald-600/80 
                     transform transition-all duration-300 hover:scale-110 backdrop-blur-sm">
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : track.isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white" />
          )}
        </div>
      </button>
    </div>

    <div className="relative p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-xl text-white mb-1 truncate">{track.name}</h3>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Music className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{track.artist}</span>
          </p>
        </div>
        <button
          onClick={() => onDelete(track._id)}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-500 transition-all"
          title="Delete track"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {formatTime(track.duration)}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <VolumeSlider
            value={track.volume}
            onChange={(value) => onVolumeChange(track._id, value)}
          />
        </div>
      </div>
    </div>
  </div>
);

const DEFAULT_COVERS = [
  '/images/my-tracks/image1.jpg',
  '/images/my-tracks/image2.jpg',
  '/images/my-tracks/image3.jpg',
  '/images/my-tracks/image4.jpg'
];

const coverAssignments = new Map();
let nextCoverIndex = 0;

const UserTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState(null);
  const howlRefs = useRef({});
  const loadedTracks = useRef(new Set());

  
  const getCoverForTrack = (trackId) => {
    if (!coverAssignments.has(trackId)) {
      const coverImage = DEFAULT_COVERS[nextCoverIndex];
      coverAssignments.set(trackId, coverImage);
      nextCoverIndex = (nextCoverIndex + 1) % DEFAULT_COVERS.length;
    }
    return coverAssignments.get(trackId);
  };

  useEffect(() => {
    fetchUserTracks();
  }, []);

  const fetchUserTracks = async () => {
    try {
      const response = await api.get('/upload/tracks', { withCredentials: true });
      
      coverAssignments.clear();
      nextCoverIndex = 0;
      
      const tracksWithData = response.data.map(track => ({
        ...track,
        volume: 50,
        isPlaying: false,
        duration: null,  // Initialize duration as null
        audioUrl: `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'}/upload/track/${track.filename}`,
        coverImage: getCoverForTrack(track._id)
      }));
      
      setTracks(tracksWithData);
  
      // Load duration for each track
      tracksWithData.forEach(track => loadTrack(track));
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  // const loadTrack = async (track) => {
  //   if (loadedTracks.current.has(track._id)) return;
  
  //   setLoadingTrackId(track._id);
    
  //   return new Promise((resolve) => {
  //     const howl = new Howl({
  //       src: [track.audioUrl],
  //       html5: true,
  //       preload: true,
  //       onload: function() {
  //         // Get duration immediately when loaded
  //         const duration = this.duration();
  //         console.log(`Duration loaded for ${track.name}:`, duration);
          
  //         setTracks(prevTracks => 
  //           prevTracks.map(t => 
  //             t._id === track._id 
  //               ? { ...t, duration: duration } 
  //               : t
  //           )
  //         );
  
  //         howlRefs.current[track._id] = this;
  //         loadedTracks.current.add(track._id);
  //         setLoadingTrackId(null);
  //         resolve();
  //       },
  //       onloaderror: (_, error) => {
  //         console.error(`Error loading ${track.name}:`, error);
  //         setLoadingTrackId(null);
  //         resolve();
  //       }
  //     });
  
  //     // Start loading the audio
  //     howl.load();
  //   });
  // };
  const loadTrack = async (track) => {
    if (loadedTracks.current.has(track._id)) return;
  
    setLoadingTrackId(track._id);
    
    return new Promise((resolve) => {
      const howl = new Howl({
        src: [track.audioUrl],
        html5: true,
        preload: true,
        loop: true, // Enable loop by default
        volume: track.volume / 100,
        onload: function() {
          const duration = this.duration();
          console.log(`Duration loaded for ${track.name}:`, duration);
          
          setTracks(prevTracks => 
            prevTracks.map(t => 
              t._id === track._id 
                ? { ...t, duration: duration } 
                : t
            )
          );
  
          howlRefs.current[track._id] = this;
          loadedTracks.current.add(track._id);
          setLoadingTrackId(null);
          resolve();
        },
        onloaderror: (_, error) => {
          console.error(`Error loading ${track.name}:`, error);
          setLoadingTrackId(null);
          resolve();
        },
        onend: () => {
          // Optional: If you want to handle anything when the track ends
          console.log(`Track ${track.name} finished playing, will loop automatically`);
        }
      });
  
      // Start loading the audio
      howl.load();
    });
  };
  const initializeAudio = async (trackId) => {
    if (!audioInitialized) {
      console.log('Initializing audio system...');
      
      Howler.autoUnlock = false;
      Howler.html5PoolSize = 10;
      
      try {
        const trackToLoad = tracks.find(t => t._id === trackId);
        if (trackToLoad) {
          await loadTrack(trackToLoad);
        }
        
        setAudioInitialized(true);
        
        const remainingTracks = tracks.filter(t => t._id !== trackId);
        for (const track of remainingTracks) {
          await loadTrack(track);
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    }
  };

  const togglePlay = async (id) => {
    if (!audioInitialized) {
      await initializeAudio(id);
    }

    const howl = howlRefs.current[id];
    if (!howl || !loadedTracks.current.has(id)) {
      console.log('Track not ready yet');
      return;
    }

    try {
      if (Howler.ctx?.state === 'suspended') {
        await Howler.ctx.resume();
      }

      setTracks(tracks.map(track => {
        if (track._id === id) {
          const newIsPlaying = !track.isPlaying;
          if (newIsPlaying) {
            howl.play();
          } else {
            howl.pause();
          }
          return { ...track, isPlaying: newIsPlaying };
        }
        return track;
      }));
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const adjustVolume = (id, newVolume) => {
    const howl = howlRefs.current[id];
    if (!howl || !loadedTracks.current.has(id)) return;

    howl.volume(newVolume / 100);
    setTracks(tracks.map(track =>
      track._id === id ? { ...track, volume: newVolume } : track
    ));
  };

  useEffect(() => {
    return () => {
      Object.values(howlRefs.current).forEach(howl => {
        if (howl) howl.unload();
      });
      loadedTracks.current.clear();
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this track?')) {
      return;
    }

    try {
      await api.delete(`/upload/track/${id}`, { withCredentials: true });
      
      // Update tracks state
      setTracks(tracks.filter(track => track._id !== id));
      
      // Cleanup Howl instance
      if (howlRefs.current[id]) {
        howlRefs.current[id].unload();
        delete howlRefs.current[id];
      }
      loadedTracks.current.delete(id);
      
      toast.success('Track deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error deleting track');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <div className="fixed inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.8),rgba(17,24,39,0.4))]" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold text-white mb-8">
          Your Music Collection
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map(track => (
            <TrackCard
              key={track._id}
              track={track}
              onTogglePlay={togglePlay}
              onVolumeChange={adjustVolume}
              onDelete={handleDelete}
              isLoading={loadingTrackId === track._id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserTracks;