
import React, { useState } from 'react';

interface WaveModeBotSelectionProps {
  onStart: (botCount: number) => void;
  onBack: () => void;
}

const WaveModeBotSelection: React.FC<WaveModeBotSelectionProps> = ({ onStart, onBack }) => {
  const [botCount, setBotCount] = useState<number>(1);

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
      <div className="bg-[#6e5b45] p-8 border-4 border-[#493d2a] rounded-lg shadow-xl text-center w-full max-w-lg text-white">
        <h2 className="text-3xl font-bold mb-6">Configurar Aliados (Bots)</h2>
        
        <div className="mb-8">
            <label htmlFor="bot-slider" className="block text-xl mb-4">Quantidade de Bots: <span className="font-bold text-yellow-300 text-2xl">{botCount}</span></label>
            <input
                id="bot-slider"
                type="range"
                min="0"
                max="4"
                step="1"
                value={botCount}
                onChange={(e) => setBotCount(Number(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-yellow-400"
            />
             <div className="w-full flex justify-between text-xs px-1 mt-1">
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
            </div>
             <div className="w-full flex justify-between text-sm px-0">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
            </div>
        </div>

        <div className="flex justify-center gap-4">
            <button 
                onClick={() => onStart(botCount)}
                className="py-3 px-8 text-lg bg-green-700 hover:bg-green-800 transition-colors rounded-md shadow-lg"
            >
                Iniciar Jogo
            </button>
            <button 
                onClick={onBack}
                className="py-3 px-6 text-lg bg-gray-600 hover:bg-gray-700 transition-colors rounded-md shadow-lg"
            >
                Voltar
            </button>
        </div>
        <p className="text-sm text-gray-400 mt-6">Os bots lutarão ao seu lado, comprando itens e usando habilidades para sobreviver às ondas.</p>
      </div>
    </div>
  );
};

export default WaveModeBotSelection;
