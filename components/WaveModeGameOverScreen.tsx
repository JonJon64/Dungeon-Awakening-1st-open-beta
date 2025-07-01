import React from 'react';

interface WaveModeGameOverScreenProps {
  wave: number;
  score: number;
  onRestart: () => void;
}

const WaveModeGameOverScreen: React.FC<WaveModeGameOverScreenProps> = ({ wave, score, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black/85 text-white z-50 flex flex-col items-center justify-center">
      <h1 className="text-5xl mb-6 font-bold text-red-500" style={{textShadow: '2px 2px 8px #000'}}>Fim de Jogo</h1>
      <div className="text-center bg-black/30 p-6 rounded-lg">
        <h2 className="text-3xl mb-3">Onda Alcançada: <span className="text-cyan-300 font-bold">{wave}</span></h2>
        <h2 className="text-3xl mb-6">Pontuação Final: <span className="text-yellow-300 font-bold">{score}</span></h2>
      </div>
      <div className="mt-8">
        <button
          onClick={onRestart}
          className="py-3 px-8 text-xl bg-[#86755f] border-2 border-[#493d2a] hover:bg-[#a2876d] rounded-lg shadow-lg transition-all hover:scale-105"
        >
          Menu Principal
        </button>
      </div>
    </div>
  );
};

export default WaveModeGameOverScreen;
