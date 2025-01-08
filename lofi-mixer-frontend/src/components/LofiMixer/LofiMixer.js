import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Music } from 'lucide-react';
import { Howl, Howler } from 'howler';
import { tracksData } from '../../tracks';
import Navbar from '../Layout/Navbar';

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

const LofiMixer = () => {
  const [tracks, setTracks] = useState(tracksData);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState(null);
  const howlRefs = useRef({});
  const loadedTracks = useRef(new Set());

  // Function to load a single track
  const loadTrack = async (track) => {
    if (loadedTracks.current.has(track.id)) return;

    setLoadingTrackId(track.id);
    
    return new Promise((resolve) => {
      howlRefs.current[track.id] = new Howl({
        src: [track.audioUrl],
        html5: true,
        loop: true,
        volume: track.volume / 100,
        onload: () => {
          console.log(`Loaded track: ${track.name}`);
          loadedTracks.current.add(track.id);
          setLoadingTrackId(null);
          resolve();
        },
        onloaderror: (_, error) => {
          console.error(`Error loading ${track.name}:`, error);
          setLoadingTrackId(null);
          resolve();
        }
      });
    });
  };

  // Initialize audio and load first track on first play
  const initializeAudio = async (trackId) => {
    if (!audioInitialized) {
      console.log('Initializing audio system...');
      
      // Set Howler configuration
      Howler.autoUnlock = false;
      Howler.html5PoolSize = 10;
      
      try {
        // Load the clicked track first
        const trackToLoad = tracks.find(t => t.id === trackId);
        if (trackToLoad) {
          await loadTrack(trackToLoad);
        }
        
        setAudioInitialized(true);
        
        // Load remaining tracks in background
        const remainingTracks = tracks.filter(t => t.id !== trackId);
        for (const track of remainingTracks) {
          await loadTrack(track);
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    }
  };

  const togglePlay = async (id) => {
    // Initialize audio if this is the first play
    if (!audioInitialized) {
      await initializeAudio(id);
    }

    const howl = howlRefs.current[id];
    if (!howl || !loadedTracks.current.has(id)) {
      console.log('Track not ready yet');
      return;
    }

    try {
      // Resume AudioContext if needed
      if (Howler.ctx?.state === 'suspended') {
        await Howler.ctx.resume();
      }

      setTracks(tracks.map(track => {
        if (track.id === id) {
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
      track.id === id ? { ...track, volume: newVolume } : track
    ));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(howlRefs.current).forEach(howl => {
        if (howl) howl.unload();
      });
      loadedTracks.current.clear();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <div className="fixed inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.8),rgba(17,24,39,0.4))]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map(track => (
            <div
              key={track.id}
              className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden 
                       transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl 
                       border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
              
              <img
                src={track.coverArt}
                alt={track.name}
                className="w-full h-48 object-cover"
              />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 
                            group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => togglePlay(track.id)}
                  className="p-4 rounded-full bg-emerald-500/80 hover:bg-emerald-600/80 
                           transition-all duration-300 backdrop-blur-sm"
                  disabled={loadingTrackId === track.id}
                >
                  {loadingTrackId === track.id ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : track.isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-medium text-lg text-white mb-1">{track.name}</h3>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  {track.artist}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <VolumeSlider
                    value={track.volume}
                    onChange={(value) => adjustVolume(track.id, value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LofiMixer;