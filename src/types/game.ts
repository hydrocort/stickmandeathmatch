export interface Position {
  x: number;
  y: number;
}

export interface Fighter {
  id: string;
  name: string;
  position: Position;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  facing: 'left' | 'right';
  state: 'idle' | 'walking' | 'jumping' | 'attacking' | 'blocking' | 'hurt' | 'dead';
  velocity: Position;
  isGrounded: boolean;
  attackCooldown: number;
  blockCooldown: number;
  combo: number;
  lastAttackTime: number;
  isAI?: boolean;
}

export interface GameState {
  player1: Fighter;
  player2: Fighter;
  gameStatus: 'menu' | 'modeSelect' | 'playing' | 'paused' | 'gameOver';
  gameMode: 'singlePlayer' | 'twoPlayer' | null;
  winner: string | null;
  round: number;
  timeLeft: number;
}

export interface Controls {
  left: string;
  right: string;
  up: string;
  down: string;
  attack: string;
  block: string;
  special: string;
}

export interface AIState {
  lastDecisionTime: number;
  currentAction: 'idle' | 'approach' | 'retreat' | 'attack' | 'block' | 'jump';
  actionDuration: number;
  reactionTime: number;
  aggressiveness: number;
}
