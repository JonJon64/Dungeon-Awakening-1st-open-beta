import React from 'react';

interface WaveModeLobbyProps {
  onBack: () => void;
}

const WaveModeLobby: React.FC<WaveModeLobbyProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
      <div className="bg-[#6e5b45] p-8 border-4 border-[#493d2a] rounded-lg shadow-xl text-center w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4 text-white">Lobby Online (LAN)</h2>
        <div className="bg-black/30 p-4 rounded-lg min-h-[200px] flex items-center justify-center mb-6">
            <p className="text-gray-300 text-lg">Procurando servidores na sua rede local...</p>
            {/* Logic to list servers would go here */}
        </div>
        <div className="flex justify-center gap-4">
            <button className="py-3 px-6 text-lg bg-green-700 hover:bg-green-800 transition-colors rounded-md shadow-lg">
                Criar Servidor
            </button>
            <button 
                onClick={onBack}
                className="py-3 px-6 text-lg bg-gray-600 hover:bg-gray-700 transition-colors rounded-md shadow-lg"
            >
                Voltar
            </button>
        </div>
        <p className="text-sm text-gray-400 mt-4">Funcionalidade multiplayer em desenvolvimento.</p>
      </div>
    </div>
  );
};

export default WaveModeLobby;
