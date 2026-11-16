let context;
let master;
let muted = false;
let musicTimer;
let beat = 0;

function audio() {
  if (!context) {
    context = new window.AudioContext();
    master = context.createGain();
    master.gain.value = muted ? 0 : 0.16;
    master.connect(context.destination);
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

function tone(frequency, duration, type = 'sine', volume = 0.14, delay = 0) {
  const ctx = audio();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + delay;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain).connect(master);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playSound(name) {
  try {
    if (name === 'shot') tone(540, 0.075, 'sine', 0.09);
    if (name === 'pulse') {
      tone(180, 0.45, 'sine', 0.2);
      tone(420, 0.3, 'triangle', 0.08, 0.025);
    }
    if (name === 'hit') tone(115, 0.2, 'triangle', 0.16);
    if (name === 'mote') tone(880, 0.13, 'sine', 0.12);
    if (name === 'choice') {
      tone(523, 0.18, 'sine', 0.12);
      tone(659, 0.2, 'sine', 0.12, 0.12);
    }
    if (name === 'win') {
      [392, 523, 659, 784].forEach((note, index) => tone(note, 0.42, 'sine', 0.11, index * 0.14));
    }
    if (name === 'loss') tone(220, 0.65, 'sine', 0.1);
  } catch {
    // Audio is an enhancement; blocked autoplay never interrupts play.
  }
}

function musicBeat() {
  if (!context || context.state !== 'running') return;
  const notes = [196, 293.66, 246.94, 329.63, 220, 293.66, 261.63, 349.23];
  tone(notes[beat % notes.length], 1.15, 'sine', 0.025);
  if (beat % 4 === 2) tone(notes[(beat + 2) % notes.length] * 2, 0.65, 'sine', 0.012, 0.08);
  beat += 1;
}

export function startMusic() {
  try {
    audio();
    if (!musicTimer) {
      musicBeat();
      musicTimer = window.setInterval(musicBeat, 1450);
    }
  } catch {
    // Browsers without Web Audio remain fully playable.
  }
}

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.setTargetAtTime(muted ? 0 : 0.16, context.currentTime, 0.04);
  return muted;
}

export function isMuted() {
  return muted;
}
