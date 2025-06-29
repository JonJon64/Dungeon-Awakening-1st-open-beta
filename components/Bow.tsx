import React from 'react';
import type { PlayerState } from '../types';

interface BowProps {
  show: boolean;
  angle: number;
  playerPosition: PlayerState;
}

const Bow: React.FC<BowProps> = ({ show, angle, playerPosition }) => {
  if (!show) {
    return null;
  }

  const pivotX = playerPosition.x + 15;
  const pivotY = playerPosition.y + 15;

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        left: `${pivotX}px`,
        top: `${pivotY}px`,
        transformOrigin: 'center center',
      }}
    >
      <div
        className="animate-bow-shot"
        style={{
            transform: `rotate(${angle}rad)`,
        }}
      >
        <svg width="40" height="80" viewBox="-10 -40 40 80"
          className="drop-shadow-[0_0_3px_#fff]"
          style={{ transform: 'translate(-15px, -40px)' }}
        >
            <path d="M0,35 C20,15 20,-15 0,-35" stroke="#8B4513" strokeWidth="5" fill="none" />
            <line x1="0" y1="35" x2="0" y2="-35" stroke="#D2B48C" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default Bow;
