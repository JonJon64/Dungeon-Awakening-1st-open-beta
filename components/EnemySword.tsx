import React from 'react';
import type { EnemyState } from '../types';

interface EnemyWeaponProps {
  angle: number;
  enemyPosition: EnemyState;
}

const EnemySword: React.FC<EnemyWeaponProps> = ({ angle, enemyPosition }) => {
  const pivotX = enemyPosition.x + 15;
  const pivotY = enemyPosition.y + 15;

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        left: `${pivotX}px`,
        top: `${pivotY}px`,
        width: '50px',
        height: '30px',
        transform: `rotate(${angle}rad)`,
        transformOrigin: '0% 50%',
      }}
    >
      <div className="animate-enemy-weapon-thrust">
        <svg
          width="50"
          height="30"
          viewBox="0 0 50 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -translate-y-1/2 drop-shadow-[0_0_2px_#fff]"
          style={{ top: '50%' }}
        >
          {/* Blade */}
          <path
            d="M5 13 L45 13 L50 15 L45 17 L5 17 Z"
            fill="url(#enemySwordBladeGradient)"
          />
          <defs>
            <linearGradient id="enemySwordBladeGradient" x1="5" y1="15" x2="50" y2="15" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E0E0E0" />
              <stop offset="1" stopColor="#9E9E9E" />
            </linearGradient>
          </defs>
          
          {/* Hilt Guard */}
          <rect x="0" y="10" width="5" height="10" fill="#6D4C41" />
        </svg>
      </div>
    </div>
  );
};

export default EnemySword;
