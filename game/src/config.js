export const FIELD = { width: 1280, height: 720 };
export const ARENA = { left: 152, right: 1128, top: 166, bottom: 633 };
export const PLAYER = { speed: 305, radius: 15, fireRate: 0.19 };
export const BEST_KEY = 'moonlit-orchard.best';
export const PALETTE = {
  ink: '#07131d',
  deep: '#0d202c',
  ground: '#112c35',
  jade: '#49e0bd',
  mint: '#c4ffe1',
  gold: '#ffc978',
  rose: '#ff829d',
  lavender: '#a69cff',
  text: '#eff9f3',
  quiet: '#8faeaa',
};

export const UPGRADES = [
  { id: 'wick', title: 'QUICKER WICK', icon: '✦', detail: 'Lantern shots fire 28% faster.', tint: '#ffc978' },
  { id: 'wide', title: 'WIDE RADIANCE', icon: '◉', detail: 'Pulse reaches 35% farther.', tint: '#49e0bd' },
  { id: 'heart', title: 'HEARTWOOD', icon: '♥', detail: 'Restore 2 health. Raise max health by 1.', tint: '#ff829d' },
  { id: 'bright', title: 'BRIGHTER FLAME', icon: '✧', detail: 'Shots deal 1 extra damage.', tint: '#a69cff' },
  { id: 'pockets', title: 'POCKET MOTES', icon: '❋', detail: 'Gain 2 light charges and 20% score.', tint: '#8fe8ff' },
];
