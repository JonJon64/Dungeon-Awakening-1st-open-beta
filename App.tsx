

import React, { useState, useCallback, useEffect } from 'react';
import { GameScreen } from './types';
import { initialControls, defaultCustomization } from './constants';
import type { Controls, Customization } from './types';
import MenuScreen from './components/MenuScreen';
import GameContainer from './components/GameContainer';
import ControlsModal from './components/ControlsModal';
import CreditsModal from './components/CreditsModal';
import CustomizeModal from './components/CustomizeModal';
import HowToPlayModal from './components/HowToPlayModal';

const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>(GameScreen.Menu);
  const [screenBeforeControls, setScreenBeforeControls] = useState<GameScreen>(GameScreen.Menu);
  const [controls, setControls] = useState<Controls>(initialControls);
  const [customization, setCustomization] = useState<Customization>(defaultCustomization);
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalStats, setFinalStats] = useState({ room: 0, kills: 0 });
  const [currentRoom, setCurrentRoom] = useState(1);

  const handleStartGame = useCallback(() => {
    setCurrentRoom(1);
    setScreen(GameScreen.Playing)
  }, []);

  const handleShowControls = useCallback(() => {
    setScreenBeforeControls(screen);
    setScreen(GameScreen.Controls);
  }, [screen]);

  const handleShowCredits = useCallback(() => setScreen(GameScreen.Credits), []);
  const handleShowCustomize = useCallback(() => setScreen(GameScreen.Customize), []);
  const handleShowHowToPlay = useCallback(() => setScreen(GameScreen.HowToPlay), []);
  
  const handleControlsClose = useCallback(() => {
    if (screenBeforeControls === GameScreen.Paused || screenBeforeControls === GameScreen.Playing) {
      setScreen(GameScreen.Paused);
    } else {
      setScreen(GameScreen.Menu);
    }
  }, [screenBeforeControls]);

  const handleBackToMenu = useCallback(() => {
    setCurrentRoom(1);
    setScreen(GameScreen.Menu);
  }, []);

  const handleGameOver = useCallback((room: number, kills: number) => {
    setFinalStats({ room, kills });
    setShowGameOver(true);
    setScreen(GameScreen.GameOver);
  }, []);
  
  const handleRestart = useCallback(() => {
    setShowGameOver(false);
    setCurrentRoom(1);
    setScreen(GameScreen.Menu);
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case GameScreen.Menu:
        return (
          <MenuScreen
            onStart={handleStartGame}
            onControls={handleShowControls}
            onCustomize={handleShowCustomize}
            onCredits={handleShowCredits}
            onShowHowToPlay={handleShowHowToPlay}
          />
        );
      case GameScreen.Playing:
      case GameScreen.Paused:
      case GameScreen.GameOver:
        return (
          <GameContainer
            controls={controls}
            customization={customization}
            onGameOver={handleGameOver}
            onShowControls={handleShowControls}
            onBackToMenu={handleBackToMenu}
            isPaused={screen === GameScreen.Paused}
            setPaused={(paused) => setScreen(paused ? GameScreen.Paused : GameScreen.Playing)}
            isGameOver={screen === GameScreen.GameOver}
            finalStats={finalStats}
            onRestart={handleRestart}
            onRoomChange={setCurrentRoom}
          />
        );
      case GameScreen.Controls:
        return (
          <ControlsModal
            controls={controls}
            onSave={setControls}
            onClose={handleControlsClose}
          />
        );
      case GameScreen.Credits:
        return <CreditsModal onClose={handleBackToMenu} />;
      case GameScreen.Customize:
        return (
          <CustomizeModal
            customization={customization}
            onConfirm={setCustomization}
            onClose={handleBackToMenu}
          />
        );
       case GameScreen.HowToPlay:
        return <HowToPlayModal onClose={handleBackToMenu} />;
      default:
        return <MenuScreen onStart={handleStartGame} onControls={handleShowControls} onCustomize={handleShowCustomize} onCredits={handleShowCredits} onShowHowToPlay={handleShowHowToPlay}/>;
    }
  };

  const isStage2 = currentRoom > 20 && currentRoom <= 40;
  const isStage3 = currentRoom > 40;
  const pageBgClass = isStage3 ? 'bg-red-950' : isStage2 ? 'bg-gray-800' : 'bg-[#5c432c]';


  return (
    <div className={`w-screen h-screen ${pageBgClass} transition-colors duration-1000`}>
      {renderScreen()}
      <div id="credits" className="absolute bottom-2.5 right-2.5 text-sm text-gray-300">
        Em Desenvolvimento talvez possa ficar pior 😆
      </div>
      <div id="version-label" className="absolute bottom-2.5 left-2.5 text-gray-300 text-[0.9rem]">
        1.6 Beta (React)
      </div>
    </div>
  );
};

export default App;