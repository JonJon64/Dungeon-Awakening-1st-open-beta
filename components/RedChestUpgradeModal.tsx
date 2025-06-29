import React, { useState } from 'react';
import type { PlayerState } from '../types';

export type RedChestUpgradeType = 'knowledge' | 'magic' | 'renegade' | 'resistant' | 'corredor' | 'luck' | 'piercingArrows' | 'economy' | 'necromancerUpgrade';

interface RedChestUpgradeModalProps {
  onConfirm: (upgrade: RedChestUpgradeType) => void;
  onClose: () => void;
  playerState: PlayerState;
}

const RedChestUpgradeModal: React.FC<RedChestUpgradeModalProps> = ({ onConfirm, onClose, playerState }) => {
  const [selected, setSelected] = useState<RedChestUpgradeType | null>(null);

  const upgrades: { type: RedChestUpgradeType; title: string; description: string; disabled: boolean; }[] = [
    { type: 'knowledge', title: '+3% Conhecimento', description: `Chance de negar dano recebido. (Atual: ${playerState.knowledge}%, Máx: 30%)`, disabled: playerState.knowledge >= 30 },
    { type: 'magic', title: '+5% Magia', description: `Desbloqueia e aprimora poderes mágicos. (Atual: ${playerState.magic}%)`, disabled: playerState.magic >= 100 },
    { type: 'renegade', title: '+5% Renegado', description: `Chance de distribuir dano recebido. (Atual: ${playerState.renegade}%, Máx: 30%)`, disabled: playerState.renegade >= 30 },
    { type: 'resistant', title: 'Resistência', description: 'Melhora o escudo (duração e recarga). (Uso único)', disabled: playerState.resistant },
    { type: 'corredor', title: '+25 Estamina Máxima', description: `Aumenta seu vigor máximo. (Atual: ${playerState.maxStamina} / 300)`, disabled: playerState.maxStamina >= 300 },
    { type: 'luck', title: 'Sorte', description: 'Aumenta chance de flecha (40%) e nº de inimigos no estágio 2. (Uso único)', disabled: playerState.luck },
    { type: 'piercingArrows', title: 'Flecha Perfurante', description: 'Flechas atravessam 7 inimigos (dano 2.5) e os empurram. (Uso único)', disabled: playerState.piercingArrows },
    { type: 'economy', title: '+12% Economia de Mana', description: `Reduz custo de mana. (Atual: ${Math.round(playerState.manaCostReduction * 100)}%, Máx: 36%)`, disabled: playerState.manaCostReduction >= 0.36 },
  ];

  if (playerState.availableSpells.includes('necromancer')) {
    upgrades.push({
      type: 'necromancerUpgrade',
      title: 'Necromante',
      description: `Aumenta +1 aliado por uso, duplica vida e dano dos aliados. (Nível ${playerState.necromancerLevel}/2)`,
      disabled: playerState.necromancerLevel >= 2,
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