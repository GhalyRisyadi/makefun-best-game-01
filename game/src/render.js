import { FIELD, PALETTE } from './config.js';

const TAU = Math.PI * 2;

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function label(ctx, value, x, y, size, color, weight = 600, align = 'left', family = 'sans-serif') {
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function panel(ctx, x, y, width, height, fill = 'rgba(7,19,29,.82)', stroke = 'rgba(196,255,225,.15)') {
  roundedRect(ctx, x, y, width, height, 16);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function drawBackground(ctx, time) {
  const sky = ctx.createLinearGradient(0, 0, 0, FIELD.height);
  sky.addColorStop(0, '#0a1a28');
  sky.addColorStop(0.52, '#102a35');
  sky.addColorStop(1, '#07151c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);

  for (let index = 0; index < 94; index += 1) {
    const x = (index * 197 + 83) % FIELD.width;
    const y = (index * 113 + 27) % 310;
    const pulse = 0.28 + (Math.sin(time * 0.7 + index * 2.3) + 1) * 0.22;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = index % 8 === 0 ? '#ffc978' : '#c4ffe1';
    ctx.beginPath();
    ctx.arc(x, y, index % 8 === 0 ? 1.8 : 1, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const moonGlow = ctx.createRadialGradient(946, 130, 9, 946, 130, 310);
  moonGlow.addColorStop(0, 'rgba(255,201,120,.2)');
  moonGlow.addColorStop(0.35, 'rgba(255,201,120,.075)');
  moonGlow.addColorStop(1, 'rgba(255,201,120,0)');
  ctx.fillStyle = moonGlow;
  ctx.fillRect(620, -180, 650, 560);
  ctx.fillStyle = '#f6dcb1';
  ctx.globalAlpha = 0.78;
  ctx.beginPath();
  ctx.arc(946, 130, 48, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#8b7666';
  [[930, 113, 8], [963, 142, 5], [952, 104, 3]].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  const ground = ctx.createRadialGradient(640, 450, 70, 640, 450, 720);
  ground.addColorStop(0, '#183a3b');
  ground.addColorStop(0.62, '#102c34');
  ground.addColorStop(1, '#091921');
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.ellipse(640, 449, 674, 433, 0, 0, TAU);
  ctx.fill();

  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(112,202,165,.13)';
  ctx.lineWidth = 48;
  ctx.beginPath();
  ctx.moveTo(360, 720);
  ctx.bezierCurveTo(520, 610, 366, 410, 550, 316);
  ctx.bezierCurveTo(742, 214, 690, 96, 814, 44);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(13,31,34,.45)';
  ctx.lineWidth = 34;
  ctx.stroke();
  ctx.restore();

  for (let index = 0; index < 18; index += 1) {
    const x = 96 + (index * 223) % 1080;
    const y = 206 + (index * 173) % 466;
    const size = 9 + (index * 7) % 17;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(index * 0.91);
    ctx.fillStyle = index % 3 === 0 ? 'rgba(255,130,157,.25)' : 'rgba(73,224,189,.2)';
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(size * 0.7, -size * 0.2, 0, size);
    ctx.quadraticCurveTo(-size * 0.7, -size * 0.2, 0, -size);
    ctx.fill();
    ctx.restore();
  }

  drawTreeLine(ctx, time);
  const shade = ctx.createRadialGradient(640, 365, 240, 640, 365, 770);
  shade.addColorStop(0.45, 'rgba(2,10,16,0)');
  shade.addColorStop(1, 'rgba(2,10,16,.68)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
}

function drawTreeLine(ctx, time) {
  for (let index = 0; index < 13; index += 1) {
    const side = index % 2 === 0 ? 0 : FIELD.width;
    const y = 62 + Math.floor(index / 2) * 102 + (index % 3) * 15;
    const direction = side === 0 ? 1 : -1;
    const size = 0.76 + (index % 4) * 0.12;
    ctx.save();
    ctx.translate(side, y);
    ctx.scale(direction * size, size);
    ctx.lineCap = 'round';
    ctx.shadowColor = '#ff829d';
    ctx.shadowBlur = 13;
    ctx.strokeStyle = 'rgba(101,83,115,.78)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-2, 64);
    ctx.lineTo(7, 7);
    ctx.lineTo(40, -26);
    ctx.moveTo(9, 11);
    ctx.lineTo(-22, -9);
    ctx.moveTo(23, -10);
    ctx.lineTo(20, -40);
    ctx.moveTo(1, 27);
    ctx.lineTo(43, 3);
    ctx.stroke();
    for (let petal = 0; petal < 7; petal += 1) {
      const px = ((petal * 43 + index * 19) % 74) - 25;
      const py = ((petal * 31 + index * 11) % 76) - 43;
      ctx.globalAlpha = 0.36 + (Math.sin(time + index + petal) + 1) * 0.18;
      ctx.fillStyle = petal % 3 === 0 ? '#ffc978' : '#ff829d';
      ctx.beginPath();
      ctx.ellipse(px, py, 4.5, 2.6, petal * 0.9, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawLantern(ctx, x, y, time, angle = -Math.PI / 2, scale = 1, isGhost = false) {
  ctx.save();
  ctx.translate(x, y + Math.sin(time * 2.1) * 2);
  ctx.rotate(angle + Math.PI / 2);
  ctx.scale(scale, scale);
  ctx.globalAlpha = isGhost ? 0.83 : 1;
  const glow = ctx.createRadialGradient(0, -5, 2, 0, -5, 59);
  glow.addColorStop(0, 'rgba(255,225,164,.75)');
  glow.addColorStop(0.2, 'rgba(255,201,120,.25)');
  glow.addColorStop(1, 'rgba(255,201,120,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 59, 0, TAU);
  ctx.fill();
  ctx.shadowColor = '#ffc978';
  ctx.shadowBlur = 19;
  ctx.fillStyle = '#ffd799';
  roundedRect(ctx, -8, -15, 16, 22, 6);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#f8ead2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -11, 6, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = '#2c3d3b';
  roundedRect(ctx, -11, -1, 22, 19, 7);
  ctx.fill();
  ctx.fillStyle = '#ffe8aa';
  ctx.beginPath();
  ctx.ellipse(0, 7, 5.2, 7.5, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,245,219,.75)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-10, -1);
  ctx.lineTo(-14, 14);
  ctx.lineTo(14, 14);
  ctx.lineTo(10, -1);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawWisp(ctx, enemy, time) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y + Math.sin(time * 4 + enemy.x) * 3);
  ctx.rotate(time * 0.8);
  ctx.shadowColor = enemy.color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#432839';
  ctx.beginPath();
  for (let index = 0; index < 10; index += 1) {
    const angle = index * TAU / 10;
    const radius = index % 2 === 0 ? enemy.radius : enemy.radius * 0.68;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = enemy.color;
  ctx.beginPath();
  ctx.arc(-5, -2, 2.4, 0, TAU);
  ctx.arc(5, -2, 2.4, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawBramble(ctx, enemy, time) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.rotate(Math.sin(time * 1.7 + enemy.x) * 0.08);
  ctx.shadowColor = enemy.color;
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#342941';
  ctx.strokeStyle = enemy.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let index = 0; index < 12; index += 1) {
    const angle = index * TAU / 12;
    const radius = index % 2 === 0 ? enemy.radius : enemy.radius * 0.58;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#f3e7ff';
  ctx.fillRect(-6, -3, 4, 6);
  ctx.fillRect(3, -3, 4, 6);
  if (enemy.chargeTime > 0) {
    ctx.strokeStyle = 'rgba(255,130,157,.75)';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(enemy.angle) * 88, Math.sin(enemy.angle) * 88);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawMoth(ctx, enemy, time) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  const flap = Math.sin(time * 12 + enemy.y) * 5;
  ctx.shadowColor = '#ffc978';
  ctx.shadowBlur = 16;
  ctx.fillStyle = 'rgba(255,201,120,.68)';
  ctx.beginPath();
  ctx.ellipse(-11, -4, 11, 17 + flap, -0.5, 0, TAU);
  ctx.ellipse(11, -4, 11, 17 - flap, 0.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#4d3445';
  ctx.beginPath();
  ctx.ellipse(0, 2, 6, 11, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#fff2bf';
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawGuardian(ctx, enemy, time) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.rotate(time * 0.16);
  ctx.shadowColor = '#ff829d';
  ctx.shadowBlur = 30;
  ctx.strokeStyle = 'rgba(255,130,157,.84)';
  ctx.lineWidth = 3;
  for (let ring = 0; ring < 3; ring += 1) {
    ctx.beginPath();
    ctx.ellipse(0, 0, enemy.radius + ring * 9, enemy.radius * 0.72 + ring * 9, ring * 0.8, 0, TAU);
    ctx.stroke();
  }
  ctx.fillStyle = '#301e36';
  ctx.beginPath();
  ctx.arc(0, 0, enemy.radius * 0.68, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffb2b9';
  ctx.beginPath();
  ctx.arc(-13, -3, 5, 0, TAU);
  ctx.arc(13, -3, 5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#fff0d6';
  ctx.beginPath();
  ctx.arc(0, 17, 7 + Math.sin(time * 5) * 2, 0, TAU);
  ctx.fill();
  ctx.restore();

  const barWidth = 120;
  roundedRect(ctx, enemy.x - barWidth / 2, enemy.y - enemy.radius - 24, barWidth, 6, 3);
  ctx.fillStyle = 'rgba(7,19,29,.8)';
  ctx.fill();
  roundedRect(ctx, enemy.x - barWidth / 2, enemy.y - enemy.radius - 24, barWidth * Math.max(0, enemy.hp / enemy.maxHp), 6, 3);
  ctx.fillStyle = '#ff829d';
  ctx.fill();
}

function drawEnemy(ctx, enemy, time) {
  if (enemy.type === 'guardian') drawGuardian(ctx, enemy, time);
  else if (enemy.type === 'bramble') drawBramble(ctx, enemy, time);
  else if (enemy.type === 'moth') drawMoth(ctx, enemy, time);
  else drawWisp(ctx, enemy, time);
}

function drawWorld(ctx, world, time) {
  const state = world.state;
  if (state.pulseFlash > 0) {
    const progress = 1 - state.pulseFlash / 0.46;
    ctx.save();
    ctx.globalAlpha = (1 - progress) * 0.82;
    ctx.strokeStyle = '#b9fff0';
    ctx.lineWidth = 4 + (1 - progress) * 7;
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, progress * state.pulseRadius, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  for (const mote of state.motes) {
    const bob = Math.sin(time * 3 + mote.phase) * 4;
    ctx.save();
    ctx.translate(mote.x, mote.y + bob);
    ctx.rotate(time * 1.5 + mote.phase);
    ctx.shadowColor = '#8fe8ff';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#b7f4ff';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, 9);
    ctx.lineTo(-6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  for (const enemy of state.enemies) drawEnemy(ctx, enemy, time);
  for (const hazard of state.hazards) {
    ctx.save();
    ctx.shadowColor = hazard.color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = hazard.color;
    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.radius, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  for (const shot of state.shots) {
    ctx.save();
    ctx.shadowColor = shot.color;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = shot.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(shot.x - shot.vx * 0.025, shot.y - shot.vy * 0.025);
    ctx.lineTo(shot.x, shot.y);
    ctx.stroke();
    ctx.restore();
  }
  for (const spark of state.sparks) {
    ctx.globalAlpha = Math.min(1, spark.life / spark.maxLife);
    ctx.fillStyle = spark.color;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.size, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  drawLantern(ctx, state.player.x, state.player.y, time, -Math.PI / 2, 1, state.player.invulnerable > 0 && Math.floor(time * 18) % 2 === 0);
}

function drawHealth(ctx, state) {
  for (let index = 0; index < state.maxHealth; index += 1) {
    const filled = index < state.health;
    const x = 232 + index * 24;
    ctx.save();
    ctx.translate(x, 47);
    ctx.fillStyle = filled ? '#ff91a9' : 'rgba(255,255,255,.15)';
    ctx.shadowColor = filled ? '#ff829d' : 'transparent';
    ctx.shadowBlur = filled ? 9 : 0;
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.bezierCurveTo(-19, -3, -6, -13, 0, -5);
    ctx.bezierCurveTo(6, -13, 19, -3, 0, 9);
    ctx.fill();
    ctx.restore();
  }
}

function drawHud(ctx, state, best, muted) {
  panel(ctx, 32, 24, 338, 58);
  label(ctx, `NIGHT ${String(state.wave).padStart(2, '0')}`, 55, 53, 14, PALETTE.quiet, 800);
  label(ctx, state.wave === 4 ? 'THE ECLIPSE' : 'RESTORE THE ORCHARD', 55, 70, 10, PALETTE.mint, 700);
  drawHealth(ctx, state);

  panel(ctx, 446, 24, 292, 58);
  label(ctx, 'LANTERN CHARGES', 468, 43, 10, PALETTE.quiet, 700);
  for (let index = 0; index < state.maxLight; index += 1) {
    const x = 473 + index * 22;
    ctx.save();
    ctx.shadowColor = index < state.light ? '#ffc978' : 'transparent';
    ctx.shadowBlur = index < state.light ? 12 : 0;
    ctx.fillStyle = index < state.light ? '#ffc978' : 'rgba(255,255,255,.13)';
    ctx.beginPath();
    ctx.arc(x, 64, 7, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  label(ctx, state.pulseCooldown > 0 ? `PULSE ${state.pulseCooldown.toFixed(1)}s` : 'PULSE READY', 715, 64, 9, state.pulseCooldown > 0 ? PALETTE.quiet : PALETTE.jade, 700, 'right');

  panel(ctx, 924, 24, 324, 58);
  label(ctx, 'ORCHARD SCORE', 948, 43, 10, PALETTE.quiet, 700);
  label(ctx, state.score.toLocaleString(), 948, 64, 19, PALETTE.text, 800);
  label(ctx, `BEST ${best.toLocaleString()}`, 1168, 64, 10, PALETTE.gold, 700, 'right');
  label(ctx, muted ? '♫ OFF  [M]' : '♫ ON  [M]', 1232, 108, 10, PALETTE.quiet, 700, 'right');

  panel(ctx, 279, 664, 722, 34, 'rgba(7,19,29,.75)', 'rgba(196,255,225,.1)');
  label(ctx, 'WASD  WALK', 311, 681, 10, PALETTE.mint, 700);
  label(ctx, 'MOUSE  AIM + HOLD FIRE', 493, 681, 10, PALETTE.mint, 700);
  label(ctx, 'SPACE  LIGHT PULSE', 779, 681, 10, PALETTE.gold, 700);
}

function drawTitle(ctx, world, best, muted) {
  const time = world.state.time;
  drawLantern(ctx, 911, 431, time, -Math.PI / 2, 2.85);
  label(ctx, 'A MOONLIT TALE', 104, 142, 13, PALETTE.jade, 800);
  label(ctx, 'THE LANTERN', 98, 201, 60, PALETTE.text, 700, 'left', 'Georgia, serif');
  label(ctx, 'ORCHARD', 98, 262, 60, PALETTE.gold, 700, 'left', 'Georgia, serif');
  label(ctx, 'A little light can outlast the dark.', 104, 310, 18, '#c6ddd4', 500);
  panel(ctx, 100, 370, 460, 124, 'rgba(7,19,29,.66)', 'rgba(196,255,225,.17)');
  label(ctx, 'THE NIGHT HAS TAKEN ROOT.', 124, 399, 12, PALETTE.rose, 800);
  label(ctx, 'Wander the sleeping rows. Burn back the thorns.', 124, 429, 14, PALETTE.text, 500);
  label(ctx, 'Gather drifting motes. Hold fast through the eclipse.', 124, 454, 14, PALETTE.text, 500);
  roundedRect(ctx, 104, 530, 249, 57, 14);
  ctx.fillStyle = '#49e0bd';
  ctx.shadowColor = 'rgba(73,224,189,.4)';
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;
  label(ctx, 'BEGIN YOUR WALK', 228, 558, 15, '#07212a', 900, 'center');
  label(ctx, 'ENTER  /  CLICK TO BEGIN', 373, 558, 11, PALETTE.quiet, 700);
  panel(ctx, 731, 562, 365, 78, 'rgba(7,19,29,.65)', 'rgba(255,201,120,.2)');
  label(ctx, 'WASD WALK     MOUSE AIM + HOLD FIRE', 914, 588, 12, PALETTE.mint, 700, 'center');
  label(ctx, 'SPACE / SHIFT RELEASES A LIGHT PULSE', 914, 614, 11, PALETTE.gold, 700, 'center');
  label(ctx, 'A QUIET NIGHT  ·  A BRAVE LITTLE FLAME', 640, 688, 10, 'rgba(217,243,229,.48)', 700, 'center');
  if (best > 0) label(ctx, `YOUR BEST  ${best.toLocaleString()}`, 106, 627, 11, PALETTE.gold, 700);
  label(ctx, muted ? '♫ OFF  [M]' : '♫ ON  [M]', 1203, 41, 11, PALETTE.quiet, 700, 'right');
}

function drawChoice(ctx, state) {
  ctx.fillStyle = 'rgba(4,13,20,.62)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  label(ctx, 'BETWEEN THE NIGHTS', 640, 172, 12, PALETTE.jade, 800, 'center');
  label(ctx, 'Choose what the light remembers', 640, 211, 31, PALETTE.text, 700, 'center', 'Georgia, serif');
  label(ctx, 'One gift for the road ahead.', 640, 245, 13, PALETTE.quiet, 500, 'center');
  const width = 294;
  const gap = 20;
  const left = (FIELD.width - width * 3 - gap * 2) / 2;
  state.choices.forEach((choice, index) => {
    const x = left + index * (width + gap);
    panel(ctx, x, 286, width, 226, 'rgba(12,31,39,.96)', `${choice.tint}88`);
    roundedRect(ctx, x + 24, 311, 49, 49, 14);
    ctx.fillStyle = `${choice.tint}22`;
    ctx.fill();
    label(ctx, choice.icon, x + 48, 336, 25, choice.tint, 800, 'center');
    label(ctx, `0${index + 1}`, x + width - 27, 337, 11, PALETTE.quiet, 700, 'right');
    label(ctx, choice.title, x + 25, 389, 15, choice.tint, 800);
    ctx.fillStyle = 'rgba(196,255,225,.11)';
    ctx.fillRect(x + 25, 411, width - 50, 1);
    const words = choice.detail.split(' ');
    let line = '';
    let lineY = 444;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (test.length > 29) {
        label(ctx, line, x + 25, lineY, 12, '#c3d6d1', 500);
        line = word;
        lineY += 20;
      } else line = test;
    }
    label(ctx, line, x + 25, lineY, 12, '#c3d6d1', 500);
    roundedRect(ctx, x + 24, 467, width - 48, 30, 9);
    ctx.fillStyle = `${choice.tint}26`;
    ctx.fill();
    label(ctx, `TAKE THIS GIFT  ·  ${index + 1}`, x + width / 2, 482, 10, choice.tint, 800, 'center');
  });
  label(ctx, `NIGHT ${state.wave} RESTED  ·  ${state.score.toLocaleString()} ORCHARD SCORE`, 640, 554, 11, PALETTE.quiet, 700, 'center');
}

function drawResult(ctx, state, best, won) {
  ctx.fillStyle = 'rgba(3,11,18,.68)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  const color = won ? PALETTE.gold : PALETTE.rose;
  label(ctx, won ? 'THE ORCHARD BREATHES' : 'THE NIGHT GROWS QUIET', 640, 188, 12, color, 800, 'center');
  label(ctx, won ? 'Dawn, at last.' : 'The flame rests.', 640, 239, 45, PALETTE.text, 700, 'center', 'Georgia, serif');
  label(ctx, won ? 'You carried a small light through the longest night.' : 'Even this light will bloom again.', 640, 278, 14, '#bdd3cd', 500, 'center');
  panel(ctx, 384, 325, 512, 132, 'rgba(9,24,32,.94)', `${color}55`);
  label(ctx, 'FINAL ORCHARD SCORE', 640, 356, 11, PALETTE.quiet, 800, 'center');
  label(ctx, state.score.toLocaleString(), 640, 393, 37, color, 800, 'center');
  label(ctx, `${state.kills} THORNS CLEARED     ·     ${state.upgrades.length} GIFTS CARRIED`, 640, 431, 11, PALETTE.text, 700, 'center');
  roundedRect(ctx, 474, 495, 332, 54, 13);
  ctx.fillStyle = color;
  ctx.fill();
  label(ctx, 'WALK THE ORCHARD AGAIN', 640, 522, 13, '#12232a', 900, 'center');
  label(ctx, 'ENTER / CLICK TO RESTART', 640, 582, 11, PALETTE.quiet, 700, 'center');
  label(ctx, `PERSONAL BEST  ${Math.max(best, state.score).toLocaleString()}`, 640, 625, 11, PALETTE.gold, 700, 'center');
}

function drawPause(ctx) {
  ctx.fillStyle = 'rgba(3,11,18,.66)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  panel(ctx, 438, 268, 404, 180, 'rgba(9,24,32,.95)', 'rgba(196,255,225,.28)');
  label(ctx, 'THE ORCHARD IS STILL', 640, 320, 12, PALETTE.jade, 800, 'center');
  label(ctx, 'Take a breath.', 640, 360, 34, PALETTE.text, 700, 'center', 'Georgia, serif');
  label(ctx, 'PRESS P / ESCAPE TO RETURN', 640, 405, 11, PALETTE.quiet, 700, 'center');
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let pixelRatio = 1;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let lastWidth = 0;
  let lastHeight = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(window.innerWidth * ratio));
    const height = Math.max(1, Math.round(window.innerHeight * ratio));
    if (width !== lastWidth || height !== lastHeight) {
      canvas.width = width;
      canvas.height = height;
      lastWidth = width;
      lastHeight = height;
    }
    pixelRatio = ratio;
    scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
    offsetX = (window.innerWidth - FIELD.width * scale) / 2;
    offsetY = (window.innerHeight - FIELD.height * scale) / 2;
  }

  function draw(world, screen, best, muted = false, aim = null) {
    resize();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PALETTE.ink;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(pixelRatio * scale, 0, 0, pixelRatio * scale, pixelRatio * offsetX, pixelRatio * offsetY);

    drawBackground(ctx, world.state.time);
    if (screen === 'title') drawTitle(ctx, world, best, muted);
    else {
      drawWorld(ctx, world, world.state.time);
      drawHud(ctx, world.state, best, muted);
      if (aim && screen === 'play') {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,242,191,.56)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(aim.x, aim.y, 8, 0, TAU);
        ctx.moveTo(aim.x - 13, aim.y);
        ctx.lineTo(aim.x + 13, aim.y);
        ctx.moveTo(aim.x, aim.y - 13);
        ctx.lineTo(aim.x, aim.y + 13);
        ctx.stroke();
        ctx.restore();
      }
      if (screen === 'choice') drawChoice(ctx, world.state);
      if (screen === 'paused') drawPause(ctx);
      if (screen === 'win' || screen === 'loss') drawResult(ctx, world.state, best, screen === 'win');
    }
  }

  return { draw };
}
