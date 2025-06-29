

import React from 'react';

interface MenuScreenProps {
  onStart: () => void;
  onControls: () => void;
  onCustomize: () => void;
  onCredits: () => void;
  onShowHowToPlay: () => void;
}

const MenuButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="py-3 px-6 my-2 w-48 text-lg bg-[#86755f] border-2 border-[#493d2a] text-[#f3e5ab] cursor-pointer shadow-md hover:bg-[#a2876d] transition-colors"
  >
    {children}
  </button>
);

const MenuScreen: React.FC<MenuScreenProps> = ({ onStart, onControls, onCustomize, onCredits, onShowHowToPlay }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
      <h1 className="text-4xl mb-4 text-shadow font-bold" style={{ textShadow: '2px 2px 4px #000' }}>
        🗡️ Dungeon Awakening
      </h1>
      <MenuButton onClick={onStart}>JOGAR</MenuButton>
      <MenuButton onClick={onShowHowToPlay}>Como Jogar</MenuButton>
      <MenuButton onClick={onControls}>Controles</MenuButton>
      <MenuButton onClick={onCustomize}>Personalizar</MenuButton>
      <MenuButton onClick={onCredits}>Créditos</MenuButton>
    </div>
  );
};

export default MenuScreen;