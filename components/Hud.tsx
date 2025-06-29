import React from 'react';
import type { GameState, SpellType } from '../types';

interface HudProps {
  lives: number;
  stamina: number;
  maxStamina: number;
  mana: number;
  maxMana: number;
  selectedSpell: 'fire' | 'ice' | 'necromancer' | 'blessing' | null;
  room: number;
  kills: number;
  shield: GameState['shield'];
  shieldCooldownTimer: number;
  hasBow: boolean;
  arrows: number;
}

const renderHeartRow = (lives: number, row: number) => {
    const minLives = row * 10;
    
    if (lives <= minLives) return null;

    const livesInRow = Math.max(0, lives - minLives);
    const fullHearts = Math.floor(livesInRow);
    const halfHeart = livesInRow - fullHearts >= 0.5;

    let hearts = '';
    for (let i = 0; i < Math.min(10, fullHearts); i++) {
        hearts += '❤️';
    }
    if (halfHeart && fullHearts < 10) {
        hearts += '💔';
    }
    
    return <div key={row} className="h-6 whitespace-nowrap">{hearts}</div>;
};


const Hud: React.FC<HudProps> = ({ lives, stamina, maxStamina, mana, maxMana, selectedSpell, room, kills, shield, shieldCooldownTimer, hasBow, arrows }) => {
  const renderHearts = () => {
    return (
        <div className="flex flex-col">
            {renderHeartRow(lives, 0)}
            {renderHeartRow(lives, 1)}
            {renderHeartRow(lives, 2)}
        </div>
    )
  };
  
  const renderSpellIcon = () => {
    if (!selectedSpell) return null;
    let icon;
    switch(selectedSpell) {
        case 'fire': icon = '🔥'; break;
        case 'ice': icon = '❄️'; break;
        case 'necromancer': icon = '💀'; break;
        case 'blessing': icon = '💖'; break;
        default: return null;
    }
    return <span className="text-2xl filter drop-shadow-[0_0_4px_#fff]">{icon}</span>;
  };

  return (
    <>
      <div className="absolute top-2.5 left-2.5 text-lg" style={{ textShadow: '1px 1px 2px #000' }}>
        <div className="text-2xl mb-1">{renderHearts()}</div>
        <div className="mt-5 w-[180px] h-4 bg-[#503d2e] border-2 border-[#362815]">
          <div
            className="h-full bg-gradient-to-r from-[#6afc4e] to-[#3ebc1e] transition-all duration-300"
            style={{ width: `${(stamina / maxStamina) * 100}%` }}
          />
        </div>
        {maxMana > 0 && (
          <div className="mt-1 w-[180px] h-4 bg-[#2c3e50] border-2 border-[#1a2530]">
            <div
              className="h-full bg-gradient-to-r from-[#3498db] to-[#2980b9] transition-all duration-300"
              style={{ width: maxMana > 0 ? `${(mana / maxMana) * 100}%` : '0%' }}
            />
          </div>
        )}
        <div className="mt-2 flex items-center gap-4">
            {shield.available && (
              <div className="flex items-center gap-2 text-white transition-opacity"
                style={{ opacity: shield.cooldown ? 0.6 : 1 }}
              >
                <span className="text-2xl filter drop-shadow-[0_0_4px_#fff]">🛡️</span>
                <span className="text-sm">{shield.cooldown ? `⏳ ${shieldCooldownTimer}s` : 'Pronto'}</span>
              </div>
            )}
            {hasBow && (
                <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl filter drop-shadow-[0_0_4px_#fff]">🏹</span>
                    <span className="text-sm font-bold">{arrows}</span>
                </div>
            )}
            {selectedSpell && (
                <div className="flex items-center gap-2">{renderSpellIcon()}</div>
            )}
        </div>
      </div>
      <div className="absolute top-2.5 right-2.5 text-lg text-right" style={{ textShadow: '1px 1px 2px #000' }}>
        <p>🏰 Sala: <span className="font-bold">{room}</span></p>
        <p>☠️ Mortes: <span className="font-bold">{kills}</span></p>
      </div>
    </>
  );
};

export default Hud;