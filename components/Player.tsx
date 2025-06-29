


import React from 'react';
import type { PlayerState, Customization, PlayerShape } from '../types';

interface PlayerProps {
  playerState: PlayerState;
  customization: Customization;
  showResistanceUp?: boolean;
}

const Player: React.FC<PlayerProps> = ({ playerState, customization, showResistanceUp }) => {
  const { x, y } = playerState;
  const { color, shape } = customization;

  const getShapeClasses = (shape: PlayerShape) => {
    switch (shape) {
      case 'square':
        return 'rounded-md animate-[square-move_0.5s_infinite_alternate]';
      case 'pentagon':
        return '[clip-path:polygon(50%_0%,_100%_38%,_82%_100%,_18%_100%,_0%_38%)] animate-[pentagon-move_0.7s_infinite_alternate]';
      case 'circle':
      default:
        return 'rounded-full';
    }
  };

  const shadowStyle = {
    boxShadow: `0 0 8px ${color}, 0 0 16px #fff, 0 0 24px ${color}`,
    background: shape === 'circle' ? `radial-gradient(circle at 30% 30%, ${color}, #1f4fa8)` : color
  };

  return (
    <>
      <div
        className={`absolute w-[30px] h-[30px] border-2 border-[#112d5b] z-10 ${getShapeClasses(shape)}`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          ...shadowStyle
        }}
      />
      {showResistanceUp && (
        <div 
          className="absolute text-lg font-bold text-yellow-300 transition-opacity duration-300 animate-pulse"
          style={{
            left: `${x}px`,
            top: `${y - 25}px`,
            textShadow: '2px 2px 2px #000'
          }}
        >
          +Resistência
        </div>
      )}
      {Date.now() - playerState.damageUpTimestamp < 2000 && playerState.damageUpValue > 0 && (
        <div
          className="absolute text-lg font-bold text-orange-400 transition-opacity duration-300 animate-pulse"
          style={{
            left: `${playerState.x}px`,
            top: `${playerState.y - (showResistanceUp ? 50 : 25)}px`,
            textShadow: '2px 2px 2px #000'
          }}
        >
          +Dano {playerState.damageUpValue.toFixed(2)}x
        </div>
      )}
    </>
  );
};

export default Player;