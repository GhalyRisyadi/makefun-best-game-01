import { BEST_KEY, FIELD } from './config.js';
import { createRandom } from './random.js';
import { createWorld, chooseUpgrade, startRun, updateWorld } from './world.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { prepareShot } from './shots.js';
import { isMuted, playSound, startMusic, toggleMute } from './audio.js';

const STEP = 1 / 60;
const MAX_FRAME = 0.12;
const canvas = document.getElementById('game');
const status = document.getElementById('status');
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const requestedSeed = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isFinite(requestedSeed) ? requestedSeed >>> 0 : Math.floor(Math.random() * 4294967296);
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
let screen = 'title';
let best = readBest();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function writeBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // The score remains visible for this run when browser storage is unavailable.
  }
}

function announce(message) {
  status.textContent = message;
}

function exposeState() {
  return {
    screen,
    wave: world.state.wave,
    score: world.state.score,
    health: world.state.health,
    light: world.state.light,
    enemyCount: world.state.enemies.length,
    kills: world.state.kills,
    upgrades: [...world.state.upgrades],
    player: { x: world.state.player.x, y: world.state.player.y },
    shots: world.state.shots.length,
    pulseCooldown: world.state.pulseCooldown,
    pendingSpawns: world.state.pendingSpawns,
    inChoice: world.state.inChoice,
    enemies: world.state.enemies.map(({ x, y, type, hp }) => ({ x, y, type, hp })),
  };
}
window.__orchard = Object.freeze({ state: exposeState });

function beginRun() {
  startMusic();
  startRun(world);
  screen = 'play';
  announce('Night one. Walk with WASD, aim with the mouse, hold to fire.');
}

function finishRun(won) {
  screen = won ? 'win' : 'loss';
  if (world.state.score > best) {
    best = world.state.score;
    writeBest(best);
  }
  playSound(won ? 'win' : 'loss');
  announce(`${won ? 'The orchard is restored' : 'The flame rests'}. Score ${world.state.score}. ${world.state.kills} thorns cleared.`);
}

function selectGift(index) {
  if (chooseUpgrade(world, index)) {
    screen = 'play';
    playSound('choice');
    announce(`Night ${world.state.wave}. Your gift is carried into the orchard.`);
  }
}

function selectGiftAt(x, y) {
  if (y < 286 || y > 512 || x < 179 || x > 1101) return -1;
  return Math.min(2, Math.floor((x - 179) / 314));
}

function toggleSound() {
  const muted = toggleMute();
  announce(muted ? 'Sound muted.' : 'Sound on.');
}

function handleInput(input) {
  const pointerPress = input.takePress();
  const pointer = input.aim;
  const muteClick = pointerPress && pointer.y < 76 && pointer.x > FIELD.width - 190;
  if (input.takeMute() || muteClick) toggleSound();

  if (input.takePause()) {
    if (screen === 'play') {
      screen = 'paused';
      announce('Paused. Press P or Escape to return.');
    } else if (screen === 'paused') {
      screen = 'play';
      announce('Back to the orchard.');
    }
  }

  const confirm = input.takeConfirm();
  const index = input.pressedNumber();
  if (screen === 'title' && (confirm || (pointerPress && !muteClick))) beginRun();
  else if ((screen === 'win' || screen === 'loss') && (confirm || (pointerPress && !muteClick))) beginRun();
  else if (screen === 'choice') {
    if (index >= 0) selectGift(index);
    else if (confirm) selectGift(0);
    else if (pointerPress) {
      const selected = selectGiftAt(pointer.x, pointer.y);
      if (selected >= 0) selectGift(selected);
    }
  }

  return input.takePulse();
}

function runShot(name) {
  const shotScreen = prepareShot(world, name);
  if (!shotScreen) return false;
  screen = shotScreen;
  let paints = 0;
  function paint() {
    renderer.draw(world, screen, 0, false);
    paints += 1;
    if (paints < 3) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
  return true;
}

function runGame() {
  const input = createInput(canvas);
  let accumulator = 0;
  let last = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    const elapsed = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    accumulator += elapsed;
    const pulse = handleInput(input);

    while (accumulator >= STEP) {
      if (screen === 'title') world.state.time += STEP;
      else if (screen === 'play') {
        const events = updateWorld(world, STEP, {
          movement: input.movement(),
          aim: input.aim,
          firing: input.isFiring(),
          pulse,
        });
        for (const event of events) {
          if (event === 'shot' || event === 'pulse' || event === 'hit' || event === 'mote') playSound(event);
          if (event === 'choice') {
            screen = 'choice';
            playSound('choice');
            announce(`Night ${world.state.wave} is clear. Choose one gift.`);
          }
          if (event === 'win') finishRun(true);
          if (event === 'loss') finishRun(false);
        }
      } else if (screen === 'choice') {
        world.state.time += STEP;
      }
      accumulator -= STEP;
    }
    renderer.draw(world, screen, best, isMuted(), screen === 'play' ? input.aim : null);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === 'play') {
      screen = 'paused';
      announce('Paused while the orchard was hidden.');
    }
  });
  announce('The Lantern Orchard. Press Enter or click to begin.');
  requestAnimationFrame(frame);
}

if (!runShot(shotName)) runGame();
