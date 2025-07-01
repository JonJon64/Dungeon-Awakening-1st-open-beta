
import React from 'react';
import type { ProjectileState } from '../types';

interface ProjectileProps {
  projectileState: ProjectileState;
}

const Projectile: React.FC<ProjectileProps> = ({ projectileState }) => {
  const { x, y, dx, dy, source, spellType } = projectileState;

  if (spellType === 'arrow') {
    const angle = Math.atan2(dy, dx);
    return (
        <div
          className="absolute z-0 pointer-events-none"
          style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: `rotate(${angle}rad)`
          }}
        >
            <svg width="40" height="10" viewBox="0 0 40 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_2px_#fff]">
              <path d="M0 5 H30" stroke="#A0522D" strokeWidth="2"/>
              <path d="M28 1 L38 5 L28 9" stroke="#778899" strokeWidth="2" fill="#C0C0C0"/>
            </svg>
        </div>
    );
  }
  
  let className = "absolute w-2 h-2 rounded-full z-0";
  let style: React.CSSProperties = {
    left: `${x}px`,
    top: `${y}px`,
    width: '8px',
    height: '8px'
  };

  if (source === 'player') {
    if (spellType === 'fire') {
        className += " bg-orange-500";
        style.boxShadow = '0 0 8px rgba(255,100,0,0.9), 0 0 12px rgba(255,0,0,0.7)';
        style.width = '10px';
        style.height = '10px';
    } else if (spellType === 'ice') {
        className += " bg-cyan-300";
        style.boxShadow = '0 0 8px rgba(0,255,255,0.9), 0 0 12px rgba(100,100,255,0.7)';
        style.width = '12px';
        style.height = '12px';
    } else if (spellType === 'explosion') {
        className += " bg-yellow-400";
        style.boxShadow = '0 0 10px rgba(255,255,0,0.9), 0 0 15px rgba(255,165,0,0.7)';
        style.width = '14px';
        style.height = '14px';
    }
  } else {
    // Enemy projectile
    className += " bg-red-500";
    style.boxShadow = '0 0 6px rgba(255,0,0,0.9)';
  }

  return (
    <div
      className={className}
      style={style}
    />
  );
};

export default Projectile;