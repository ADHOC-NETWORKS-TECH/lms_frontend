import React, { useRef, useState } from 'react';
import { PlayIcon, PauseIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckCircleOutline } from '@heroicons/react/24/outline';

const VideoPlayer = ({ videoUrl, title, onComplete, onToggleComplete, isCompleted = false, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
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
        onComplete();
      }
    }
  };

  const getVimeoId = (url) => {
    const match = url?.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const vimeoId = getVimeoId(videoUrl);

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <div className="aspect-video">
        {vimeoId ? (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=${autoPlay ? 1 : 0}&byline=0&portrait=0&title=0`}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={title}
          />
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            controls
          />
        )}
      </div>
      
      <div className="p-4 bg-white dark:bg-gray-800">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{title}</h3>
        
        <div className="flex gap-3 mt-4">
          <button onClick={togglePlay} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          {/* Toggle Complete Button */}
          <button
            onClick={onToggleComplete}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${
              isCompleted 
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Completed
              </>
            ) : (
              <>
                <CheckCircleOutline className="w-5 h-5" />
                Mark Complete
              </>
            )}
          </button>
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