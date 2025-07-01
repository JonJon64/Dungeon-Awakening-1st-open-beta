import React from 'react';
import type { PlayerState } from '../types';

interface AxeProps {
  show: boolean;
  angle: number;
  playerPosition: PlayerState;
}

const Axe: React.FC<AxeProps> = ({ show, angle, playerPosition }) => {
  if (!show) {
    return null;
  }

  const pivotX = playerPosition.x + 15;
  const pivotY = playerPosition.y + 15;

  return (
    <div
      className="absolute pointer-events-none animate-axe-swing z-20"
      style={{
        left: `${pivotX}px`,
        top: `${pivotY}px`,
        width: '120px', 
        height: '120px',
        transformOrigin: '0px 0px',
        '--angle': `${(angle * 180) / Math.PI}deg`,
      } as React.CSSProperties}
    >
      <svg
        width="120"
        height="120"
        viewBox="-30 -60 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute drop-shadow-[0_0_5px_#fff]"
        style={{ transform: 'translate(-45px, 30px)' }}
      >
        <g transform="translate(30, -30)">
            <g stroke="#3D4853" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                {/* Handle */}
                <path d="M 0 0 L 40 40 L 48 32 L 8 -8 Z" fill="#D98A5B" />

                {/* Wood Grain */}
                <path d="M 10 2 C 20 12, 25 17, 20 27" stroke="#A96B42" strokeWidth="2" fill="none" />
                <path d="M 20 12 C 30 22, 35 27, 30 37" stroke="#A96B42" strokeWidth="2" fill="none" />
                
                {/* Axe Head */}
                <path d="M 40 40 L 32 48 L 52 68 C 62 78, 78 72, 72 62 L 48 32 Z" fill="#B0B8BF"/>

                {/* Blade Edge */}
                <path d="M 52 68 C 62 78, 78 72, 72 62" fill="none" stroke="#D4DDE5" strokeWidth="5" />
                
                {/* Top part of handle */}
                <rect x="35" y="31" width="12" height="5" fill="#A9825E" transform="rotate(45 35 31)" />
            </g>
        </g>
      </svg>
    </div>
  );
};

export default Axe;