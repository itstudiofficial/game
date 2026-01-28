import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 500 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' }}
    >
      <defs>
        <linearGradient id="logoHighlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      {/* Left part of 'A' (Slate 800) */}
      <path 
        d="M200 70L30 310H130L200 70Z" 
        fill="#0f172a" 
      />
      {/* Right/Middle part of 'A' and curve (Enhanced Indigo Gradient) */}
      <path 
        d="M200 70L370 310C320 250 250 150 200 70Z" 
        fill="url(#logoHighlightGradient)" 
      />
      {/* The 'D' shape (Slate 800) */}
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M300 100V310H360C440 310 460 250 460 205C460 160 440 100 360 100H300ZM340 135H360C410 135 425 170 425 205C425 240 410 275 360 275H340V135Z" 
        fill="#0f172a" 
      />
    </svg>
  );
};

export default Logo;