import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Music } from 'lucide-react';
import { Howl } from 'howler';
import { tracksData } from './tracks';


const VolumeSlider = ({ value, onChange }) => {
  return (
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, #ffffff ${value}%, #374151 ${value}%)`
      }}
    />
  );
};

const LofiMixer = () => {
  const [tracks, setTracks] = useState(tracksData);
  // Store Howl instances
  const howlRefs = useRef({});

  // Initialize Howl instances
  useEffect(() => {
    tracks.forEach(track => {
      if (!howlRefs.current[track.id]) {
        howlRefs.current[track.id] = new Howl({
          src: [track.audioUrl],
          html5: true,
          loop: true,
          volume: track.volume / 100,
          onload: () => {
            console.log(`Track ${track.id} loaded`);
          },
          onloaderror: (id, error) => {
            console.error(`Error loading track ${track.id}:`, error);
          }
        });
      }
    });

    // Cleanup on unmount
    return () => {
      Object.values(howlRefs.current).forEach(howl => howl.unload());
    };
  }, []);

  const [visualizer, setVisualizer] = useState([]);
  const animationFrameRef = useRef();

  useEffect(() => {
    const updateVisualizer = () => {
      // Create more natural-looking visualizer data based on playing tracks
      const playingTracks = tracks.filter(track => track.isPlaying);
      if (playingTracks.length > 0) {
        setVisualizer(Array.from({ length: 20 }, () => {
          const baseHeight = 30; // minimum height
          const variableHeight = 70; // maximum additional height
          return baseHeight + Math.random() * variableHeight;
        }));
      } else {
        setVisualizer(Array.from({ length: 20 }, () => 5)); // minimal movement when no tracks playing
      }
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    animationFrameRef.current = requestAnimationFrame(updateVisualizer);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [tracks]);

  const togglePlay = (id) => {
    const howl = howlRefs.current[id];
    if (!howl) return;

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
  };

  const adjustVolume = (id, newVolume) => {
    const howl = howlRefs.current[id];
    if (!howl) return;

    howl.volume(newVolume / 100);
    setTracks(tracks.map(track =>
      track.id === id ? { ...track, volume: newVolume } : track
    ));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="max-w-4xl mx-auto">
        {/* Visualizer */}
        <div className="mb-12 h-32 flex items-end justify-center gap-1 overflow-hidden">
          {visualizer.map((height, index) => (
            <div
              key={index}
              className="w-3 bg-gradient-to-t from-purple-500 to-blue-500 rounded-t transition-all duration-100"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        {/* Tracks */}
        <div className="grid gap-6">
          {tracks.map(track => (
            <div
              key={track.id}
              className={`p-6 rounded-lg bg-gray-800 border border-gray-700 
                hover:border-opacity-50 transition-all duration-300`}
              style={{
                borderColor: track.isPlaying ? track.color.replace('bg-', '') : 'transparent'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* Cover Art */}
                  <div className={`relative w-16 h-16 rounded-lg overflow-hidden ${track.isPlaying ? 'animate-pulse' : ''}`}>
                    <img
                      src={track.coverArt}
                      alt={`${track.name} cover`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-30" />
                  </div>

                  <button
                    onClick={() => togglePlay(track.id)}
                    className={`p-3 rounded-full transition-all duration-300 hover:opacity-80`}
                    style={{
                      backgroundColor: track.isPlaying 
                        ? track.color.replace('bg-', '') 
                        : '#374151'
                    }}
                  >
                    {track.isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{track.name}</h3>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Music className="w-4 h-4" />
                      <span className="text-sm">{track.artist}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-48">
                  <Volume2 className="w-5 h-5 text-gray-400" />
                  <VolumeSlider
                    value={track.volume}
                    onChange={(value) => adjustVolume(track.id, value)}
                  />
                </div>
              </div>
              
              {/* Animated waveform background */}
              <div className="h-2 w-full rounded-full overflow-hidden bg-gray-700">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${track.volume}%`,
                    backgroundColor: track.color.replace('bg-', ''),
                    animation: track.isPlaying ? 'pulse 2s infinite' : 'none'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #374151;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #374151;
        }
      `}</style>
    </div>
  );
};

export default LofiMixer;