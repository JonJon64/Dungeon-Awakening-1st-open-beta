
import React from 'react';

interface CreditsModalProps {
  onClose: () => void;
}

const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
      <div className="bg-[#86755f] p-8 border-2 border-[#493d2a] text-center rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Créditos</h2>
        <div className="text-base space-y-2">
          <p>Script feito no Copilot</p>
          <p>sendo atualizado no GITHub Copilot</p>
          <p>Revisão por Jonatha</p>
          <p>Linguagem 75% JS 20% HTML 5% CSS</p>
          <p>Atualmente desenvolvido no VScode</p>
          <p>Refatorado para React por Gemini</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 py-2 px-6 text-lg bg-gray-300 text-black rounded hover:bg-gray-400 transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default CreditsModal;
