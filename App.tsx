
import React, { useState, useCallback } from 'react';
import { GameScreen, GameMode } from './types';
import { initialControls, defaultCustomization } from './constants';
import type { Controls, Customization } from './types';
import MenuScreen from './components/MenuScreen';
import GameContainer from './components/GameContainer';
import WaveMode from './components/WaveMode';
import ControlsModal from './components/ControlsModal';
import CreditsModal from './components/CreditsModal';
import CustomizeModal from './components/CustomizeModal';
import HowToPlayModal from './components/HowToPlayModal';
import WaveModeMenu from './components/WaveModeMenu';
import WaveModeLobby from './components/WaveModeLobby';
import WaveModeBotSelection from './components/WaveModeBotSelection';
import ChangelogModal from './components/ChangelogModal';

const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>(GameScreen.Menu);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.Classic);
  const [screenBeforeControls, setScreenBeforeControls] = useState<GameScreen>(GameScreen.Menu);
  const [controls, setControls] = useState<Controls>(initialControls);
  const [customization, setCustomization] = useState<Customization>(defaultCustomization);
  const [finalStats, setFinalStats] = useState({ room: 0, kills: 0 });
  const [currentRoom, setCurrentRoom] = useState(1); // Used for classic mode background
  const [botCount, setBotCount] = useState(0);

  const handleStartClassicGame = useCallback(() => {
    setGameMode(GameMode.Classic);
    setCurrentRoom(1);
    setScreen(GameScreen.Playing);
  }, []);
  
  const handleShowWaveBotSelection = useCallback(() => {
    setGameMode(GameMode.Wave);
    setScreen(GameScreen.WaveModeBotSelection);
  }, []);

  const handleStartWaveModeWithBots = useCallback((count: number) => {
    setBotCount(count);
    setGameMode(GameMode.Wave);
    setScreen(GameScreen.WaveModePlaying);
  }, []);

  const handleShowWaveModeMenu = useCallback(() => {
    setGameMode(GameMode.Wave);
    setScreen(GameScreen.WaveModeMenu);
  }, []);

  const handleShowWaveModeLobby = useCallback(() => {
    setScreen(GameScreen.WaveModeLobby);
  }, []);


  const handleShowControls = useCallback(() => {
    setScreenBeforeControls(screen);
    setScreen(GameScreen.Controls);
  }, [screen]);

  const handleShowCredits = useCallback(() => setScreen(GameScreen.Credits), []);
  const handleShowCustomize = useCallback(() => setScreen(GameScreen.Customize), []);
  const handleShowHowToPlay = useCallback(() => setScreen(GameScreen.HowToPlay), []);
  const handleShowChangelog = useCallback(() => setScreen(GameScreen.Changelog), []);
  
  const handleControlsClose = useCallback(() => {
    if (screenBeforeControls === GameScreen.Paused || screenBeforeControls === GameScreen.Playing) {
      setScreen(GameScreen.Paused);
    } else {
      setScreen(screenBeforeControls);
    }
  }, [screenBeforeControls]);

  const handleBackToMenu = useCallback(() => {
    setCurrentRoom(1);
    setGameMode(GameMode.Classic);
    setScreen(GameScreen.Menu);
  }, []);

  const handleGameOver = useCallback((room: number, kills: number) => {
    setFinalStats({ room, kills });
    setScreen(GameScreen.GameOver);
  }, []);
  
  const handleRestart = useCallback(() => {
    setCurrentRoom(1);
    setScreen(GameScreen.Menu);
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case GameScreen.Menu:
        return (
          <MenuScreen
            onStartClassic={handleStartClassicGame}
            onStartWave={handleShowWaveModeMenu}
            onControls={handleShowControls}
            onCustomize={handleShowCustomize}
            onCredits={handleShowCredits}
            onShowHowToPlay={handleShowHowToPlay}
            onShowChangelog={handleShowChangelog}
          />
        );
      case GameScreen.WaveModeMenu:
        return <WaveModeMenu onOffline={handleShowWaveBotSelection} onOnline={handleShowWaveModeLobby} onBack={handleBackToMenu} />;
      case GameScreen.WaveModeBotSelection:
        return <WaveModeBotSelection onStart={handleStartWaveModeWithBots} onBack={() => setScreen(GameScreen.WaveModeMenu)} />;
      case GameScreen.WaveModeLobby:
        return <WaveModeLobby onBack={() => setScreen(GameScreen.WaveModeMenu)} />;
      case GameScreen.WaveModePlaying:
      case GameScreen.WaveModeGameOver:
        return (
            <WaveMode
              controls={controls}
              customization={customization}
              onBackToMenu={handleBackToMenu}
              botCount={botCount}
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
       case GameScreen.Changelog:
        return <ChangelogModal onClose={handleBackToMenu} />;
      default:
        return <MenuScreen onStartClassic={handleStartClassicGame} onStartWave={handleShowWaveModeMenu} onControls={handleShowControls} onCustomize={handleShowCustomize} onCredits={handleShowCredits} onShowHowToPlay={handleShowHowToPlay} onShowChangelog={handleShowChangelog} />;
    }
  };

  const isStage2 = gameMode === GameMode.Classic && currentRoom > 20 && currentRoom <= 40;
  const isStage3 = gameMode === GameMode.Classic && currentRoom > 40;
  const isWaveMode = gameMode === GameMode.Wave;

  const pageBgClass = isStage3 ? 'bg-red-950' : (isStage2 || isWaveMode) ? 'bg-gray-800' : 'bg-[#5c432c]';

  return (
    <div className={`w-screen h-screen ${pageBgClass} transition-colors duration-1000 overflow-hidden`}>
      {renderScreen()}
      <div id="credits" className="absolute bottom-2.5 right-2.5 text-sm text-gray-300">
        Em Desenvolvimento talvez possa ficar pior 😆
      </div>
      <div id="version-label" className="absolute bottom-2.5 left-2.5 text-gray-300 text-[0.9rem]">
        1.9.9 Beta (React)
      </div>
    </div>
  );
};

export default App;