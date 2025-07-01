
import React from 'react';

interface WaveModeMenuProps {
  onOffline: () => void;
  onOnline: () => void;
  onBack: () => void;
}

const MenuButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`py-3 px-6 my-2 w-56 text-lg bg-[#86755f] border-2 border-[#493d2a] text-[#f3e5ab] cursor-pointer shadow-md hover:bg-[#a2876d] transition-colors ${className}`}
  >
    {children}
  </button>
);

const WaveModeMenu: React.FC<WaveModeMenuProps> = ({ onOffline, onOnline, onBack }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
      <h1 className="text-4xl mb-4 text-shadow font-bold" style={{ textShadow: '2px 2px 4px #000' }}>
        🌊 Modo Onda
      </h1>
      <p className="text-lg mb-6 text-gray-300 max-w-md text-center">Enfrente hordas infinitas de inimigos, sozinho ou com amigos. Acumule pontos, compre melhorias e sobreviva o máximo que puder!</p>
      <MenuButton onClick={onOnline}>Online (LAN)</MenuButton>
      <MenuButton onClick={onOffline}>Offline</MenuButton>
      <MenuButton onClick={onBack} className="mt-8 bg-gray-600 hover:bg-gray-700">Voltar</MenuButton>
      <p className="text-xs text-gray-400 mt-6 max-w-md text-center">
        O Modo Onda pode ter mecânicas diferentes, pois é um jogo em parte pensado para o ONLINE.
      </p>
    </div>
  );
};

export default WaveModeMenu;
