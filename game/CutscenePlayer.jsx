import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DialogueBox from './DialogueBox';
import SkipButton from './SkipButton';
import { drawAnt, drawRedAnt, drawGreenAnt, drawSeniorWill, drawBigRedAnt } from './AntRenderer';

// Generic cutscene player that accepts a scene config
export default function CutscenePlayer({ scenes, onDone, background = 'underground' }) {
  const canvasRef = useRef(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showDialogue, setShowDialogue] = useState(true);

  const currentScene = scenes[sceneIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame;

    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const w = canvas.width;
      const h = canvas.height;
      const t = Date.now() / 1000;

      // Background
      if (background === 'underground') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#6B4C12');
        grad.addColorStop(1, '#3a2508');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(180,140,80,0.06)';
        for (let i = 0; i < 100; i++) {
          ctx.beginPath();
          ctx.arc((i * 137) % w, (i * 91) % h, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (background === 'cave') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#2a1a0a');
        grad.addColorStop(1, '#1a0f05');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // Stalactites
        for (let i = 0; i < 8; i++) {
          ctx.fillStyle = '#3a2510';
          ctx.beginPath();
          ctx.moveTo(i * w / 8, 0);
          ctx.lineTo(i * w / 8 + 15, 30 + (i % 3) * 15);
          ctx.lineTo(i * w / 8 - 15, 0);
          ctx.fill();
        }
        // Couch
        ctx.fillStyle = '#5a3020';
        ctx.fillRect(w * 0.3, h * 0.55, w * 0.4, h * 0.15);
        ctx.fillStyle = '#6a3828';
        ctx.fillRect(w * 0.28, h * 0.48, w * 0.05, h * 0.22);
        ctx.fillRect(w * 0.67, h * 0.48, w * 0.05, h * 0.22);
      } else if (background === 'bedroom') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#5a4a30');
        grad.addColorStop(1, '#3a2a18');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // Bed
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(w * 0.5, h * 0.45, w * 0.4, h * 0.2);
        ctx.fillStyle = '#a08030';
        ctx.fillRect(w * 0.5, h * 0.42, w * 0.08, h * 0.25);
        // Blanket
        ctx.fillStyle = '#6a5020';
        ctx.fillRect(w * 0.55, h * 0.5, w * 0.3, h * 0.12);
      } else if (background === 'gray_room') {
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#3a3a3a';
        for (let i = 0; i < w; i += 60) {
          ctx.fillRect(i, 0, 1, h);
        }
        for (let i = 0; i < h; i += 60) {
          ctx.fillRect(0, i, w, 1);
        }
      } else if (background === 'throne') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#1a0a0a');
        grad.addColorStop(1, '#2a1515');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // Golden throne
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(w * 0.4, h * 0.3, w * 0.2, h * 0.35);
        ctx.fillStyle = '#B8860B';
        ctx.fillRect(w * 0.42, h * 0.2, w * 0.16, h * 0.15);
        // Gems
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.25, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw characters based on scene
      if (currentScene && currentScene.draw) {
        currentScene.draw(ctx, w, h, t);
      }

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [sceneIndex, background, currentScene]);

  const handleDialogueDone = useCallback(() => {
    if (sceneIndex < scenes.length - 1) {
      setShowDialogue(false);
      setTimeout(() => {
        setSceneIndex(prev => prev + 1);
        setShowDialogue(true);
      }, 300);
    } else {
      onDone();
    }
  }, [sceneIndex, scenes.length, onDone]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <SkipButton onClick={onDone} />
      
      <AnimatePresence>
        {showDialogue && currentScene && (
          <DialogueBox
            speaker={currentScene.speaker}
            text={currentScene.text}
            speakerColor={currentScene.color || '#d4a056'}
            onDone={handleDialogueDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
