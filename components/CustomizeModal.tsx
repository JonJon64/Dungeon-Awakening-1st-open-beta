
import React, { useState } from 'react';
import type { Customization, PlayerShape } from '../types';
import { defaultCustomization } from '../constants';

interface CustomizeModalProps {
  customization: Customization;
  onConfirm: (newCustomization: Customization) => void;
  onClose: () => void;
}

const COLORS = ['#4f91e8', '#e84f4f', '#4fe87a', '#e8e84f', '#a44fe8'];
const SHAPES: PlayerShape[] = ['circle', 'square', 'pentagon'];

const CustomizeModal: React.FC<CustomizeModalProps> = ({ customization, onConfirm, onClose }) => {
  const [currentColor, setCurrentColor] = useState(customization.color);
  const [currentShape, setCurrentShape] = useState(customization.shape);

  const handleConfirm = () => {
    onConfirm({ color: currentColor, shape: currentShape });
    onClose();
  };

  const handleReset = () => {
    setCurrentColor(defaultCustomization.color);
    setCurrentShape(defaultCustomization.shape);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-30 flex items-center justify-center">
      <div className="bg-[#86755f] p-8 rounded-xl text-center min-w-[320px]">
        <h2 className="text-2xl font-bold mb-6">Personalize seu personagem</h2>
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Cor:</label>
          <div className="flex justify-center space-x-2">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`w-9 h-9 rounded-full border-2 border-[#493d2a] transition-all ${currentColor === color ? 'ring-2 ring-offset-2 ring-white ring-offset-[#86755f]' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <div className="mb-8">
          <label className="block mb-2 font-semibold">Forma:</label>
          <div className="flex justify-center space-x-2">
            {SHAPES.map(shape => (
              <button
                key={shape}
                onClick={() => setCurrentShape(shape)}
                className={`py-2 px-4 rounded-lg border-2 border-[#493d2a] capitalize transition-all ${currentShape === shape ? 'ring-2 ring-offset-2 ring-white ring-offset-[#86755f]' : ''}`}
              >
                {shape === 'circle' ? 'Círculo' : shape === 'square' ? 'Quadrado' : 'Pentágono'}
              </button>
            ))}
          </div>
        </div>
        <div className="space-x-4">
          <button id="confirm-custom" onClick={handleConfirm} className="py-2 px-5 rounded-lg bg-[#4f91e8] text-white font-semibold hover:bg-blue-600">Confirmar</button>
          <button id="reset-custom" onClick={handleReset} className="py-2 px-5 rounded-lg bg-gray-300 text-black font-semibold hover:bg-gray-400">Redefinir</button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeModal;
