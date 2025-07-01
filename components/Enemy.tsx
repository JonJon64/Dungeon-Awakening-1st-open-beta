

import React from 'react';
import type { EnemyState } from '../types';
import { YUBOKUMIN_DATA } from '../constants';
import EnemySword from './EnemySword';
import EnemySpear from './EnemySpear';

interface EnemyProps {
  enemyState: EnemyState;
  isInWaveMode?: boolean;
}

const Enemy: React.FC<EnemyProps> = ({ enemyState, isInWaveMode = false }) => {
  const { x, y, type, bossType, hp, maxHp, attackState, statIncreaseText, frozenUntil, hitCount } = enemyState;
  const isFrozen = frozenUntil && Date.now() < frozenUntil;

  const showAttackAnimation = attackState?.isAttacking ?? false;
  const attackAngle = attackState?.angle ?? 0;
  
  let AttackAnimationComponent = null;
  if (showAttackAnimation) {
    if (type === 'knight' || type === 'knight_shooter' || type.includes('angel') || type === 'boss') {
      AttackAnimationComponent = <EnemySword angle={attackAngle} enemyPosition={enemyState} />;
    } else if (type === 'normal' || type === 'shooter') {
      AttackAnimationComponent = <EnemySpear angle={attackAngle} enemyPosition={enemyState} />;
    }
  }

  const renderHealthBar = () => {
    if (!isInWaveMode || !maxHp || maxHp <= 0 || hp <= 0) return null;
    const healthPercentage = (hp / maxHp) * 100;
    const enemySize = type === 'boss' ? 50 : 30;
    return (
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-gray-700 rounded-full overflow-hidden" style={{ width: `${enemySize * 0.8}px`}}>
        <div className="h-full bg-green-500 transition-all duration-200" style={{ width: `${healthPercentage}%`}} />
      </div>
    );
  };
  
  const content = (
    <div
      key={hitCount} // Re-triggers animation on hit
      className={hitCount && hitCount > 0 ? 'animate-enemy-hit' : ''}
    >
      <div
        className="w-full h-full"
        style={{
          filter: isFrozen ? 'saturate(0.2) brightness(1.5)' : 'none',
          boxShadow: isFrozen ? '0 0 12px #3498db' : 'none',
        }}
      >
        {statIncreaseText && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-green-400 whitespace-nowrap transition-opacity duration-300 animate-pulse" style={{textShadow: '1px 1px 1px #000'}}>
            {statIncreaseText.text}
          </div>
        )}
      </div>
    </div>
  );


  if (type === 'boss') {
    const bossInfo = YUBOKUMIN_DATA.find(b => b.type === bossType) || YUBOKUMIN_DATA[0];
    const healthPercentage = maxHp && maxHp > 0 ? (hp / maxHp) * 100 : 0;

    return (
      <>
        <div
            className="absolute w-[50px] h-[50px] border-2 border-black z-0 transition-all duration-200 hover:scale-105"
            style={{ 
              left: `${x}px`, 
              top: `${y}px`, 
              backgroundColor: bossInfo.color,
            }}
        >
            {content}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-full text-center">
                <div className="text-white text-xs whitespace-nowrap" style={{textShadow: '1px 1px 2px #000'}}>{bossInfo.name}</div>
                <div className="relative w-14 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto mt-1">
                    <div
                        className="h-full bg-gradient-to-r from-red-500 to-yellow-400 transition-all duration-200"
                        style={{ width: `${healthPercentage}%` }}
                    />
                </div>
            </div>
        </div>
        {AttackAnimationComponent}
      </>
    );
  }

  let enemyClasses: string;
  const isShooter = type.includes('shooter');
  if (type.includes('angel')) {
    enemyClasses = `absolute w-[30px] h-[30px] bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-gray-400 shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-[pulse_1s_ease-in-out_infinite_alternate] z-0 ${isShooter ? 'border-dashed border-cyan-300' : ''}`;
  } else if (type === 'knight' || type === 'knight_shooter') {
    enemyClasses = `absolute w-[30px] h-[30px] bg-gradient-to-br from-yellow-500 to-yellow-700 border-2 border-yellow-900 shadow-[0_0_6px_rgba(234,179,8,0.7)] animate-[pulse_1s_ease-in-out_infinite_alternate] z-0 ${isShooter ? 'border-dashed border-white' : ''}`;
  } else {
    enemyClasses = `absolute w-[30px] h-[30px] bg-gradient-to-br from-red-600 to-red-900 border-2 border-red-950 shadow-[0_0_6px_rgba(200,0,0,0.7)] animate-[pulse_1s_ease-in-out_infinite_alternate] z-0 ${isShooter ? 'border-dashed border-white' : ''}`;
  }

  const renderShield = () => {
    if (enemyState.type !== 'angel_shield' || !enemyState.shieldHp || enemyState.shieldHp <= 0) {
      return null;
    }
    const angle = enemyState.angleToTarget ?? 0;
    const distance = 20; // from enemy center
    const shieldW = 12; // w-3
    const shieldH = 36; // h-9

    // Center of enemy
    const enemyCenterX = x + 15;
    const enemyCenterY = y + 15;
    
    // Position of shield center
    const shieldCenterX = enemyCenterX + Math.cos(angle) * distance;
    const shieldCenterY = enemyCenterY + Math.sin(angle) * distance;

    // Top-left corner for the div, accounting for its own dimensions
    const shieldX = shieldCenterX - shieldW / 2;
    const shieldY = shieldCenterY - shieldH / 2;

    return (
      <div
        className="absolute w-3 h-9 bg-[#8B5C2B] border-2 border-[#C0C0C0] rounded-md z-20 pointer-events-none opacity-90"
        style={{
          left: `${shieldX}px`,
          top: `${shieldY}px`,
          // The shield is a tall rectangle. To make its long side perpendicular to the direction of threat, we add 90 degrees.
          // User requested another 90 degree rotation.
          transform: `rotate(${angle * (180 / Math.PI) + 180}deg)`,
          transformOrigin: 'center center',
        }}
      />
    );
  };
  
  return (
    <>
      <div
        className={enemyClasses}
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        {content}
        {renderHealthBar()}
      </div>
      {renderShield()}
      {AttackAnimationComponent}
    </>
  );
};

export default Enemy;