import { UPGRADES } from './config.js';
import { setWaveForShot, startRun } from './world.js';

function preparePlay(world) {
  setWaveForShot(world, 4);
  const state = world.state;
  state.time = 12.4;
  state.score = 4820;
  state.kills = 24;
  state.health = 4;
  state.maxHealth = 6;
  state.light = 2;
  state.maxLight = 6;
  state.pendingSpawns = 0;
  state.spawnTimer = 30;
  state.player.x = 630;
  state.player.y = 501;
  state.pulseFlash = 0.3;
  state.pulseCooldown = 3.8;
  state.enemies = [
    { type: 'guardian', x: 862, y: 278, hp: 22, maxHp: 38, radius: 52, color: '#ff829d', age: 2.1, cooldown: 0.4 },
    { type: 'moth', x: 430, y: 349, hp: 2, maxHp: 3, radius: 18, color: '#ffc978', age: 1.4, cooldown: 1.2 },
    { type: 'bramble', x: 767, y: 494, hp: 4, maxHp: 4, radius: 21, color: '#c897ff', age: 0.7, cooldown: 0.2, chargeTime: 0.4, angle: -2.7 },
    { type: 'wisp', x: 514, y: 269, hp: 2, maxHp: 2, radius: 16, color: '#ff829d', age: 0.8, cooldown: 0 },
  ];
  state.hazards = [
    { x: 688, y: 411, vx: -51, vy: 172, life: 3, radius: 8, color: '#ff92b0' },
    { x: 947, y: 330, vx: -170, vy: 42, life: 3, radius: 7, color: '#ffd594' },
  ];
  state.shots = [
    { x: 701, y: 442, vx: 471, vy: -449, life: 0.6, damage: 1, color: '#fff2bf' },
    { x: 671, y: 470, vx: 522, vy: -384, life: 0.4, damage: 1, color: '#fff2bf' },
  ];
  state.motes = [
    { x: 579, y: 383, age: 0.3, phase: 0.4, value: 1 },
    { x: 359, y: 539, age: 1.1, phase: 2.2, value: 1 },
  ];
  state.sparks = [
    { x: 790, y: 387, vx: 40, vy: -58, life: 0.5, maxLife: 0.6, color: '#ffc978', size: 3 },
    { x: 782, y: 395, vx: -45, vy: 32, life: 0.4, maxLife: 0.6, color: '#c4ffe1', size: 2.5 },
  ];
}

export function prepareShot(world, name) {
  if (name === 'title') return 'title';
  if (name === 'play') {
    preparePlay(world);
    return 'play';
  }
  if (name === 'choice') {
    startRun(world);
    const state = world.state;
    state.time = 8.2;
    state.wave = 2;
    state.score = 1640;
    state.kills = 11;
    state.health = 4;
    state.maxHealth = 6;
    state.light = 2;
    state.maxLight = 6;
    state.player.x = 1090;
    state.player.y = 596;
    state.inChoice = true;
    state.pendingSpawns = 0;
    state.enemies = [];
    state.choices = [
      UPGRADES.find((upgrade) => upgrade.id === 'wick'),
      UPGRADES.find((upgrade) => upgrade.id === 'wide'),
      UPGRADES.find((upgrade) => upgrade.id === 'heart'),
    ];
    return 'choice';
  }
  if (name === 'win') {
    startRun(world);
    const state = world.state;
    state.time = 38.6;
    state.wave = 4;
    state.score = 9280;
    state.kills = 36;
    state.health = 3;
    state.maxHealth = 6;
    state.light = 1;
    state.maxLight = 6;
    state.player.x = 1090;
    state.player.y = 596;
    state.upgrades = ['wick', 'wide', 'bright'];
    state.enemies = [];
    state.hazards = [];
    state.shots = [];
    state.motes = [];
    state.sparks = [];
    state.pendingSpawns = 0;
    state.completed = true;
    return 'win';
  }
  return null;
}
