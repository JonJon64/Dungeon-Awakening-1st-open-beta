
import React, { useState } from 'react';

export type UpgradeType = 'damage' | 'regen' | 'speed' | 'maxHealth';

const UPGRADES: { type: UpgradeType; title: string; description: string }[] = [
  { type: 'damage', title: '+50% Dano', description: 'Aumenta o dano do seu ataque.' },
  { type: 'regen', title: '+0.5 Regeneração/s', description: 'Recupera vida lentamente. Máximo de 2/s.' },
  { type: 'speed', title: '+20% Velocidade', description: 'Move-se mais rapidamente pelo dungeon.' },
  { type: 'maxHealth', title: '+0.5 Vida Máxima', description: 'Aumenta sua vida máxima permanentemente.' },
];

interface UpgradeModalProps {
  onConfirm: (upgrade: UpgradeType) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onConfirm }) => {
  const [selected, setSelected] = useState<UpgradeType | null>(null);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-[#5c432c] p-8 border-4 border-[#493d2a] text-center rounded-lg shadow-xl w-[500px]">
        <h2 className="text-3xl mb-6 font-bold text-white">Escolha um Atributo</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {UPGRADES.map(upgrade => (
            <button
              key={upgrade.type}
              onClick={() => setSelected(upgrade.type)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${selected === upgrade.type ? 'bg-[#a2876d] border-white' : 'bg-[#86755f] border-[#493d2a] hover:bg-[#998976]'}`}
            >
              <h3 className="text-xl font-bold">{upgrade.title}</h3>
              <p className="text-sm text-[#f3e5ab]">{upgrade.description}</p>
            </button>
          ))}
        </div>
        <button
          onClick={() => selected && onConfirm(selected)}
          disabled={!selected}
          className="py-3 px-8 text-xl bg-[#4f91e8] text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};

export default UpgradeModal;
