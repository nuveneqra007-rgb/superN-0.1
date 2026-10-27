import React, { useState } from 'react';
import { BotFaction } from './game/BotData';
import { MainMenu } from './components/MainMenu';
import { ArenaCanvas } from './components/ArenaCanvas';
import { ArsenalView } from './components/ArsenalView';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'menu' | 'arena' | 'arsenal'>('menu');
  const [playerFaction, setPlayerFaction] = useState<BotFaction>(BotFaction.Assassin);
  const [botFaction, setBotFaction] = useState<BotFaction>(BotFaction.Thug);
  const [rounds, setRounds] = useState<number>(5);

  const handleStartGame = (player: BotFaction, bot: BotFaction, numRounds: number) => {
    setPlayerFaction(player);
    setBotFaction(bot);
    setRounds(numRounds);
    setCurrentView('arena');
  };

  const handleExitToMenu = () => {
    setCurrentView('menu');
  };

  const handleOpenArsenal = () => {
    setCurrentView('arsenal');
  };

  return (
    <div className="w-screen h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center overflow-hidden">
      {currentView === 'menu' ? (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenArsenal={handleOpenArsenal}
        />
      ) : currentView === 'arsenal' ? (
        <ArsenalView
          onBackToMenu={handleExitToMenu}
        />
      ) : (
        <ArenaCanvas
          playerFaction={playerFaction}
          botFaction={botFaction}
          maxRounds={rounds}
          onExitToMenu={handleExitToMenu}
        />
      )}
    </div>
  );
};

export default App;
