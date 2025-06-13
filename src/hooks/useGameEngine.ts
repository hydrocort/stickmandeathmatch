import { useState, useEffect, useCallback, useRef } from 'react';
import { Fighter, GameState, AIState } from '../types/game';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GROUND_Y = 320;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;
const ATTACK_RANGE = 60;
const ATTACK_DAMAGE = 15;
const SPECIAL_DAMAGE = 25;
const ROUND_TIME = 99;

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>({
    player1: createFighter('player1', 'Player', 150, GROUND_Y),
    player2: createFighter('player2', 'Computer', 650, GROUND_Y, true),
    gameStatus: 'menu',
    gameMode: null,
    winner: null,
    round: 1,
    timeLeft: ROUND_TIME
  });

  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const aiState = useRef<AIState>({
    lastDecisionTime: 0,
    currentAction: 'idle',
    actionDuration: 0,
    reactionTime: 300 + Math.random() * 200,
    aggressiveness: 0.6
  });

  function createFighter(id: string, name: string, x: number, y: number, isAI = false): Fighter {
    return {
      id,
      name,
      position: { x, y },
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      facing: id === 'player1' ? 'right' : 'left',
      state: 'idle',
      velocity: { x: 0, y: 0 },
      isGrounded: true,
      attackCooldown: 0,
      blockCooldown: 0,
      combo: 0,
      lastAttackTime: 0,
      isAI
    };
  }

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keysPressed.current.add(event.key.toLowerCase());
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysPressed.current.delete(event.key.toLowerCase());
  }, []);

  const checkCollision = (fighter1: Fighter, fighter2: Fighter): boolean => {
    const distance = Math.abs(fighter1.position.x - fighter2.position.x);
    return distance < ATTACK_RANGE && Math.abs(fighter1.position.y - fighter2.position.y) < 50;
  };

  const updateAI = (aiFighter: Fighter, opponent: Fighter, currentTime: number): Set<string> => {
    const aiKeys = new Set<string>();
    const ai = aiState.current;
    
    // Make decisions every few hundred milliseconds
    if (currentTime - ai.lastDecisionTime > ai.reactionTime) {
      const distance = Math.abs(aiFighter.position.x - opponent.position.x);
      const healthRatio = aiFighter.health / aiFighter.maxHealth;
      const opponentHealthRatio = opponent.health / opponent.maxHealth;
      
      // Adjust aggressiveness based on health
      ai.aggressiveness = 0.4 + (1 - healthRatio) * 0.4 + (1 - opponentHealthRatio) * 0.2;
      
      // Decision making
      if (distance > 100) {
        // Too far - approach
        ai.currentAction = 'approach';
        ai.actionDuration = 500 + Math.random() * 500;
      } else if (distance < 40 && opponent.state === 'attacking') {
        // Close and opponent attacking - block or retreat
        ai.currentAction = Math.random() < 0.7 ? 'block' : 'retreat';
        ai.actionDuration = 300 + Math.random() * 200;
      } else if (distance < 70 && aiFighter.attackCooldown === 0) {
        // In attack range
        if (Math.random() < ai.aggressiveness) {
          ai.currentAction = aiFighter.energy >= 50 && Math.random() < 0.3 ? 'special' : 'attack';
          ai.actionDuration = 200;
        } else {
          ai.currentAction = 'block';
          ai.actionDuration = 400;
        }
      } else if (distance > 70 && distance < 120) {
        // Medium range - mix of approach and jump attacks
        if (Math.random() < 0.3 && aiFighter.isGrounded) {
          ai.currentAction = 'jump';
          ai.actionDuration = 300;
        } else {
          ai.currentAction = 'approach';
          ai.actionDuration = 400;
        }
      } else {
        // Default to approach
        ai.currentAction = 'approach';
        ai.actionDuration = 300;
      }
      
      ai.lastDecisionTime = currentTime;
      ai.reactionTime = 200 + Math.random() * 300; // Vary reaction time
    }
    
    // Execute current action
    if (currentTime - ai.lastDecisionTime < ai.actionDuration) {
      switch (ai.currentAction) {
        case 'approach':
          if (aiFighter.position.x < opponent.position.x) {
            aiKeys.add('arrowright');
          } else {
            aiKeys.add('arrowleft');
          }
          break;
        case 'retreat':
          if (aiFighter.position.x < opponent.position.x) {
            aiKeys.add('arrowleft');
          } else {
            aiKeys.add('arrowright');
          }
          break;
        case 'attack':
          aiKeys.add('k');
          break;
        case 'special':
          aiKeys.add(';');
          break;
        case 'block':
          aiKeys.add('l');
          break;
        case 'jump':
          aiKeys.add('arrowup');
          if (aiFighter.position.x < opponent.position.x) {
            aiKeys.add('arrowright');
          } else {
            aiKeys.add('arrowleft');
          }
          break;
      }
    }
    
    return aiKeys;
  };

  const updateFighter = (fighter: Fighter, opponent: Fighter, deltaTime: number, currentTime: number): Fighter => {
    const updated = { ...fighter };
    
    // Update cooldowns
    updated.attackCooldown = Math.max(0, updated.attackCooldown - deltaTime);
    updated.blockCooldown = Math.max(0, updated.blockCooldown - deltaTime);
    
    // Reset combo if too much time passed
    if (Date.now() - updated.lastAttackTime > 2000) {
      updated.combo = 0;
    }

    // Get input (either from player or AI)
    let activeKeys: Set<string>;
    if (fighter.isAI && gameState.gameMode === 'singlePlayer') {
      activeKeys = updateAI(fighter, opponent, currentTime);
    } else {
      activeKeys = keysPressed.current;
    }

    // Handle input
    const controls = fighter.id === 'player1' 
      ? { left: 'a', right: 'd', up: 'w', down: 's', attack: 'f', block: 'g', special: 'h' }
      : { left: 'arrowleft', right: 'arrowright', up: 'arrowup', down: 'arrowdown', attack: 'k', block: 'l', special: ';' };

    // Movement
    if (activeKeys.has(controls.left) && updated.state !== 'attacking' && updated.state !== 'hurt') {
      updated.velocity.x = -MOVE_SPEED;
      updated.facing = 'left';
      updated.state = updated.isGrounded ? 'walking' : updated.state;
    } else if (activeKeys.has(controls.right) && updated.state !== 'attacking' && updated.state !== 'hurt') {
      updated.velocity.x = MOVE_SPEED;
      updated.facing = 'right';
      updated.state = updated.isGrounded ? 'walking' : updated.state;
    } else if (updated.state === 'walking') {
      updated.velocity.x = 0;
      updated.state = 'idle';
    }

    // Jumping
    if (activeKeys.has(controls.up) && updated.isGrounded && updated.state !== 'attacking') {
      updated.velocity.y = JUMP_FORCE;
      updated.isGrounded = false;
      updated.state = 'jumping';
    }

    // Blocking
    if (activeKeys.has(controls.block) && updated.blockCooldown === 0 && updated.state !== 'attacking') {
      updated.state = 'blocking';
    } else if (updated.state === 'blocking' && !activeKeys.has(controls.block)) {
      updated.state = 'idle';
    }

    // Attacking
    if (activeKeys.has(controls.attack) && updated.attackCooldown === 0 && updated.state !== 'hurt') {
      updated.state = 'attacking';
      updated.attackCooldown = 500;
      updated.lastAttackTime = Date.now();
      
      // Check if attack hits
      if (checkCollision(updated, opponent) && opponent.state !== 'blocking') {
        const damage = ATTACK_DAMAGE + (updated.combo * 2);
        updated.combo = Math.min(updated.combo + 1, 10);
        
        // Apply damage to opponent
        setGameState(prev => ({
          ...prev,
          [opponent.id]: {
            ...prev[opponent.id as keyof typeof prev] as Fighter,
            health: Math.max(0, (prev[opponent.id as keyof typeof prev] as Fighter).health - damage),
            state: 'hurt'
          }
        }));
      }
    }

    // Special attack
    if (activeKeys.has(controls.special) && updated.energy >= 50 && updated.attackCooldown === 0) {
      updated.state = 'attacking';
      updated.attackCooldown = 1000;
      updated.energy = Math.max(0, updated.energy - 50);
      
      if (checkCollision(updated, opponent)) {
        const damage = SPECIAL_DAMAGE + (updated.combo * 3);
        updated.combo = Math.min(updated.combo + 2, 10);
        
        setGameState(prev => ({
          ...prev,
          [opponent.id]: {
            ...prev[opponent.id as keyof typeof prev] as Fighter,
            health: Math.max(0, (prev[opponent.id as keyof typeof prev] as Fighter).health - damage),
            state: 'hurt'
          }
        }));
      }
    }

    // Physics
    updated.velocity.y += GRAVITY;
    updated.position.x += updated.velocity.x;
    updated.position.y += updated.velocity.y;

    // Boundary checks
    updated.position.x = Math.max(50, Math.min(CANVAS_WIDTH - 50, updated.position.x));
    
    if (updated.position.y >= GROUND_Y) {
      updated.position.y = GROUND_Y;
      updated.velocity.y = 0;
      updated.isGrounded = true;
      if (updated.state === 'jumping') {
        updated.state = 'idle';
      }
    }

    // Energy regeneration
    if (updated.energy < updated.maxEnergy) {
      updated.energy = Math.min(updated.maxEnergy, updated.energy + 0.5);
    }

    // State transitions
    if (updated.state === 'attacking' && updated.attackCooldown < 300) {
      updated.state = 'idle';
    }
    
    if (updated.state === 'hurt' && updated.attackCooldown < 200) {
      updated.state = 'idle';
    }

    // Check for death
    if (updated.health <= 0) {
      updated.state = 'dead';
    }

    return updated;
  };

  const gameLoop = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    if (gameState.gameStatus === 'playing') {
      setGameState(prev => {
        const newPlayer1 = updateFighter(prev.player1, prev.player2, deltaTime, currentTime);
        const newPlayer2 = updateFighter(prev.player2, prev.player1, deltaTime, currentTime);
        
        // Check win conditions
        let winner = null;
        let gameStatus = prev.gameStatus;
        
        if (newPlayer1.health <= 0) {
          winner = prev.player2.name;
          gameStatus = 'gameOver';
        } else if (newPlayer2.health <= 0) {
          winner = prev.player1.name;
          gameStatus = 'gameOver';
        }

        // Update timer
        const newTimeLeft = Math.max(0, prev.timeLeft - deltaTime / 1000);
        if (newTimeLeft <= 0 && !winner) {
          if (newPlayer1.health > newPlayer2.health) {
            winner = prev.player1.name;
          } else if (newPlayer2.health > newPlayer1.health) {
            winner = prev.player2.name;
          } else {
            winner = 'Draw';
          }
          gameStatus = 'gameOver';
        }

        return {
          ...prev,
          player1: newPlayer1,
          player2: newPlayer2,
          winner,
          gameStatus,
          timeLeft: newTimeLeft
        };
      });
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameStatus, gameState.gameMode]);

  const selectGameMode = (mode: 'singlePlayer' | 'twoPlayer') => {
    const player2Name = mode === 'singlePlayer' ? 'Computer' : 'Player 2';
    const isAI = mode === 'singlePlayer';
    
    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      gameStatus: 'playing',
      player1: createFighter('player1', 'Player 1', 150, GROUND_Y),
      player2: createFighter('player2', player2Name, 650, GROUND_Y, isAI),
      winner: null,
      timeLeft: ROUND_TIME
    }));
    
    // Reset AI state
    aiState.current = {
      lastDecisionTime: 0,
      currentAction: 'idle',
      actionDuration: 0,
      reactionTime: 300 + Math.random() * 200,
      aggressiveness: 0.6
    };
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'modeSelect'
    }));
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'menu',
      gameMode: null,
      winner: null
    }));
  };

  const restartFight = () => {
    const mode = gameState.gameMode!;
    const player2Name = mode === 'singlePlayer' ? 'Computer' : 'Player 2';
    const isAI = mode === 'singlePlayer';
    
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
      player1: createFighter('player1', 'Player 1', 150, GROUND_Y),
      player2: createFighter('player2', player2Name, 650, GROUND_Y, isAI),
      winner: null,
      timeLeft: ROUND_TIME
    }));
    
    // Reset AI state
    aiState.current = {
      lastDecisionTime: 0,
      currentAction: 'idle',
      actionDuration: 0,
      reactionTime: 300 + Math.random() * 200,
      aggressiveness: 0.6
    };
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (gameState.gameStatus === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameState.gameStatus]);

  return {
    gameState,
    startGame,
    resetGame,
    restartFight,
    selectGameMode,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GROUND_Y
  };
};
