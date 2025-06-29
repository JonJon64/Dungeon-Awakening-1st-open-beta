import React, { useState, useEffect } from 'react';
import type { Controls } from '../types';
import { initialControls } from '../constants';

interface ControlsModalProps {
  controls: Controls;
  onSave: (newControls: Controls) => void;
  onClose: () => void;
}

const ControlsModal: React.FC<ControlsModalProps> = ({ controls, onSave, onClose }) => {
  const [currentControls, setCurrentControls] = useState(controls);
  const [editingKey, setEditingKey] = useState<keyof Controls | null>(null);

  const handleSave = () => {
    onSave(currentControls);
    onClose();
  };
  
  const handleReset = () => {
    setCurrentControls(initialControls);
  }

  const handleKeyDown = (event: KeyboardEvent) => {
      if (!editingKey) return;

      let value = event.key;
      // Use 'Espaço' for spacebar for better display
      if (value === ' ') {
          event.preventDefault();
      }
      
      setCurrentControls(prev => ({ ...prev, [editingKey]: value }));
      setEditingKey(null); // Stop editing after a key is pressed
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [editingKey]);

  const createControlEditor = (key: keyof Controls, label: string) => {
    const isEditing = editingKey === key;
    let displayValue = currentControls[key];
    if (displayValue === ' ') displayValue = 'Espaço';

    return (
        <label className="block my-2 text-left w-full max-w-sm mx-auto flex justify-between items-center">
            <span className="text-white">{label}:</span>
            <div
                tabIndex={0}
                onFocus={() => setEditingKey(key)}
                onBlur={() => setEditingKey(null)}
                className="w-28 text-center ml-2 text-lg bg-gray-200 text-black rounded cursor-pointer p-1 border-2 border-transparent focus:border-blue-500 focus:outline-none"
            >
              {isEditing ? '...' : displayValue}
            </div>
        </label>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center" onClick={(e) => { if(e.target === e.currentTarget) setEditingKey(null); }}>
      <div className="bg-[#86755f] p-5 border-2 border-[#493d2a] text-center rounded-lg shadow-xl min-w-[340px]">
        <h2 className="text-2xl mb-4 font-bold">Configurar Controles</h2>
        {editingKey && <p className="text-sm text-yellow-200 mb-2">Pressione qualquer tecla para definir...</p>}
        {createControlEditor('up', 'Mover para cima')}
        {createControlEditor('down', 'Mover para baixo')}
        {createControlEditor('left', 'Mover para esquerda')}
        {createControlEditor('right', 'Mover para direita')}
        {createControlEditor('run', 'Correr')}
        {createControlEditor('attack', 'Atacar')}
        {createControlEditor('shield', 'Escudo')}
        {createControlEditor('magic', 'Usar Magia')}
        {createControlEditor('switchMagic', 'Trocar Magia')}
        {createControlEditor('fireBow', 'Disparar Arco')}
        
        <div className="mt-6 space-x-2">
            <button onClick={handleSave} className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button>
            <button onClick={onClose} className="py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700">Cancelar</button>
            <button onClick={handleReset} className="py-2 px-4 bg-gray-300 text-black rounded hover:bg-gray-400">Redefinir</button>
        </div>
      </div>
    </div>
  );
};

export default ControlsModal;