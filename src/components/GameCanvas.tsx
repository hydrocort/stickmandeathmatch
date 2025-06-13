import React, { useRef, useEffect } from 'react';
import { Fighter } from '../types/game';

interface GameCanvasProps {
  player1: Fighter;
  player2: Fighter;
  canvasWidth: number;
  canvasHeight: number;
  groundY: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  player1,
  player2,
  canvasWidth,
  canvasHeight,
  groundY
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawStickman = (ctx: CanvasRenderingContext2D, fighter: Fighter) => {
    const { x, y } = fighter.position;
    const scale = fighter.facing === 'left' ? -1 : 1;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, 1);
    
    // Set color based on state
    let color = '#000';
    if (fighter.state === 'hurt') color = '#ff0000';
    else if (fighter.state === 'attacking') color = '#ff6600';
    else if (fighter.state === 'blocking') color = '#0066ff';
    else if (fighter.id === 'player1') color = '#0066cc';
    else color = '#cc0066';
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -60, 12, 0, Math.PI * 2);
    ctx.stroke();
    
    // Body
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.lineTo(0, -10);
    ctx.stroke();
    
    // Arms
    const armAngle = fighter.state === 'attacking' ? Math.PI / 4 : 0;
    const armY = -35;
    
    // Left arm
    ctx.beginPath();
    ctx.moveTo(0, armY);
    ctx.lineTo(-20 * Math.cos(armAngle), armY + 20 * Math.sin(armAngle));
    ctx.stroke();
    
    // Right arm
    ctx.beginPath();
    ctx.moveTo(0, armY);
    ctx.lineTo(20 * Math.cos(armAngle), armY + 20 * Math.sin(armAngle));
    ctx.stroke();
    
    // Legs
    const legSpread = fighter.state === 'walking' ? 10 : 0;
    const legBend = fighter.state === 'jumping' ? -10 : 0;
    
    // Left leg
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-10 - legSpread, 15 + legBend);
    ctx.stroke();
    
    // Right leg
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(10 + legSpread, 15 + legBend);
    ctx.stroke();
    
    // Special effects
    if (fighter.state === 'attacking' && fighter.energy >= 50) {
      // Energy aura
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, -30, 25, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    if (fighter.combo > 0) {
      // Combo indicator
      ctx.fillStyle = '#ff6600';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${fighter.combo}x`, 0, -80);
    }
    
    ctx.restore();
  };

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY);
    
    // Grass
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, groundY, canvasWidth, 10);
    
    // Arena boundaries
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, groundY);
    ctx.moveTo(canvasWidth - 50, 0);
    ctx.lineTo(canvasWidth - 50, groundY);
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw background
    drawBackground(ctx);
    
    // Draw fighters
    drawStickman(ctx, player1);
    drawStickman(ctx, player2);
    
    // Draw health bars
    const drawHealthBar = (fighter: Fighter, x: number) => {
      const barWidth = 200;
      const barHeight = 20;
      const healthPercent = fighter.health / fighter.maxHealth;
      
      // Background
      ctx.fillStyle = '#333';
      ctx.fillRect(x, 20, barWidth, barHeight);
      
      // Health
      ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
      ctx.fillRect(x, 20, barWidth * healthPercent, barHeight);
      
      // Border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 20, barWidth, barHeight);
      
      // Name
      ctx.fillStyle = '#000';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(fighter.name, x, 15);
    };
    
    drawHealthBar(player1, 50);
    drawHealthBar(player2, canvasWidth - 250);
    
    // Draw energy bars
    const drawEnergyBar = (fighter: Fighter, x: number) => {
      const barWidth = 200;
      const barHeight = 10;
      const energyPercent = fighter.energy / fighter.maxEnergy;
      
      // Background
      ctx.fillStyle = '#333';
      ctx.fillRect(x, 45, barWidth, barHeight);
      
      // Energy
      ctx.fillStyle = '#00aaff';
      ctx.fillRect(x, 45, barWidth * energyPercent, barHeight);
      
      // Border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, 45, barWidth, barHeight);
    };
    
    drawEnergyBar(player1, 50);
    drawEnergyBar(player2, canvasWidth - 250);
    
  }, [player1, player2, canvasWidth, canvasHeight, groundY]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="border-4 border-gray-800 rounded-lg shadow-2xl bg-gradient-to-b from-blue-200 to-green-200"
    />
  );
};
