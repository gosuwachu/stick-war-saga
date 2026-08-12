import type { Unit } from './types';
import { game, rand } from './config';
import { getCtx, W, H, GROUND_Y, NO_MANS_LAND } from './canvas';

function renderBackground(): void {
  const ctx = getCtx();
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#0d1b2a');
  sky.addColorStop(0.6, '#1b2838');
  sky.addColorStop(1, '#2a3f4a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y);

  const gnd = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gnd.addColorStop(0, '#3a5a3a');
  gnd.addColorStop(0.3, '#2d4a2d');
  gnd.addColorStop(1, '#1a2a1a');
  ctx.fillStyle = gnd;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  ctx.strokeStyle = '#4a7a4a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(W, GROUND_Y);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 10]);
  ctx.beginPath();
  ctx.moveTo(NO_MANS_LAND.x1, 0);
  ctx.lineTo(NO_MANS_LAND.x1, GROUND_Y);
  ctx.moveTo(NO_MANS_LAND.x2, 0);
  ctx.lineTo(NO_MANS_LAND.x2, GROUND_Y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function renderMinerals(): void {
  const ctx = getCtx();
  const veinY = GROUND_Y - 5;

  ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
  ctx.beginPath();
  ctx.ellipse(W * 0.08, veinY, 40, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
  for (let i = 0; i < 4; i++) {
    const gx = W * 0.06 + i * 14;
    const gy = veinY + rand(-2, 2);
    ctx.beginPath();
    ctx.arc(gx, gy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
  ctx.beginPath();
  ctx.ellipse(W * 0.92, veinY, 40, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
  for (let i = 0; i < 4; i++) {
    const gx = W * 0.90 + i * 14;
    const gy = veinY + rand(-2, 2);
    ctx.beginPath();
    ctx.arc(gx, gy, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawUnit(u: Unit): void {
  const ctx = getCtx();
  if (u.state === 'dead') return;

  const s = u.scale;
  const x = u.x;
  const y = u.y;
  const teamColor = u.team === 'player' ? '#66bb6a' : '#ef5350';
  const bodyColor: string = ({
    Miner: '#8B7355', Swordsman: '#78909C', Archer: '#66BB6A',
    Spearman: '#AB47BC', Knight: '#FFA726', Mage: '#42A5F5',
    Giant: '#8D6E63', Healer: '#ef5350'
  } as Record<string, string>)[u.type] || '#aaa';

  const alpha = u.state === 'dying' ? 1 - u.deathTimer / 0.6 : 1;
  ctx.globalAlpha = alpha;

  const bobY = u.state === 'idle' ? Math.sin(u.animTime * 3 + u.wanderPhase) * 1.5 : 0;
  const baseY = y + bobY;

  const dyingRot = u.state === 'dying' ? u.deathTimer * 3 : 0;

  ctx.save();
  ctx.translate(x, baseY);
  if (dyingRot) ctx.rotate(dyingRot);

  const bodyLen = 14 * s;

  ctx.fillStyle = teamColor;
  ctx.strokeStyle = teamColor;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.arc(0, -bodyLen - 4 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (u.type === 'Knight') {
    ctx.fillStyle = '#B0BEC5';
    ctx.beginPath();
    ctx.moveTo(-5 * s, -bodyLen - 2 * s);
    ctx.lineTo(0, -bodyLen - 12 * s);
    ctx.lineTo(5 * s, -bodyLen - 2 * s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#90A4AE';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  ctx.moveTo(0, -bodyLen);
  ctx.lineTo(0, -2 * s);
  ctx.stroke();

  const legSwing = u.state === 'marching' ? Math.sin(u.animTime * 8) * 6 * s : 0;
  ctx.strokeStyle = teamColor;
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(0, -2 * s);
  ctx.lineTo(-5 * s + legSwing, 6 * s);
  ctx.moveTo(0, -2 * s);
  ctx.lineTo(5 * s - legSwing, 6 * s);
  ctx.stroke();

  const atk = u.attackAnim;
  const armSwing = u.state === 'marching' ? Math.sin(u.animTime * 8) * 3 * s : 0;
  ctx.lineWidth = 2 * s;

  if (u.type === 'Miner') {
    const pickSwing = Math.sin(u.animTime * 4) * 0.3 + 0.5;
    ctx.strokeStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(0, -bodyLen * 0.6);
    ctx.lineTo(-8 * s, -bodyLen * 0.3 + pickSwing * 3 * s);
    ctx.stroke();
    ctx.fillStyle = '#78909C';
    ctx.beginPath();
    ctx.arc(-9 * s, -bodyLen * 0.3 + pickSwing * 3 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (u.type === 'Swordsman' || u.type === 'Knight') {
    const swordAngle = atk > 0 ? -0.8 - atk * 1.5 : -0.3;
    ctx.strokeStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(0, -bodyLen * 0.6);
    const armEndX = Math.cos(swordAngle) * 10 * s;
    const armEndY = -bodyLen * 0.6 + Math.sin(swordAngle) * 10 * s;
    ctx.lineTo(armEndX, armEndY);
    ctx.stroke();
    ctx.strokeStyle = '#ECEFF1';
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(armEndX, armEndY);
    ctx.lineTo(armEndX + Math.cos(swordAngle - 0.3) * 10 * s, armEndY + Math.sin(swordAngle - 0.3) * 10 * s);
    ctx.stroke();
    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(armEndX, armEndY);
    ctx.lineTo(armEndX + Math.cos(swordAngle + 0.3) * 4 * s, armEndY + Math.sin(swordAngle + 0.3) * 4 * s);
    ctx.stroke();
  } else if (u.type === 'Archer') {
    ctx.strokeStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(0, -bodyLen * 0.6);
    ctx.lineTo(8 * s, -bodyLen * 0.5);
    ctx.stroke();
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.arc(8 * s, -bodyLen * 0.3, 7 * s, -Math.PI * 0.6, Math.PI * 0.6);
    ctx.stroke();
    ctx.strokeStyle = '#CFD8DC';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8 * s - 7 * s * Math.cos(Math.PI*0.6), -bodyLen * 0.3 + 7 * s * Math.sin(Math.PI*0.6));
    ctx.lineTo(8 * s - 7 * s * Math.cos(-Math.PI*0.6), -bodyLen * 0.3 + 7 * s * Math.sin(-Math.PI*0.6));
    ctx.stroke();
    const pull = atk > 0 ? 2 * s : 0;
    ctx.strokeStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(0, -bodyLen * 0.6);
    ctx.lineTo(8 * s - 3 * s - pull, -bodyLen * 0.5 - 2 * s);
    ctx.stroke();
  } else if (u.type === 'Spearman') {
    const spearTilt = atk > 0 ? -0.3 : 0.2;
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(-6 * s, -bodyLen - 5 * s);
    ctx.lineTo(6 * s, 4 * s);
    ctx.stroke();
    ctx.fillStyle = '#CFD8DC';
    ctx.beginPath();
    ctx.moveTo(-6 * s, -bodyLen - 5 * s);
    ctx.lineTo(-4 * s, -bodyLen - 9 * s);
    ctx.lineTo(-2 * s, -bodyLen - 5 * s);
    ctx.closePath();
    ctx.fill();
  } else if (u.type === 'Mage') {
    ctx.strokeStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(0, -bodyLen * 0.6);
    ctx.lineTo(-7 * s, -bodyLen * 0.2);
    ctx.stroke();
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(-7 * s, -bodyLen - 2 * s);
    ctx.lineTo(-7 * s, 2 * s);
    ctx.stroke();
    const glow = Math.sin(u.animTime * 5) * 0.3 + 0.7;
    ctx.fillStyle = atk > 0 ? `rgba(66, 165, 245, ${glow * 0.5})` : `rgba(66, 165, 245, ${glow * 0.2})`;
    ctx.beginPath();
    ctx.arc(-7 * s, -bodyLen - 2 * s, (3 + glow * 2) * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#42A5F5';
    ctx.beginPath();
    ctx.arc(-7 * s, -bodyLen - 2 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (u.type === 'Giant') {
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 3.5 * s;
    const giantSwing = atk > 0 ? -1.2 : 0.3;
    ctx.beginPath();
    ctx.moveTo(0, -bodyLen * 0.6);
    ctx.lineTo(Math.cos(giantSwing) * 12 * s, -bodyLen * 0.6 + Math.sin(giantSwing) * 12 * s);
    ctx.stroke();
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 3 * s;
    const clubX = Math.cos(giantSwing) * 12 * s + Math.cos(giantSwing - 0.5) * 8 * s;
    const clubY = -bodyLen * 0.6 + Math.sin(giantSwing) * 12 * s + Math.sin(giantSwing - 0.5) * 8 * s;
    ctx.beginPath();
    ctx.moveTo(Math.cos(giantSwing) * 12 * s, -bodyLen * 0.6 + Math.sin(giantSwing) * 12 * s);
    ctx.lineTo(clubX, clubY);
    ctx.stroke();
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.arc(clubX, clubY, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(0, -bodyLen * 0.6);
    ctx.lineTo(-10 * s, -bodyLen * 0.3);
    ctx.stroke();
  } else if (u.type === 'Healer') {
    ctx.strokeStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(0, -bodyLen * 0.6);
    ctx.lineTo(-6 * s, -bodyLen * 0.2);
    ctx.stroke();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(-6 * s, -bodyLen - 2 * s);
    ctx.lineTo(-6 * s, 2 * s);
    ctx.moveTo(-10 * s, -bodyLen * 0.5);
    ctx.lineTo(-2 * s, -bodyLen * 0.5);
    ctx.stroke();
    const hGlow = Math.sin(u.animTime * 3) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 255, 255, ${hGlow * 0.15})`;
    ctx.beginPath();
    ctx.arc(-6 * s, -bodyLen * 0.2, (5 + hGlow * 2) * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  ctx.globalAlpha = 1;

  if (u.state !== 'dying') {
    const barW = 20 * s;
    const barH = 3;
    const barX = x - barW / 2;
    const barY = baseY - bodyLen - 10 * s - 8;
    const hpPct = u.hp / u.maxHp;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    ctx.fillStyle = hpPct > 0.5 ? '#4CAF50' : hpPct > 0.25 ? '#FFC107' : '#F44336';
    ctx.fillRect(barX, barY, barW * hpPct, barH);
  }
}

function renderProjectiles(): void {
  const ctx = getCtx();
  game.projectiles.forEach(p => {
    if (p.type === 'arrow') {
      ctx.strokeStyle = '#8D6E63';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 8, p.y - 2);
      ctx.stroke();
      ctx.fillStyle = '#CFD8DC';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 3, p.y - 4);
      ctx.lineTo(p.x - 3, p.y + 4);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = `rgba(66, 165, 245, ${0.7 + Math.sin(game.time * 10) * 0.2})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 255, 255, 0.4)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function renderParticles(): void {
  const ctx = getCtx();
  game.particles.forEach(p => {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  game.floatingTexts.forEach(f => {
    ctx.globalAlpha = f.life;
    ctx.fillStyle = f.color;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(f.text, f.x, f.y);
  });
  ctx.globalAlpha = 1;
}

export function render(): void {
  const ctx = getCtx();
  ctx.clearRect(0, 0, W, H);
  renderBackground();
  renderMinerals();

  const allUnits = [...game.player.units, ...game.enemy.units];
  allUnits.sort((a, b) => a.y - b.y);
  allUnits.forEach(drawUnit);

  renderProjectiles();
  renderParticles();
}
