
import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onHome: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onHome }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-40 flex flex-col items-center justify-center text-lg">
      <button onClick={onHome} className="m-2 py-2 px-4 bg-gray-200 text-black rounded">Tela Inicial</button>
      <button onClick={onResume} className="m-2 py-2 px-4 bg-gray-200 text-black rounded">Despausar</button>
    </div>
  );
};

export default PauseMenu;