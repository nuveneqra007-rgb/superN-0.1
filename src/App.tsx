import React, { useState } from 'react';
import { BotFaction } from './game/BotData';
import { MainMenu } from './components/MainMenu';
import { ArenaCanvas } from './components/ArenaCanvas';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'menu' | 'arena'>('menu');
  const [botFaction, setBotFaction] = useState<BotFaction>(BotFaction.Thug);
  const [rounds, setRounds] = useState<number>(5);

  const handleStartGame = (faction: BotFaction, numRounds: number) => {
    setBotFaction(faction);
    setRounds(numRounds);
    setCurrentView('arena');
  };

  const handleExitToMenu = () => {
    setCurrentView('menu');
  };

  return (
    <div className="w-screen h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center overflow-hidden">
      {currentView === 'menu' ? (
        <MainMenu onStartGame={handleStartGame} />
      ) : (
        <ArenaCanvas
          botFaction={botFaction}
          maxRounds={rounds}
          onExitToMenu={handleExitToMenu}
        />
      )}
    </div>
  );
};

export default App;
