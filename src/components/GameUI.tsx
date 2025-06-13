import React from 'react';
import { GameState } from '../types/game';
import { Play, RotateCcw, User, Users, Bot, ArrowLeft } from 'lucide-react';

interface GameUIProps {
  gameState: GameState;
  onStartGame: () => void;
  onResetGame: () => void;
  onSelectGameMode?: (mode: 'singlePlayer' | 'twoPlayer') => void;
}

export const GameUI: React.FC<GameUIProps> = ({ 
  gameState, 
  onStartGame, 
  onResetGame, 
  onSelectGameMode 
}) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (gameState.gameStatus === 'menu') {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Stickman Fighter</h1>
          <div className="mb-6 text-left space-y-2">
            <h3 className="font-bold text-lg">Player 1 Controls:</h3>
            <p><span className="font-mono bg-gray-200 px-2 py-1 rounded">A/D</span> - Move</p>
            <p><span className="font-mono bg-gray-200 px-2 py-1 rounded">W</span> - Jump</p>
            <p><span className="font-mono bg-gray-200 px-2 py-1 rounded">F</span> - Attack</p>
            <p><span className="font-mono bg-gray-200 px-2 py-1 rounded">G</span> - Block</p>
            <p><span className="font-mono bg-gray-200 px-2 py-1 rounded">H</span> - Special (50 energy)</p>
            
            <h3 className="font-bold text-lg mt-4">Player 2 Controls:</h3>
            <p><span className="font-mono bg-gray-200 px-2 py-1 rounded">←/→</span> - Move</p>
            <p><span className="font-mono bg-gray-200 px-2 py-1 rounded">↑</span> - Jump</p>
            <p><span className="font-mono bg-gray-200 px-2 py-1 rounded">K</span> - Attack</p>
            <p><span className="font-mono bg-gray-200 px-2 py-1 rounded">L</span> - Block</p>
            <p><span className="font-mono bg-gray-200 px-2 py-1 rounded">;</span> - Special (50 energy)</p>
          </div>
          <button
            onClick={onStartGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <Play size={20} />
            Start Fight
          </button>
        </div>
      </div>
    );
  }

  if (gameState.gameStatus === 'modeSelect') {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center max-w-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Choose Game Mode</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Single Player Mode */}
            <button
              onClick={() => onSelectGameMode?.('singlePlayer')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-2">
                  <User size={24} />
                  <span className="text-2xl">vs</span>
                  <Bot size={24} />
                </div>
                <h3 className="text-xl font-bold">Single Player</h3>
                <p className="text-sm opacity-90">Fight against AI opponent</p>
              </div>
            </button>

            {/* Versus Mode */}
            <button
              onClick={() => onSelectGameMode?.('twoPlayer')}
              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-2">
                  <User size={24} />
                  <span className="text-2xl">vs</span>
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold">Versus Mode</h3>
                <p className="text-sm opacity-90">Two players compete</p>
              </div>
            </button>
          </div>

          <button
            onClick={onResetGame}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 mx-auto transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (gameState.gameStatus === 'gameOver') {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {gameState.winner === 'Draw' ? 'Draw!' : `${gameState.winner} Wins!`}
          </h2>
          <div className="mb-6">
            <p className="text-lg">Final Health:</p>
            <p>{gameState.player1.name}: {gameState.player1.health}%</p>
            <p>{gameState.player2.name}: {gameState.player2.health}%</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onStartGame}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors"
            >
              <Play size={16} />
              Fight Again
            </button>
            <button
              onClick={onResetGame}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={16} />
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Game Timer */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{formatTime(gameState.timeLeft)}</div>
            <div className="text-sm">Round {gameState.round}</div>
          </div>
        </div>
      </div>

      {/* Game Mode Indicator */}
      <div className="absolute top-4 right-4">
        <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg flex items-center gap-2">
          {gameState.gameMode === 'singlePlayer' ? (
            <>
              <Bot size={16} />
              <span className="text-sm font-medium">Single Player</span>
            </>
          ) : (
            <>
              <Users size={16} />
              <span className="text-sm font-medium">Versus Mode</span>
            </>
          )}
        </div>
      </div>
    </>
  );
};
