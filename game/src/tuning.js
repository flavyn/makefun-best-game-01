// Every number the game balances on, in one file: tuning is a diff here, never a hunt.
// Ember Watch is a night watch on a lighthouse rock; the palette is cold sea and warm fire.

export const ARENA = {
  half: 23,
  coreX: 0,
  coreZ: 0,
  coreRadius: 1.9,
  coreHealth: 100,
};

export const PALETTE = {
  sky: 0x05090f,
  fog: 0x0b1722,
  ground: 0x18242f,
  rock: 0x283742,
  trim: 0xffb24a,
  ember: 0xffc46b,
  hollow: 0xa8bccb,
  eye: 0xdff2ff,
  beacon: 0xffd9a0,
};

export const PLAYER = {
  radius: 0.42,
  eye: 1.62,
  crouchEye: 1.06,
  accel: 46,
  maxSpeed: 5.7,
  crouchSpeed: 2.7,
  friction: 9.5,
  maxHealth: 100,
  hurtFlash: 0.35,
};

export const LANCE = {
  damage: 16,
  crit: 36,
  range: 44,
  heatPerShot: 8,
  heatMax: 100,
  ventPerSecond: 64,
  ventDelay: 0.32,
  spreadStill: 0.0035,
  spreadHeat: 0.021,
  spreadMove: 0.006,
  recoilPitch: 0.011,
  fireInterval: 0.105,
  headRadius: 0.27,
  headHeight: 1.6,
  bodyRadius: 0.46,
  bodyHeight: 0.92,
};

export const FLARE = {
  charges: 3,
  max: 7,
  cooldown: 2.2,
  fuse: 0.65,
  radius: 6.5,
  damage: 48,
  stun: 2.1,
  regen: 22,
};

export const HOLLOWS = {
  crawler: { hp: 26, speed: 2.15, radius: 0.42, coreDamage: 4, playerDamage: 6, score: 10, salvage: 3, scale: 1 },
  striker: { hp: 18, speed: 3.4, radius: 0.36, coreDamage: 3, playerDamage: 5, score: 14, salvage: 4, scale: 0.88 },
  brute: { hp: 96, speed: 1.4, radius: 0.68, coreDamage: 10, playerDamage: 14, score: 40, salvage: 10, scale: 1.45 },
};

// Each wave names what it sends; the ramp is the plan itself, not a multiplier hidden in code.
export const WAVE_PLAN = [
  { crawler: 5, striker: 0, brute: 0 },
  { crawler: 6, striker: 2, brute: 0 },
  { crawler: 6, striker: 4, brute: 0 },
  { crawler: 7, striker: 4, brute: 1 },
  { crawler: 8, striker: 6, brute: 1 },
  { crawler: 9, striker: 7, brute: 2 },
  { crawler: 10, striker: 9, brute: 2 },
  { crawler: 12, striker: 10, brute: 3 },
];

export const POOL_MAX = 34;

export const UPGRADES = [
  { id: 'damage', name: 'Ember Core', text: '+18% lance damage', cost: 18 },
  { id: 'health', name: 'Wool Coat', text: '+25 max health, and heal 25', cost: 14 },
  { id: 'vent', name: 'Tall Chimney', text: 'Vent 30% faster', cost: 14 },
  { id: 'repair', name: 'Lamp Oil', text: 'Beacon +30 integrity', cost: 12 },
  { id: 'flare', name: 'Flare Pouch', text: '+1 flare charge', cost: 16 },
  { id: 'boots', name: 'Copper Boots', text: '+12% move speed', cost: 12 },
];

export const SALVAGE = { perWave: 12, upgradeOffer: 3 };

export const BANNER = { waveSeconds: 1.6, clearSeconds: 1.4 };
