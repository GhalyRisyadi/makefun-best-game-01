import { FIELD } from './config.js';

const HELD_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']);

export function createInput(canvas) {
  const keys = new Set();
  const pointer = { x: FIELD.width / 2, y: FIELD.height / 2, down: false, pressed: false, pulse: false };

  function locate(event) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / FIELD.width, rect.height / FIELD.height);
    const offsetX = (rect.width - FIELD.width * scale) / 2;
    const offsetY = (rect.height - FIELD.height * scale) / 2;
    pointer.x = (event.clientX - rect.left - offsetX) / scale;
    pointer.y = (event.clientY - rect.top - offsetY) / scale;
  }

  window.addEventListener('keydown', (event) => {
    if (HELD_KEYS.has(event.code) || event.code === 'Space') event.preventDefault();
    if (!event.repeat) keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('blur', () => keys.clear());
  canvas.addEventListener('pointermove', locate);
  canvas.addEventListener('pointerdown', (event) => {
    locate(event);
    canvas.setPointerCapture(event.pointerId);
    if (event.button === 2) pointer.pulse = true;
    else {
      pointer.down = true;
      pointer.pressed = true;
    }
  });
  canvas.addEventListener('pointerup', (event) => {
    if (event.button !== 2) pointer.down = false;
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  return {
    movement() {
      return {
        x: Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')),
        y: Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp')),
      };
    },
    aim: pointer,
    isFiring: () => pointer.down,
    takePress: () => {
      const pressed = pointer.pressed;
      pointer.pressed = false;
      return pressed;
    },
    takePulse: () => {
      const pulse = pointer.pulse || keys.has('Space') || keys.has('ShiftLeft') || keys.has('ShiftRight');
      pointer.pulse = false;
      if (keys.has('Space')) keys.delete('Space');
      if (keys.has('ShiftLeft')) keys.delete('ShiftLeft');
      if (keys.has('ShiftRight')) keys.delete('ShiftRight');
      return pulse;
    },
    takeConfirm: () => {
      if (!keys.has('Enter')) return false;
      keys.delete('Enter');
      return true;
    },
    takePause: () => {
      if (!keys.has('Escape') && !keys.has('KeyP')) return false;
      keys.delete('Escape');
      keys.delete('KeyP');
      return true;
    },
    takeMute: () => {
      if (!keys.has('KeyM')) return false;
      keys.delete('KeyM');
      return true;
    },
    pressedNumber: () => {
      for (let index = 0; index < 3; index += 1) {
        if (keys.has(`Digit${index + 1}`)) {
          keys.delete(`Digit${index + 1}`);
          return index;
        }
      }
      return -1;
    },
  };
}
