
import React from 'react';
import type { WavePlayerState, Customization } from '../types';

interface AllyHudProps {
    player: WavePlayerState;
    customization: Customization;
}

const StatBar: React.FC<{ value: number, maxValue: number, colorClasses: string }> = ({ value, maxValue, colorClasses }) => (
    <div className="w-full h-3 bg-gray-900/70 border border-gray-600 rounded-full overflow-hidden">
        <div 
            className={`h-full rounded-full transition-all duration-300 ${colorClasses}`}
            style={{ width: `${(value / maxValue) * 100}%` }}
        />
    </div>
);

const AllyHud: React.FC<AllyHudProps> = ({ player }) => {
    return (
        <div className="bg-black/40 p-2 rounded-lg border border-gray-500 w-48 text-white" style={{ textShadow: '1px 1px 2px #000' }}>
            <div className="flex justify-between items-baseline">
              <p className="font-bold text-sm text-cyan-300 truncate">{player.name}</p>
              <p className="text-xs text-yellow-300">💰{player.points}</p>
            </div>
            <div className="mt-1 space-y-1">
                <StatBar value={player.lives} maxValue={player.maxLives} colorClasses="bg-gradient-to-r from-red-600 to-red-400" />
                <StatBar value={player.stamina} maxValue={player.maxStamina} colorClasses="bg-gradient-to-r from-green-600 to-green-400" />
            </div>
            <div className="flex items-center gap-2 mt-2 text-lg">
                <span className="filter drop-shadow-[0_0_2px_#fff]">
                    {player.equippedWeapon === 'axe' ? '🪓' : '🗡️'}
                </span>
                {player.shield.available && (
                     <span className="filter drop-shadow-[0_0_2px_#fff]">🛡️</span>
                )}
                {(player.shield.shieldHp ?? 0) > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                        <span className="text-base filter drop-shadow-[0_0_2px_#fff]">🛡️</span>
                        <span className="font-bold">{player.shield.shieldHp}</span>
                    </div>
                )}
                {player.hasBow && (
                     <span className="filter drop-shadow-[0_0_2px_#fff]">🏹</span>
                )}
            </div>
        </div>
    );
};

export default AllyHud;
