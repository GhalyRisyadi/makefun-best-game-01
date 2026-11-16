import { ARENA, FIELD, PLAYER, UPGRADES } from './config.js';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function initialState() {
  return {
    time: 0,
    wave: 0,
    score: 0,
    kills: 0,
    maxHealth: 5,
    health: 5,
    light: 3,
    maxLight: 5,
    fireRate: PLAYER.fireRate,
    shotPower: 1,
    pulseRadius: 142,
    pulseCooldown: 0,
    pulseFlash: 0,
    hitFlash: 0,
    player: { x: 640, y: 430, invulnerable: 0 },
    shots: [],
    hazards: [],
    enemies: [],
    motes: [],
    sparks: [],
    pendingSpawns: 0,
    spawnTimer: 0,
    fireTimer: 0,
    combo: 0,
    comboTimer: 0,
    choices: [],
    upgrades: [],
    inChoice: false,
    completed: false,
  };
}

function randomBetween(world, low, high) {
  return low + world.random() * (high - low);
}

function addSparks(world, x, y, color, count = 8) {
  const state = world.state;
  for (let index = 0; index < count; index += 1) {
    const angle = world.random() * Math.PI * 2;
    const speed = 35 + world.random() * 170;
    state.sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.25 + world.random() * 0.35,
      maxLife: 0.6,
      color,
      size: 2 + world.random() * 3,
    });
  }
}

function spawnEnemy(world, type) {
  const state = world.state;
  const side = Math.floor(world.random() * 4);
  const position = [
    { x: randomBetween(world, ARENA.left, ARENA.right), y: ARENA.top - 18 },
    { x: ARENA.right + 18, y: randomBetween(world, ARENA.top, ARENA.bottom) },
    { x: randomBetween(world, ARENA.left, ARENA.right), y: ARENA.bottom + 18 },
    { x: ARENA.left - 18, y: randomBetween(world, ARENA.top, ARENA.bottom) },
  ][side];
  const stats = {
    wisp: { hp: 2, radius: 16, speed: 73, color: '#ff829d', value: 110 },
    bramble: { hp: 4, radius: 21, speed: 43, color: '#c897ff', value: 180 },
    moth: { hp: 3, radius: 18, speed: 55, color: '#ffc978', value: 150 },
    guardian: { hp: 38, radius: 52, speed: 0, color: '#ff829d', value: 1800 },
  }[type];
  state.enemies.push({
    ...position,
    type,
    ...stats,
    maxHp: stats.hp,
    age: 0,
    cooldown: type === 'moth' ? 1.4 : 0,
    charging: false,
    chargeTime: 0,
    angle: randomBetween(world, 0, Math.PI * 2),
  });
}

function startWave(world, wave) {
  const state = world.state;
  state.wave = wave;
  state.inChoice = false;
  state.choices = [];
  state.player.x = FIELD.width / 2;
  state.player.y = ARENA.bottom - 72;
  state.pendingSpawns = wave === 4 ? 4 : 4 + wave * 2;
  state.spawnTimer = 0.35;
  if (wave === 4) {
    spawnEnemy(world, 'guardian');
    state.pendingSpawns -= 1;
    state.spawnTimer = 2.2;
  }
}

export function createWorld(random) {
  return { random, state: initialState() };
}

export function startRun(world) {
  world.state = initialState();
  startWave(world, 1);
}

export function setWaveForShot(world, wave) {
  startRun(world);
  for (let number = 2; number <= wave; number += 1) {
    world.state.upgrades.push(UPGRADES[(number + 1) % UPGRADES.length].id);
    startWave(world, number);
  }
}

export function chooseUpgrade(world, index) {
  const state = world.state;
  const upgrade = state.choices[index];
  if (!upgrade || !state.inChoice) return false;
  state.upgrades.push(upgrade.id);
  if (upgrade.id === 'wick') state.fireRate *= 0.72;
  if (upgrade.id === 'wide') state.pulseRadius *= 1.35;
  if (upgrade.id === 'heart') {
    state.maxHealth += 1;
    state.health = Math.min(state.maxHealth, state.health + 2);
  }
  if (upgrade.id === 'bright') state.shotPower += 1;
  if (upgrade.id === 'pockets') {
    state.maxLight = Math.min(9, state.maxLight + 1);
    state.light = Math.min(state.maxLight, state.light + 2);
    state.score = Math.round(state.score * 1.2);
  }
  startWave(world, state.wave + 1);
  return true;
}

function defeatEnemy(world, enemy) {
  const state = world.state;
  state.kills += 1;
  state.combo = Math.min(99, state.combo + 1);
  state.comboTimer = 3.2;
  state.score += enemy.value + Math.max(0, state.combo - 1) * 12;
  addSparks(world, enemy.x, enemy.y, enemy.color, enemy.type === 'guardian' ? 28 : 10);
  if (enemy.type === 'guardian') {
    state.completed = true;
    return;
  }
  state.motes.push({
    x: enemy.x,
    y: enemy.y,
    age: 0,
    phase: world.random() * Math.PI * 2,
    value: 1,
  });
}

function fireAt(world, aim) {
  const state = world.state;
  const player = state.player;
  const angle = Math.atan2(aim.y - player.y, aim.x - player.x);
  state.shots.push({
    x: player.x + Math.cos(angle) * 21,
    y: player.y + Math.sin(angle) * 21,
    vx: Math.cos(angle) * 650,
    vy: Math.sin(angle) * 650,
    life: 1.25,
    damage: state.shotPower,
    color: '#fff2bf',
  });
}

function pulse(world) {
  const state = world.state;
  if (!state.light || state.pulseCooldown > 0) return false;
  state.light -= 1;
  state.pulseCooldown = 5.2;
  state.pulseFlash = 0.46;
  state.hitFlash = Math.max(state.hitFlash, 0.12);
  for (const enemy of state.enemies) {
    if (distance(state.player, enemy) < state.pulseRadius + enemy.radius) {
      enemy.hp -= 3;
      if (enemy.type === 'bramble') enemy.chargeTime = 0;
      if (enemy.hp <= 0) defeatEnemy(world, enemy);
    }
  }
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
  addSparks(world, state.player.x, state.player.y, '#8ffff0', 26);
  return true;
}

function shootGuardian(enemy, state) {
  const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
  for (const offset of [-0.24, 0, 0.24]) {
    const direction = angle + offset;
    state.hazards.push({
      x: enemy.x + Math.cos(direction) * (enemy.radius * 0.72),
      y: enemy.y + Math.sin(direction) * (enemy.radius * 0.72),
      vx: Math.cos(direction) * 188,
      vy: Math.sin(direction) * 188,
      life: 5,
      radius: 8,
      color: '#ff92b0',
    });
  }
}

function moveEnemy(enemy, state, dt) {
  enemy.age += dt;
  enemy.cooldown -= dt;
  if (enemy.type === 'guardian') {
    enemy.x = FIELD.width / 2 + Math.sin(enemy.age * 0.58) * 230;
    enemy.y = ARENA.top + 88 + Math.sin(enemy.age * 0.95) * 26;
    if (enemy.cooldown <= 0) {
      shootGuardian(enemy, state);
      enemy.cooldown = 1.55;
    }
    return;
  }
  const dx = state.player.x - enemy.x;
  const dy = state.player.y - enemy.y;
  const range = Math.hypot(dx, dy) || 1;
  if (enemy.type === 'bramble') {
    if (enemy.chargeTime > 0) {
      enemy.chargeTime -= dt;
      enemy.x += Math.cos(enemy.angle) * 240 * dt;
      enemy.y += Math.sin(enemy.angle) * 240 * dt;
      if (enemy.chargeTime <= 0) enemy.cooldown = 1.35;
    } else if (enemy.cooldown <= 0 && range < 310) {
      enemy.angle = Math.atan2(dy, dx);
      enemy.chargeTime = 0.65;
    } else {
      enemy.x += (dx / range) * enemy.speed * dt;
      enemy.y += (dy / range) * enemy.speed * dt;
    }
    return;
  }
  if (enemy.type === 'moth') {
    const tangent = Math.atan2(dy, dx) + Math.PI / 2;
    const radialSpeed = range > 220 ? 35 : range < 155 ? -28 : 0;
    enemy.x += (dx / range * radialSpeed + Math.cos(tangent) * 48) * dt;
    enemy.y += (dy / range * radialSpeed + Math.sin(tangent) * 48) * dt;
    if (enemy.cooldown <= 0) {
      const direction = Math.atan2(dy, dx);
      state.hazards.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(direction) * 160,
        vy: Math.sin(direction) * 160,
        life: 5,
        radius: 7,
        color: '#ffd594',
      });
      enemy.cooldown = 2.6;
    }
    return;
  }
  enemy.x += (dx / range) * enemy.speed * dt;
  enemy.y += (dy / range) * enemy.speed * dt;
}

function nextChoices(world) {
  const choices = [...UPGRADES];
  for (let index = choices.length - 1; index > 0; index -= 1) {
    const other = Math.floor(world.random() * (index + 1));
    [choices[index], choices[other]] = [choices[other], choices[index]];
  }
  return choices.slice(0, 3);
}

export function updateWorld(world, dt, controls) {
  const state = world.state;
  const events = [];
  state.time += dt;
  state.pulseCooldown = Math.max(0, state.pulseCooldown - dt);
  state.pulseFlash = Math.max(0, state.pulseFlash - dt);
  state.hitFlash = Math.max(0, state.hitFlash - dt);
  state.player.invulnerable = Math.max(0, state.player.invulnerable - dt);
  state.fireTimer = Math.max(0, state.fireTimer - dt);
  state.comboTimer = Math.max(0, state.comboTimer - dt);
  if (state.comboTimer === 0) state.combo = 0;

  if (controls.pulse && pulse(world)) events.push('pulse');
  const moveLength = Math.hypot(controls.movement.x, controls.movement.y) || 1;
  state.player.x = clamp(state.player.x + controls.movement.x / moveLength * PLAYER.speed * dt, ARENA.left + 18, ARENA.right - 18);
  state.player.y = clamp(state.player.y + controls.movement.y / moveLength * PLAYER.speed * dt, ARENA.top + 23, ARENA.bottom - 18);
  if (controls.firing && state.fireTimer <= 0) {
    fireAt(world, controls.aim);
    state.fireTimer = state.fireRate;
    events.push('shot');
  }

  state.spawnTimer -= dt;
  if (state.pendingSpawns > 0 && state.spawnTimer <= 0) {
    const type = state.wave === 1 ? 'wisp'
      : state.wave === 2 ? (world.random() < 0.68 ? 'wisp' : 'bramble')
        : state.wave === 3 ? (world.random() < 0.46 ? 'moth' : 'bramble')
          : ['wisp', 'bramble', 'moth'][(state.pendingSpawns + state.wave) % 3];
    spawnEnemy(world, type);
    state.pendingSpawns -= 1;
    state.spawnTimer = state.wave === 4 ? 1.25 : Math.max(0.7, 1.65 - state.wave * 0.16);
  }

  for (const enemy of state.enemies) moveEnemy(enemy, state, dt);
  for (const shot of state.shots) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.life -= dt;
    const target = state.enemies.find((enemy) => enemy.hp > 0 && distance(shot, enemy) < enemy.radius + 6);
    if (target) {
      target.hp -= shot.damage;
      shot.life = 0;
      addSparks(world, shot.x, shot.y, target.color, 4);
      if (target.hp <= 0) defeatEnemy(world, target);
    }
  }
  state.shots = state.shots.filter((shot) => shot.life > 0);
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);

  for (const hazard of state.hazards) {
    hazard.x += hazard.vx * dt;
    hazard.y += hazard.vy * dt;
    hazard.life -= dt;
    if (distance(hazard, state.player) < hazard.radius + PLAYER.radius && state.player.invulnerable <= 0) {
      state.health -= 1;
      state.player.invulnerable = 1.05;
      state.hitFlash = 0.26;
      hazard.life = 0;
      events.push('hit');
    }
  }
  state.hazards = state.hazards.filter((hazard) => hazard.life > 0);

  for (const enemy of state.enemies) {
    if (distance(enemy, state.player) < enemy.radius + PLAYER.radius - 3 && state.player.invulnerable <= 0) {
      state.health -= 1;
      state.player.invulnerable = 1.1;
      state.hitFlash = 0.3;
      enemy.hp -= 1;
      events.push('hit');
      if (enemy.hp <= 0) defeatEnemy(world, enemy);
      break;
    }
  }
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);

  for (const mote of state.motes) {
    mote.age += dt;
    if (distance(mote, state.player) < 34) {
      mote.collected = true;
      state.light = Math.min(state.maxLight, state.light + mote.value);
      state.score += 45;
      events.push('mote');
    }
  }
  state.motes = state.motes.filter((mote) => !mote.collected);

  for (const spark of state.sparks) {
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vx *= 0.95;
    spark.vy *= 0.95;
    spark.life -= dt;
  }
  state.sparks = state.sparks.filter((spark) => spark.life > 0);

  if (state.health <= 0) return [...events, 'loss'];
  if (!state.inChoice && state.pendingSpawns === 0 && state.enemies.length === 0) {
    if (state.wave === 4 || state.completed) {
      state.completed = true;
      return [...events, 'win'];
    }
    state.inChoice = true;
    state.choices = nextChoices(world);
    return [...events, 'choice'];
  }
  return events;
}
