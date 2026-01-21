
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
    >
      {/* Left part of 'A' (Dark Blue) */}
      <path 
        d="M200 70L30 310H130L200 70Z" 
        fill="#003B5C" 
      />
      {/* Right/Middle part of 'A' and curve (Teal) */}
      <path 
        d="M200 70L370 310C320 250 250 150 200 70Z" 
        fill="#00ADBB" 
      />
      {/* The 'D' shape (Dark Blue) */}
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M300 100V310H360C440 310 460 250 460 205C460 160 440 100 360 100H300ZM340 135H360C410 135 425 170 425 205C425 240 410 275 360 275H340V135Z" 
        fill="#003B5C" 
      />
    </svg>
  );
};

export default Logo;
