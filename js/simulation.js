// ====================================================================
//  ECONOMY
// ====================================================================
function updateEconomy(dt) {
  let pIncome = 0;
  game.player.units.forEach(u => { if (u.isMiner && u.state !== 'dead' && u.state !== 'dying') pIncome += u.income; });
  let eIncome = 0;
  game.enemy.units.forEach(u => { if (u.isMiner && u.state !== 'dead' && u.state !== 'dying') eIncome += u.income; });

  game.player.income = pIncome;
  game.enemy.income = eIncome;

  if (game.phase === 'prep') {
    game.player.gold += pIncome * dt;
    game.enemy.gold += eIncome * dt;
  } else if (game.phase === 'battle') {
    game.player.gold += pIncome * dt * 0.3;
    game.enemy.gold += eIncome * dt * 0.3;
  }

  updateHUD();
}

// ====================================================================
//  UNIT LOGIC
// ====================================================================
function updateUnits(dt) {
  const allUnits = [...game.player.units, ...game.enemy.units];
  allUnits.forEach(u => {
    if (u.state === 'dead') return;
    u.animTime += dt;

    if (u.state === 'dying') {
      u.deathTimer += dt;
      if (u.deathTimer > 0.6) u.state = 'dead';
      return;
    }

    if (u.state === 'idle') {
      if (u.formationX !== undefined) {
        u.x += (u.formationX - u.x) * 0.05;
        u.y += (u.formationY - u.y) * 0.05;
      }
      return;
    }

    if (u.state === 'marching' || u.state === 'attacking') {
      const enemies = allUnits.filter(o =>
        o.team !== u.team && o.state !== 'dead' && o.state !== 'dying'
      );

      if (u.isHealer) {
        const friendlies = allUnits.filter(o =>
          o.team === u.team && o.state !== 'dead' && o.state !== 'dying' && o.hp < o.maxHp && o !== u
        );
        if (friendlies.length > 0) {
          const closest = friendlies.reduce((a, b) => dist(u, a) < dist(u, b) ? a : b);
          u.target = closest;
        } else {
          u.target = null;
        }
      } else {
        u.target = enemies.length > 0 ? enemies.reduce((a, b) => dist(u, a) < dist(u, b) ? a : b) : null;
      }

      if (u.target) {
        const d = dist(u, u.target);
        if (u.isHealer && d <= u.range && u.target.hp < u.target.maxHp) {
          u.state = 'attacking';
          u.atkTimer -= dt;
          if (u.atkTimer <= 0) {
            u.target.hp = Math.min(u.target.maxHp, u.target.hp + u.healPower);
            u.atkTimer = u.atkCd;
            spawnFloatingText(u.target.x, u.target.y - 15, '+' + u.healPower, '#81c784');
            spawnHealEffect(u.target.x, u.target.y - 10);
          }
        } else if (!u.isHealer && d <= u.range) {
          u.state = 'attacking';
          u.atkTimer -= dt;
          if (u.atkTimer <= 0) {
            u.attackAnim = 1;
            const dmg = u.dmg + rand(-2, 2);
            u.target.hp -= dmg;
            u.atkTimer = u.atkCd;
            u.killCount++;
            spawnFloatingText(u.target.x, u.target.y - 15, '-' + Math.round(dmg), '#ff8a80');
            spawnHitEffect(u.target.x, u.target.y - 10);

            if (u.splash) {
              const splashTargets = enemies.filter(o =>
                o !== u.target && dist(u.target, o) < 50 && o.state !== 'dead' && o.state !== 'dying'
              );
              splashTargets.forEach(o => {
                o.hp -= dmg * 0.5;
                spawnFloatingText(o.x, o.y - 15, '-' + Math.round(dmg*0.5), '#ff8a80');
                spawnHitEffect(o.x, o.y - 10);
              });
            }

            if (u.isRanged) {
              spawnProjectile(u, u.target);
            }

            if (u.target.hp <= 0 && u.target.state !== 'dying') {
              u.target.state = 'dying';
              u.target.deathTimer = 0;
              spawnFloatingText(u.target.x, u.target.y - 25, 'DEAD', '#ccc');
            }
          }
        } else {
          u.state = 'marching';
          const speed = u.speed * (u.isGiant ? 0.8 : 1);
          const dx = (u.target.x - u.x);
          const dy = (u.target.y - u.y - 5);
          const dd = Math.sqrt(dx*dx + dy*dy);
          if (dd > 0) {
            u.x += (dx / dd) * speed * dt;
            u.y += (dy / dd) * speed * dt;
          }
        }
      } else {
        const targetX = u.team === 'player' ? W * 0.78 : W * 0.22;
        u.x += u.dir * u.speed * dt;
        if ((u.team === 'player' && u.x > targetX) || (u.team === 'enemy' && u.x < targetX)) {
          u.x = targetX;
        }
      }
    }

    u.x = clamp(u.x, 5, W - 5);
    u.y = clamp(u.y, GROUND_Y - 50, GROUND_Y);

    if (u.attackAnim > 0) u.attackAnim -= dt * 3;
    if (u.attackAnim < 0) u.attackAnim = 0;
  });
}

// ====================================================================
//  COMBAT END CHECK
// ====================================================================
function checkBattleEnd() {
  const pAlive = game.player.units.filter(u => u.state !== 'dead' && u.state !== 'dying' && !u.isMiner).length;
  const eAlive = game.enemy.units.filter(u => u.state !== 'dead' && u.state !== 'dying' && !u.isMiner).length;
  const pAll = game.player.units.filter(u => u.state !== 'dead' && u.state !== 'dying').length;
  const eAll = game.enemy.units.filter(u => u.state !== 'dead' && u.state !== 'dying').length;

  if (game.phase === 'battle') {
    if (pAll === 0) {
      endBattle('enemy');
      return true;
    }
    if (eAll === 0) {
      endBattle('player');
      return true;
    }
    if (pAlive === 0 && eAlive === 0) {
      if (pAll > 0 && eAll > 0) {
        game.player.units.forEach(u => { if (u.isMiner && u.state !== 'dead') u.state = 'marching'; });
        game.enemy.units.forEach(u => { if (u.isMiner && u.state !== 'dead') u.state = 'marching'; });
      }
    }
  }
  return false;
}

// ====================================================================
//  PROJECTILES
// ====================================================================
function spawnProjectile(source, target) {
  game.projectiles.push({
    x: source.x + source.dir * 10,
    y: source.y - 15,
    targetX: target.x,
    targetY: target.y - 10,
    speed: 300 + rand(0, 50),
    life: 2,
    source,
    type: source.type === 'Mage' ? 'magic' : 'arrow',
  });
}

function updateProjectiles(dt) {
  for (let i = game.projectiles.length - 1; i >= 0; i--) {
    const p = game.projectiles[i];
    const dx = p.targetX - p.x;
    const dy = p.targetY - p.y;
    const d = Math.sqrt(dx*dx + dy*dy);
    if (d < 10 || p.life <= 0) {
      game.projectiles.splice(i, 1);
      continue;
    }
    const move = p.speed * dt;
    if (move >= d) {
      p.x = p.targetX;
      p.y = p.targetY;
      p.life = 0;
    } else {
      p.x += (dx / d) * move;
      p.y += (dy / d) * move;
    }
    p.life -= dt;
  }
}

// ====================================================================
//  EFFECTS
// ====================================================================
function spawnHitEffect(x, y) {
  for (let i = 0; i < 5; i++) {
    game.particles.push({
      x, y,
      vx: rand(-40, 40),
      vy: rand(-60, -10),
      life: rand(0.2, 0.5),
      maxLife: 0.5,
      color: '#ff8a80',
      size: rand(2, 4),
    });
  }
}

function spawnHealEffect(x, y) {
  for (let i = 0; i < 4; i++) {
    game.particles.push({
      x, y,
      vx: rand(-20, 20),
      vy: rand(-40, -20),
      life: rand(0.3, 0.6),
      maxLife: 0.6,
      color: '#81c784',
      size: rand(2, 5),
    });
  }
}

function spawnFloatingText(x, y, text, color) {
  game.floatingTexts.push({ x, y, text, color, life: 1, maxLife: 1 });
}

function updateParticles(dt) {
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const p = game.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 100 * dt;
    p.life -= dt;
    if (p.life <= 0) game.particles.splice(i, 1);
  }
  for (let i = game.floatingTexts.length - 1; i >= 0; i--) {
    const f = game.floatingTexts[i];
    f.y -= 30 * dt;
    f.life -= dt;
    if (f.life <= 0) game.floatingTexts.splice(i, 1);
  }
}
