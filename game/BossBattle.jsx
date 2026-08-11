import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { drawAnt, drawRedAnt, drawBigRedAnt } from './AntRenderer';
import Confetti from './Confetti';

export default function BossBattle({ bossType = 'red', onWin, onLose, onMusicIntensity }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [playerHP, setPlayerHP] = useState(100);
  const [bossHP, setBossHP] = useState(bossType === 'big' ? 150 : 100);
  const maxBossHP = bossType === 'big' ? 150 : 100;
  const [hitEffect, setHitEffect] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [powers, setPowers] = useState(bossType === 'big' ? [
    { name: 'Fire Breeze', key: '1', cooldown: 0, damage: 25, color: '#ff4500' },
    { name: 'Ice Cover', key: '2', cooldown: 0, damage: 20, color: '#00bfff' },
    { name: 'Jail Power', key: '3', cooldown: 0, damage: 30, color: '#9932cc' },
  ] : []);
  
  const gameRef = useRef({
    playerX: 150,
    playerY: 300,
    bossX: 500,
    bossY: 300,
    keys: {},
    bossDir: -1,
    bossAttackTimer: 0,
    lastAttack: 0,
    powerEffects: [],
  });

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
    setTimeout(() => setPhase('fight'), 500);
  }, [phase, countdown]);

  // Key handlers
  useEffect(() => {
    const down = (e) => { gameRef.current.keys[e.key.toLowerCase()] = true; };
    const up = (e) => { gameRef.current.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Click to attack
  const handleCanvasClick = useCallback((e) => {
    if (phase !== 'fight') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const g = gameRef.current;
    
    const dist = Math.hypot(mx - g.bossX, my - g.bossY);
    if (dist < 60) {
      setBossHP(prev => {
        const next = Math.max(0, prev - 8);
        if (next <= 0) { setShowConfetti(true); setTimeout(() => onWin(), 1500); }
        return next;
      });
      setHitEffect({ x: g.bossX, y: g.bossY, t: Date.now() });
    }
  }, [phase, onWin]);

  // Power ups (final boss only)
  useEffect(() => {
    const handleKey = (e) => {
      if (phase !== 'fight' || bossType !== 'big') return;
      const key = e.key;
      const power = powers.find(p => p.key === key);
      if (power && power.cooldown <= 0) {
        setBossHP(prev => {
          const next = Math.max(0, prev - power.damage);
          if (next <= 0) { setShowConfetti(true); setTimeout(() => onWin(), 1500); }
          return next;
        });
        gameRef.current.powerEffects.push({ 
          x: gameRef.current.bossX, 
          y: gameRef.current.bossY, 
          color: power.color, 
          t: Date.now(),
          name: power.name 
        });
        setPowers(prev => prev.map(p => p.key === key ? { ...p, cooldown: 5 } : p));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, bossType, powers, onWin]);

  // Music intensity
  useEffect(() => {
    if (phase === 'fight' && onMusicIntensity) {
      const intensity = (maxBossHP - bossHP) / maxBossHP * 0.5 + 0.4;
      onMusicIntensity(intensity);
    }
    if (phase === 'countdown' && onMusicIntensity) {
      onMusicIntensity(0.3);
    }
  }, [phase, bossHP, maxBossHP, onMusicIntensity]);

  // Cooldown timer
  useEffect(() => {
    if (bossType !== 'big') return;
    const interval = setInterval(() => {
      setPowers(prev => prev.map(p => ({ ...p, cooldown: Math.max(0, p.cooldown - 1) })));
    }, 1000);
    return () => clearInterval(interval);
  }, [bossType]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame;

    const loop = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const w = canvas.width;
      const h = canvas.height;
      const g = gameRef.current;
      const t = Date.now() / 1000;

      // Arena background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, bossType === 'big' ? '#1a0a0a' : '#3a2508');
      grad.addColorStop(1, bossType === 'big' ? '#2a1010' : '#2a1a08');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Arena floor
      ctx.fillStyle = bossType === 'big' ? '#3a1a1a' : '#5a3e10';
      ctx.fillRect(0, h * 0.7, w, h * 0.3);

      if (phase === 'fight') {
        // Player movement
        const speed = 5;
        if (g.keys['a'] || g.keys['arrowleft']) g.playerX -= speed;
        if (g.keys['d'] || g.keys['arrowright']) g.playerX += speed;
        if (g.keys['w'] || g.keys['arrowup']) g.playerY -= speed;
        if (g.keys['s'] || g.keys['arrowdown']) g.playerY += speed;
        g.playerX = Math.max(30, Math.min(w - 30, g.playerX));
        g.playerY = Math.max(50, Math.min(h - 80, g.playerY));

        // Boss AI
        g.bossAttackTimer++;
        g.bossX += Math.sin(t * 2) * 2;
        g.bossY += Math.cos(t * 1.5) * 1.5;
        g.bossX = Math.max(100, Math.min(w - 100, g.bossX));
        g.bossY = Math.max(100, Math.min(h - 100, g.bossY));

        // Boss attacks player
        if (g.bossAttackTimer > 90) {
          const dist = Math.hypot(g.playerX - g.bossX, g.playerY - g.bossY);
          if (dist < 80) {
            setPlayerHP(prev => {
              const next = Math.max(0, prev - (bossType === 'big' ? 8 : 5));
              if (next <= 0) setTimeout(() => onLose(), 500);
              return next;
            });
            g.bossAttackTimer = 0;
          }
        }

        // Boss charges at player periodically
        if (Math.floor(t) % 4 === 0) {
          const dx = g.playerX - g.bossX;
          const dy = g.playerY - g.bossY;
          const d = Math.hypot(dx, dy);
          if (d > 0) {
            g.bossX += (dx / d) * 3;
            g.bossY += (dy / d) * 3;
          }
        }
      }

      // Draw player
      const facing = g.playerX < g.bossX ? 'right' : 'left';
      drawAnt(ctx, g.playerX, g.playerY, 24, '#4a2810', facing, false, false);

      // Draw boss
      const bossFace = g.bossX < g.playerX ? 'right' : 'left';
      if (bossType === 'big') {
        drawBigRedAnt(ctx, g.bossX, g.bossY, 36, bossFace);
      } else {
        drawRedAnt(ctx, g.bossX, g.bossY, 28, bossFace);
      }

      // Hit effects
      if (hitEffect && Date.now() - hitEffect.t < 300) {
        ctx.fillStyle = 'rgba(255,255,0,0.4)';
        ctx.beginPath();
        ctx.arc(hitEffect.x, hitEffect.y, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Power effects
      g.powerEffects = g.powerEffects.filter(pe => Date.now() - pe.t < 800);
      g.powerEffects.forEach(pe => {
        const age = (Date.now() - pe.t) / 800;
        ctx.globalAlpha = 1 - age;
        ctx.fillStyle = pe.color;
        ctx.beginPath();
        ctx.arc(pe.x, pe.y, 20 + age * 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pe.name, pe.x, pe.y - 30 - age * 20);
      });

      frame = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(frame);
  }, [phase, hitEffect, bossType, onWin, onLose]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full cursor-crosshair" 
        onClick={handleCanvasClick}
      />
      <Confetti active={showConfetti} duration={3000} />

      {/* Health bars */}
      {phase !== 'countdown' && (
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between gap-4">
          <div className="flex-1">
            <div className="text-xs font-display text-amber-200 mb-1">ANT</div>
            <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-amber-800/40">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${playerHP}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)' }}
              />
            </div>
          </div>
          <div className="flex-1 text-right">
            <div className="text-xs font-display text-red-300 mb-1">
              {bossType === 'big' ? 'BIG RED ANT' : 'RED ANT'}
            </div>
            <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-red-800/40">
              <div 
                className="h-full rounded-full transition-all duration-300 ml-auto"
                style={{ width: `${(bossHP / maxBossHP) * 100}%`, background: 'linear-gradient(90deg, #dc2626, #ef4444)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Power ups (final boss) */}
      {bossType === 'big' && phase === 'fight' && (
        <div className="absolute bottom-4 left-4 z-20 flex gap-2">
          {powers.map(p => (
            <div 
              key={p.key}
              className={`px-3 py-2 rounded-lg border text-xs font-display ${p.cooldown > 0 ? 'opacity-40' : 'opacity-100'}`}
              style={{ background: p.color + '33', borderColor: p.color, color: p.color }}
            >
              [{p.key}] {p.name} {p.cooldown > 0 && `(${p.cooldown}s)`}
            </div>
          ))}
        </div>
      )}

      {/* Click hint */}
      {phase === 'fight' && (
        <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-lg bg-black/40 text-amber-400/60 text-xs font-body">
          Click enemy to attack • WASD to move
        </div>
      )}

      {/* Countdown */}
      {phase === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <motion.div
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-8xl text-red-400"
            style={{ textShadow: '0 0 40px rgba(220,40,40,0.8)' }}
          >
            {countdown > 0 ? countdown : 'FIGHT!'}
          </motion.div>
        </div>
      )}
    </div>
  );
}
