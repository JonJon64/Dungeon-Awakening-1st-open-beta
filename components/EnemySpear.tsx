import React from 'react';
import type { EnemyState } from '../types';

interface EnemyWeaponProps {
  angle: number;
  enemyPosition: EnemyState;
}

const EnemySpear: React.FC<EnemyWeaponProps> = ({ angle, enemyPosition }) => {
  const pivotX = enemyPosition.x + 15;
  const pivotY = enemyPosition.y + 15;

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        left: `${pivotX}px`,
        top: `${pivotY}px`,
        width: '60px',
        height: '20px',
        transform: `rotate(${angle}rad)`,
        transformOrigin: '0% 50%',
      }}
    >
      <div className="animate-enemy-weapon-thrust">
        <svg
          width="60"
          height="20"
          viewBox="0 0 60 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -translate-y-1/2 drop-shadow-[0_0_2px_#fff]"
          style={{ top: '50%' }}
        >
          {/* Shaft */}
          <rect x="0" y="8" width="50" height="4" fill="#8D6E63" />

          {/* Spearhead */}
          <path d="M50 10 L45 5 L60 10 L45 15 Z" fill="#BDBDBD" />
        </svg>
      </div>
    </div>
  );
};

export default EnemySpear;
