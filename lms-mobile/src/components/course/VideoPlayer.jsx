import React, { useRef, useState } from 'react';
import { PlayIcon, PauseIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const VideoPlayer = ({ videoUrl, title, onComplete, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
      
      if (currentProgress >= 90 && !isCompleted && onComplete) {
        setIsCompleted(true);
        onComplete();
      }
    }
  };

  const getVimeoId = (url) => {
    const match = url?.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const vimeoId = getVimeoId(videoUrl);

  if (vimeoId) {
    return (
      <div className="bg-black rounded-lg overflow-hidden">
        <div className="aspect-video">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=${autoPlay ? 1 : 0}&byline=0&portrait=0&title=0`}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={title}
          />
        </div>
        <div className="p-4 bg-white">
          <h3 className="font-semibold text-lg">{title}</h3>
          {onComplete && !isCompleted && progress < 90 && (
            <button onClick={onComplete} className="btn-primary w-full mt-3 flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-5 h-5" /> Mark as Complete
            </button>
          )}
          {isCompleted && (
            <div className="mt-3 text-green-600 text-center flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-5 h-5" /> Lesson Completed!
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        controls
      />
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        
        <div className="flex gap-3">
          <button onClick={togglePlay} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          {onComplete && !isCompleted && progress < 90 && (
            <button onClick={onComplete} className="btn-secondary flex-1">Mark Complete</button>
          )}
        </div>
        
        {isCompleted && (
          <div className="mt-3 text-green-600 text-center flex items-center justify-center gap-2">
            <CheckCircleIcon className="w-5 h-5" /> Lesson Completed!
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;