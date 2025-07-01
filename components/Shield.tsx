import React from 'react';
import type { GameState, PlayerState } from '../types';

interface ShieldProps {
  shieldState: GameState['shield'];
  playerState: PlayerState;
}

const Shield: React.FC<ShieldProps> = ({ shieldState, playerState }) => {
  if (!shieldState.active) {
    return null;
  }

  const { x, y } = playerState;
  const { angle } = shieldState;

  // Position the shield in front of the player based on the angle
  const distance = 30; // Distance from player center
  const shieldX = x + 15 + Math.cos(angle) * distance - 6; // Center player + offset - half shield width
  const shieldY = y + 15 + Math.sin(angle) * distance - 18; // Center player + offset - half shield height

  return (
    <div
      className="absolute w-3 h-9 bg-[#8B5C2B] border-2 border-[#C0C0C0] rounded-md z-20 pointer-events-none opacity-90"
      style={{
        left: `${shieldX}px`,
        top: `${shieldY}px`,
        transform: `rotate(${angle * (180 / Math.PI) + 180}deg)`, // Rotate to face out
      }}
    />
  );
};

export default Shield;