import React, { useEffect, useRef, useState } from 'react';

export default function SongPlayer({ emotion = 'neutral' }) {
  const audioRef = useRef(null);
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setCurrentSongIndex(0);
    loadSongs(emotion);
  }, [emotion]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const loadSongs = async (currentEmotion) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/songs/${currentEmotion}`);
      if (response.ok) {
        const songList = await response.json();
        setSongs(songList.map(song => `${apiUrl}/songs/${currentEmotion}/${song}`));
      } else {
        setSongs([]);
      }
    } catch (err) {
      console.error('Failed to load songs:', err);
      setSongs([]);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || songs.length === 0) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src) {
        playSong(currentSongIndex);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error('Play error:', error);
            });
        } else {
          setIsPlaying(true);
        }
      }
    }
  };

  const playSong = (index) => {
    if (index >= 0 && index < songs.length && audioRef.current) {
      const audio = audioRef.current;
      setCurrentSongIndex(index);

      const songUrl = songs[index];
      console.log('Playing song:', songUrl);

      audio.src = songUrl;

      const playAudio = () => {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Song playing successfully');
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error('Play error:', error);
              setIsPlaying(false);
            });
        }
      };

      if (audio.readyState >= 2) {
        playAudio();
      } else {
        audio.addEventListener('canplay', playAudio, { once: true });
      }
    }
  };

  const nextSong = () => {
    const next = (currentSongIndex + 1) % songs.length;
    playSong(next);
  };

  const previousSong = () => {
    const prev = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(prev);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    nextSong();
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="song-player">
      <div className="player-header">
        <h3 className="player-title">Music for {emotion}</h3>
        <p className="player-subtitle">Add songs to frontend/public/songs/{emotion}/ folder</p>
      </div>

      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="metadata"
      />

      {songs.length > 0 ? (
        <>
          <div className="player-controls">
            <button className="player-btn" onClick={previousSong} aria-label="Previous song">
              ⏮
            </button>
            <button className="player-btn play-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="player-btn" onClick={nextSong} aria-label="Next song">
              ⏭
            </button>
          </div>

          <div className="player-progress">
            <span className="time-label">{formatTime(currentTime)}</span>
            <input
              type="range"
              className="progress-bar"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
            />
            <span className="time-label">{formatTime(duration)}</span>
          </div>

          <div className="song-list">
            {songs.map((song, index) => {
              const songName = song.split('/').pop();
              const isActive = index === currentSongIndex;
              return (
                <div
                  key={index}
                  className={`song-item ${isActive ? 'active' : ''}`}
                  onClick={() => playSong(index)}
                >
                  <span className="song-icon">{isActive && isPlaying ? '🔊' : '🎵'}</span>
                  <span className="song-name">{songName}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="player-empty">
          <p>No songs found for {emotion} emotion</p>
          <p className="player-hint">Upload songs to: public/songs/{emotion}/</p>
        </div>
      )}
    </div>
  );
}
