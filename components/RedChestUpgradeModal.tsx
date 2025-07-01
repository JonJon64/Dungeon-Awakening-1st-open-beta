
import React, { useState } from 'react';
import type { PlayerState, RedChestUpgradeType, WavePlayerState } from '../types';

interface RedChestUpgradeModalProps {
  onConfirm: (upgrade: RedChestUpgradeType) => void;
  onClose: () => void;
  playerState: PlayerState;
}

const RedChestUpgradeModal: React.FC<RedChestUpgradeModalProps> = ({ onConfirm, onClose, playerState }) => {
  const [selected, setSelected] = useState<RedChestUpgradeType | null>(null);

  const isWaveMode = 'points' in playerState;
  const wavePlayerState = playerState as WavePlayerState;

  const upgrades: { type: RedChestUpgradeType; title: string; description: string; disabled: boolean; }[] = [
    { type: 'knowledge', title: '+3% Conhecimento', description: `Chance de negar/refletir dano. (Atual: ${playerState.knowledge}%, Máx: ${isWaveMode ? '40%' : '30%'})`, disabled: playerState.knowledge >= (isWaveMode ? 40 : 30) },
    { type: 'magic', title: '+5% Magia', description: `Desbloqueia e aprimora poderes mágicos. (Atual: ${playerState.magic}%)`, disabled: playerState.magic >= 100 },
    { type: 'renegade', title: '+5% Renegado', description: `Chance de distribuir dano recebido. (Atual: ${playerState.renegade}%, Máx: ${isWaveMode ? '40%' : '30%'})`, disabled: playerState.renegade >= (isWaveMode ? 40 : 30) },
    { type: 'resistant', title: 'Resistência', description: 'Melhora o escudo (duração e recarga). (Uso único)', disabled: playerState.resistant },
    { type: 'corredor', title: `+${isWaveMode ? '50' : '25'} Estamina Máxima`, description: `Aumenta seu vigor máximo. (Atual: ${playerState.maxStamina} / ${isWaveMode ? '450' : '300'})`, disabled: playerState.maxStamina >= (isWaveMode ? 450 : 300) },
    { type: 'luck', title: 'Sorte', description: 'Aumenta chance de flecha (40%) e nº de inimigos no estágio 2. (Uso único)', disabled: playerState.luck },
    { type: 'piercingArrows', title: 'Flecha Perfurante', description: `Flechas perfuram até ${isWaveMode ? 15 : 7} inimigos. (Uso único)`, disabled: playerState.piercingArrows },
    { type: 'economy', title: '+12% Economia de Mana', description: `Reduz custo de mana. (Atual: ${Math.round(playerState.manaCostReduction * 100)}%, Máx: 36%)`, disabled: playerState.manaCostReduction >= 0.36 },
  ];
  
  if (isWaveMode) {
    upgrades.push({ type: 'doublePoints', title: 'Pontos em Dobro', description: `Multiplica pontos por 2x. Acumula até 3x (2x/4x/6x). (Nível: ${wavePlayerState.doublePointsLevel}/3)`, disabled: wavePlayerState.doublePointsLevel >= 3 });
  }

  if (playerState.availableSpells.includes('necromancer')) {
    const maxLevel = isWaveMode ? 5 : 2;
    upgrades.push({
      type: 'necromancerUpgrade',
      title: 'Necromante',
      description: `Aumenta +1 aliado por uso, duplica vida e dano dos aliados. (Nível ${playerState.necromancerLevel}/${maxLevel})`,
      disabled: playerState.necromancerLevel >= maxLevel,
    });
  }

  if (isWaveMode && playerState.availableSpells.includes('explosion')) {
    upgrades.push({
      type: 'pinguinRico',
      title: 'Pinguin Rico',
      description: 'Melhora a magia Explosão, dobrando o raio e o dano, mas reduzindo a duração. (Uso único)',
      disabled: playerState.pinguinRicoLevel > 0,
    });
  }


  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-[#5c432c] p-8 border-4 border-[#493d2a] text-center rounded-lg shadow-xl w-[550px]">
        <h2 className="text-3xl mb-6 font-bold text-white">Escolha um Poder</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {upgrades.map(upgrade => (
            <button
              key={upgrade.type}
              onClick={() => !upgrade.disabled && setSelected(upgrade.type)}
              disabled={upgrade.disabled}
              className={`p-4 rounded-lg border-2 text-left transition-all ${selected === upgrade.type ? 'bg-[#a2876d] border-white' : 'bg-[#86755f] border-[#493d2a] hover:bg-[#998976]'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <h3 className="text-xl font-bold">{upgrade.title}</h3>
              <p className="text-sm text-[#f3e5ab]">{upgrade.description}</p>
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            if (selected) {
              onConfirm(selected);
              onClose();
            }
          }}
          disabled={!selected}
          className="py-3 px-8 text-xl bg-[#c0392b] text-white font-semibold rounded-lg hover:bg-[#e74c3c] disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};

export default RedChestUpgradeModal;