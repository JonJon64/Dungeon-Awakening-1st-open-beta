
import React from 'react';

interface MenuScreenProps {
  onStartClassic: () => void;
  onStartWave: () => void;
  onControls: () => void;
  onCustomize: () => void;
  onCredits: () => void;
  onShowHowToPlay: () => void;
  onShowChangelog: () => void;
}

const MenuButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="py-3 px-6 my-2 w-48 text-lg bg-[#86755f] border-2 border-[#493d2a] text-[#f3e5ab] cursor-pointer shadow-md hover:bg-[#a2876d] transition-colors"
  >
    {children}
  </button>
);

const MenuScreen: React.FC<MenuScreenProps> = ({ onStartClassic, onStartWave, onControls, onCustomize, onCredits, onShowHowToPlay, onShowChangelog }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
      <h1 className="text-4xl mb-4 text-shadow font-bold" style={{ textShadow: '2px 2px 4px #000' }}>
        🗡️ Dungeon Awakening
      </h1>
      <MenuButton onClick={onStartClassic}>JOGAR</MenuButton>
      <MenuButton onClick={onStartWave}>MODO ONDA</MenuButton>
      <MenuButton onClick={onShowHowToPlay}>Como Jogar</MenuButton>
      <MenuButton onClick={onControls}>Controles</MenuButton>
      <MenuButton onClick={onCustomize}>Personalizar</MenuButton>
      <MenuButton onClick={onShowChangelog}>Changelog</MenuButton>
      <MenuButton onClick={onCredits}>Créditos</MenuButton>
    </div>
  );
};

export default MenuScreen;