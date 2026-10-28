import React, { useState } from 'react';
import { BotFaction, getBotArchetype } from './game/BotData';
import { LandingScreen } from './components/LandingScreen';
import { ModeSelectScreen, GameMode } from './components/ModeSelectScreen';
import { MainMenu } from './components/MainMenu';
import { WorldSelectScreen } from './components/WorldSelectScreen';
import { ArenaCanvas } from './components/ArenaCanvas';
import { ArsenalView } from './components/ArsenalView';

export type Screen = 'landing' | 'mode' | 'select' | 'world' | 'arena';
export type { GameMode };

export const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('landing');
  const [gameMode, setGameMode] = useState<GameMode>('vsBot');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [showArsenal, setShowArsenal] = useState<boolean>(false);

  const [playerFaction, setPlayerFaction] = useState<BotFaction>(BotFaction.Ninja);
  const [botFaction, setBotFaction] = useState<BotFaction>(BotFaction.Thug);
  const [rounds, setRounds] = useState<number>(5);
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null);

  const transitionTo = (nextScreen: Screen) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setScreen(nextScreen);
      setIsTransitioning(false);
    }, 300);
  };

  const handleEnterFromLanding = () => {
    transitionTo('mode');
  };

  const handleBackToLanding = () => {
    transitionTo('landing');
  };

  const handleConfirmMode = () => {
    transitionTo('select');
  };

  const handleBackToMode = () => {
    transitionTo('mode');
  };

  const handleGoToWorldSelect = (player: BotFaction, bot: BotFaction, numRounds: number) => {
    setPlayerFaction(player);
    setBotFaction(bot);
    setRounds(numRounds);
    transitionTo('world');
  };

  const handleBackToSelect = () => {
    transitionTo('select');
  };

  const handleStartArena = () => {
    if (selectedWorldId) {
      transitionTo('arena');
    }
  };

  const handleExitToWorldSelect = () => {
    transitionTo('world');
  };

  const handleOpenArsenal = () => {
    setShowArsenal(true);
  };

  const handleCloseArsenal = () => {
    setShowArsenal(false);
  };

  const pArch = getBotArchetype(playerFaction);
  const bArch = getBotArchetype(botFaction);

  return (
    <div className="w-screen h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center overflow-hidden">
      <div
        className={`w-full h-full flex flex-col justify-center items-center transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {screen === 'landing' ? (
          <LandingScreen onEnter={handleEnterFromLanding} />
        ) : showArsenal ? (
          <ArsenalView onBackToMenu={handleCloseArsenal} />
        ) : screen === 'mode' ? (
          <ModeSelectScreen
            selectedMode={gameMode}
            onSelectMode={setGameMode}
            onConfirmMode={handleConfirmMode}
            onBackToLanding={handleBackToLanding}
          />
        ) : screen === 'select' ? (
          <MainMenu
            gameMode={gameMode}
            selectedPlayerFaction={playerFaction}
            onSelectPlayerFaction={setPlayerFaction}
            selectedBotFaction={botFaction}
            onSelectBotFaction={setBotFaction}
            rounds={rounds}
            onSelectRounds={setRounds}
            onGoToWorldSelect={handleGoToWorldSelect}
            onOpenArsenal={handleOpenArsenal}
            onBackToLanding={handleBackToMode}
          />
        ) : screen === 'world' ? (
          <WorldSelectScreen
            selectedWorldId={selectedWorldId}
            onSelectWorld={setSelectedWorldId}
            onStartGame={handleStartArena}
            onBackToSelect={handleBackToSelect}
            playerFactionName={pArch.name}
            botFactionName={bArch.name}
            rounds={rounds}
          />
        ) : (
          <ArenaCanvas
            gameMode={gameMode}
            playerFaction={playerFaction}
            botFaction={botFaction}
            maxRounds={rounds}
            worldId={selectedWorldId || 'classic'}
            onExitToMenu={handleExitToWorldSelect}
          />
        )}
      </div>
    </div>
  );
};

export default App;
