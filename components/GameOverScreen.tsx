
import React from 'react';

interface GameOverScreenProps {
  room: number;
  kills: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ room, kills, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black/85 text-white z-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl mb-4 font-bold">Game Over</h1>
      <h2 className="text-2xl mb-2">Sala: {room}</h2>
      <h2 className="text-2xl mb-6">Mortes: {kills}</h2>
      <div>
        <button
          onClick={onRestart}
          className="py-3 px-6 text-lg bg-[#86755f] border-2 border-[#493d2a] hover:bg-[#a2876d] rounded"
        >
          Tela Inicial
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
