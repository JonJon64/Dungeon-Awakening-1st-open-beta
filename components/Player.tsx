

import React from 'react';
import type { PlayerState, Customization, PlayerShape, WavePlayerState } from '../types';

interface PlayerProps {
  playerState: PlayerState | WavePlayerState;
  customization: Customization;
  showResistanceUp?: boolean;
}

const Player: React.FC<PlayerProps> = ({ playerState, customization, showResistanceUp }) => {
  const { x, y } = playerState;
  const { color, shape } = customization;
  const isDead = 'isDead' in playerState && playerState.isDead;
  const isBot = 'isBot' in playerState && playerState.isBot;
  const name = 'name' in playerState ? playerState.name : '';
  const pickupText = 'pickupText' in playerState ? playerState.pickupText : undefined;
  const waveBonusText = 'waveBonusText' in playerState ? playerState.waveBonusText : undefined;
  const waveResistanceBonusText = 'waveResistanceBonusText' in playerState ? playerState.waveResistanceBonusText : undefined;
  const shieldHitTimestamp = 'shieldHitTimestamp' in playerState ? playerState.shieldHitTimestamp : undefined;


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
  
  const textPopups = [];
  if (showResistanceUp) textPopups.push({ text: '+Resistência', color: 'text-yellow-300' });
  if (Date.now() - playerState.damageUpTimestamp < 2000 && playerState.damageUpValue > 0) {
      textPopups.push({ text: `+Dano ${playerState.damageUpValue.toFixed(2)}x`, color: 'text-orange-400' });
  }
  if (pickupText && Date.now() - pickupText.creationTime < 2000) {
      textPopups.push({ text: pickupText.text, color: 'text-green-300' });
  }
  if (waveResistanceBonusText && Date.now() - waveResistanceBonusText.creationTime < 2500) {
      textPopups.push({ text: waveResistanceBonusText.text, color: 'text-cyan-200' });
  }
  if (waveBonusText && Date.now() - waveBonusText.creationTime < 2500) {
      textPopups.push({ text: waveBonusText.text, color: 'text-yellow-200' });
  }


  return (
    <>
      {isBot && !isDead && (
          <div 
            className="absolute text-xs font-bold text-cyan-300 transition-opacity duration-300"
            style={{
              left: `${x + 15}px`,
              transform: 'translateX(-50%)',
              top: `${y - 15}px`,
              textShadow: '1px 1px 1px #000'
            }}
          >
            {name}
          </div>
      )}
      <div
        className={`absolute w-[30px] h-[30px] border-2 border-[#112d5b] z-10 ${getShapeClasses(shape)} transition-opacity duration-500`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          opacity: isDead ? 0.3 : 1,
          ...shadowStyle
        }}
      />
      
      {shieldHitTimestamp && Date.now() - shieldHitTimestamp < 300 && (
          <div 
              className="absolute w-[40px] h-[40px] rounded-full border-4 border-cyan-300 bg-cyan-500/30 animate-ping pointer-events-none"
              style={{
                  left: `${x - 5}px`,
                  top: `${y - 5}px`,
                  opacity: 0, // Opacity is controlled by the `ping` animation
              }}
          />
      )}

      {textPopups.map((popup, index) => (
         <div 
          key={index}
          className={`absolute text-lg font-bold ${popup.color} transition-opacity duration-300 animate-pulse whitespace-nowrap`}
          style={{
            left: `${x + 15}px`,
            transform: 'translateX(-50%)',
            top: `${y - 25 - (index * 25)}px`,
            textShadow: '2px 2px 2px #000'
          }}
        >
          {popup.text}
        </div>
      ))}
    </>
  );
};

export default Player;
