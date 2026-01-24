import React from 'react';

const CallieLogoAnimated: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Callie Text Logo */}
      <div className="text-4xl md:text-5xl font-light text-white mb-4 tracking-wide">
        Callie
      </div>
      
      {/* Animated Sound Wave */}
      <div className="relative w-48 h-12 overflow-hidden">
        <svg
          width="192"
          height="48"
          viewBox="0 0 192 48"
          className="absolute inset-0"
        >
          {/* Multiple wave layers for depth */}
          <g className="sound-wave-group">
            {/* Primary wave */}
            <path
              d="M0,24 Q12,12 24,24 T48,24 T72,24 T96,24 T120,24 T144,24 T168,24 T192,24"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="2"
              className="sound-wave wave-1"
            />
            
            {/* Secondary wave */}
            <path
              d="M0,24 Q8,16 16,24 T32,24 T48,24 T64,24 T80,24 T96,24 T112,24 T128,24 T144,24 T160,24 T176,24 T192,24"
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="1.5"
              className="sound-wave wave-2"
              opacity="0.7"
            />
            
            {/* Tertiary wave */}
            <path
              d="M0,24 Q6,20 12,24 T24,24 T36,24 T48,24 T60,24 T72,24 T84,24 T96,24 T108,24 T120,24 T132,24 T144,24 T156,24 T168,24 T180,24 T192,24"
              fill="none"
              stroke="url(#gradient3)"
              strokeWidth="1"
              className="sound-wave wave-3"
              opacity="0.5"
            />
          </g>
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
            </linearGradient>
            
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
            </linearGradient>
            
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Traveling wave effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent w-8 h-full traveling-wave"></div>
      </div>
    </div>
  );
};

export default CallieLogoAnimated;