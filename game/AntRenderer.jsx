import React from 'react';

export function drawAnt(ctx, x, y, size, color = '#4a2810', facing = 'right', hasMustache = false, hasCrumb = false) {
  const s = size;
  const dir = facing === 'right' ? 1 : -1;
  
  ctx.save();
  ctx.translate(x, y);
  
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.6, s * 0.5, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (6 legs - 3 per side)
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, s * 0.06);
  ctx.lineCap = 'round';
  
  for (let side = -1; side <= 1; side += 2) {
    // Front legs
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, -s * 0.05);
    ctx.lineTo(side * s * 0.35, s * 0.3);
    ctx.lineTo(side * s * 0.4, s * 0.5);
    ctx.stroke();
    
    // Middle legs
    ctx.beginPath();
    ctx.moveTo(0, s * 0.05);
    ctx.lineTo(side * s * 0.4, s * 0.25);
    ctx.lineTo(side * s * 0.45, s * 0.5);
    ctx.stroke();
    
    // Back legs
    ctx.beginPath();
    ctx.moveTo(s * 0.15, s * 0.1);
    ctx.lineTo(side * s * 0.35, s * 0.35);
    ctx.lineTo(side * s * 0.38, s * 0.5);
    ctx.stroke();
  }
  
  // Abdomen (back)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(s * 0.2, 0, s * 0.22, s * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Add 3D shading to abdomen
  const abdGrad = ctx.createRadialGradient(s * 0.15, -s * 0.05, 0, s * 0.2, 0, s * 0.22);
  abdGrad.addColorStop(0, 'rgba(255,255,255,0.2)');
  abdGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.ellipse(s * 0.2, 0, s * 0.22, s * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Thorax (middle)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.15, s * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  
  const thorGrad = ctx.createRadialGradient(-s * 0.03, -s * 0.04, 0, 0, 0, s * 0.15);
  thorGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
  thorGrad.addColorStop(1, 'rgba(0,0,0,0.2)');
  ctx.fillStyle = thorGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.15, s * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(-s * 0.28 * dir, -s * 0.02, s * 0.14, s * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-s * 0.32 * dir, -s * 0.07, s * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-s * 0.33 * dir, -s * 0.07, s * 0.02, 0, Math.PI * 2);
  ctx.fill();
  
  // Antennae
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, s * 0.04);
  ctx.beginPath();
  ctx.moveTo(-s * 0.35 * dir, -s * 0.1);
  ctx.quadraticCurveTo(-s * 0.5 * dir, -s * 0.35, -s * 0.55 * dir, -s * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 0.3 * dir, -s * 0.12);
  ctx.quadraticCurveTo(-s * 0.42 * dir, -s * 0.4, -s * 0.48 * dir, -s * 0.45);
  ctx.stroke();
  
  // Mustache
  if (hasMustache) {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = Math.max(1, s * 0.05);
    ctx.beginPath();
    ctx.moveTo(-s * 0.38 * dir, s * 0.02);
    ctx.quadraticCurveTo(-s * 0.32 * dir, s * 0.08, -s * 0.2 * dir, s * 0.04);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.38 * dir, s * 0.02);
    ctx.quadraticCurveTo(-s * 0.45 * dir, s * 0.1, -s * 0.5 * dir, s * 0.06);
    ctx.stroke();
  }
  
  // Crumb above head
  if (hasCrumb) {
    ctx.fillStyle = '#d4a056';
    ctx.beginPath();
    ctx.ellipse(-s * 0.28 * dir, -s * 0.35, s * 0.1, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c4903a';
    ctx.beginPath();
    ctx.ellipse(-s * 0.25 * dir, -s * 0.33, s * 0.04, s * 0.03, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

export function drawRedAnt(ctx, x, y, size, facing = 'right', hasCrumb = false) {
  drawAnt(ctx, x, y, size, '#cc2222', facing, false, hasCrumb);
}

export function drawGreenAnt(ctx, x, y, size, facing = 'right') {
  drawAnt(ctx, x, y, size, '#228B22', facing, false, false);
}

export function drawBigRedAnt(ctx, x, y, size, facing = 'right') {
  drawAnt(ctx, x, y, size, '#8B0000', facing, true, false);
}

export function drawSeniorWill(ctx, x, y, size) {
  drawAnt(ctx, x, y, size, '#6B4226', 'right', true, false);
}
