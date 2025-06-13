import React from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { GameCanvas } from './components/GameCanvas';
import { GameUI } from './components/GameUI';

function App() {
  const { gameState, startGame, resetGame, selectGameMode, CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } = useGameEngine();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="relative">
        <GameCanvas
          player1={gameState.player1}
          player2={gameState.player2}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
          groundY={GROUND_Y}
        />
        <GameUI
          gameState={gameState}
          onStartGame={startGame}
          onResetGame={resetGame}
          onSelectGameMode={selectGameMode}
        />
      </div>
    </div>
  );
}

export default App;
