
import React from 'react';
import type { PlayerState } from '../types';

interface SwordProps {
  show: boolean;
  angle: number;
  playerPosition: PlayerState;
}

const Sword: React.FC<SwordProps> = ({ show, angle, playerPosition }) => {
  if (!show) {
    return null;
  }

  const pivotX = playerPosition.x + 15;
  const pivotY = playerPosition.y + 15;

  return (
    <div
      className="absolute pointer-events-none animate-sword-swing z-20"
      style={{
        // Position the container at the player's pivot point
        left: `${pivotX}px`,
        top: `${pivotY}px`,
        width: '90px',
        height: '30px',
        // Set the transform origin relative to the container's top-left
        transformOrigin: '0px 0px',
        // The rotation is handled by the keyframe animation via the --angle variable
        '--angle': `${(angle * 180) / Math.PI}deg`,
      } as React.CSSProperties}
    >
      <svg
        width="90"
        height="30"
        viewBox="0 0 90 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        // The container is positioned, the SVG is drawn relative to it
        className="absolute -translate-x-[15px] -translate-y-[15px] drop-shadow-[0_0_4px_#fff]"
      >
        {/* Blade */}
        <path
          d="M20 11 L85 11 L90 15 L85 19 L20 19 Z"
          fill="url(#bladeGradient)"
        />
        <defs>
          <linearGradient id="bladeGradient" x1="20" y1="15" x2="90" y2="15" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E5E7EB" />
            <stop offset="1" stopColor="#9CA3AF" />
          </linearGradient>
        </defs>
        
        {/* Hilt Guard */}
        <rect x="12" y="7" width="8" height="16" fill="#A16207" />

        {/* Hilt Grip */}
        <rect x="0" y="11" width="12" height="8" fill="#422006" />

         {/* Pommel */}
        <circle cx="0" cy="15" r="4" fill="#FBBF24" />
      </svg>
    </div>
  );
};

export default Sword;
