import React from 'react';
import type { AllyState } from '../types';

interface AllyProps {
  allyState: AllyState;
}

const Ally: React.FC<AllyProps> = ({ allyState }) => {
  const { x, y, attackState } = allyState;
  const isAttacking = attackState?.isAttacking ?? false;

  return (
    <div
      className={`absolute w-[20px] h-[20px] bg-gradient-to-br from-purple-500 to-purple-800 rounded-full border-2 border-purple-900 z-10 ${isAttacking ? 'animate-ally-attack' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        boxShadow: '0 0 8px #9333ea',
      }}
    />
  );
};

export default Ally;