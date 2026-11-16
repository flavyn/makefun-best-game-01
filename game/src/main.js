// Bootstrap and the one loop: a fixed step for the game, a frame for the picture, never the other way.
// Everything the other modules do is called from here, so the wiring is readable in one screen.

import * as THREE from 'three';
import { LANCE, FLARE, ARENA } from './tuning.js';
import { buildWorld } from './world.js';
import { Player, poseCamera } from './player.js';
import { Hollows } from './hollow.js';
import { Lance } from './weapon.js';
import { Round, STATE } from './rounds.js';
import { Hud } from './hud.js';
import { Input } from './input.js';
import { Sound } from './audio.js';

const STEP = 1 / 60;
const MAX_FRAME = 0.2;
const IDLE = { held: () => false };

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.78;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(74, window.innerWidth / window.innerHeight, 0.08, 320);
scene.add(camera);

const lantern = new THREE.PointLight(0xffd9a0, 15, 17, 1.7);
lantern.position.set(0.28, -0.12, -0.3);
camera.add(lantern);

const muzzle = new THREE.PointLight(0xffc46b, 0, 9, 2);
muzzle.position.set(0.3, -0.08, -0.55);
camera.add(muzzle);

const world = buildWorld(scene);
const sound = new Sound();
const player = new Player();
const hollows = new Hollows(scene, world, sound);
const lance = new Lance(scene, sound);
const hud = new Hud();
const input = new Input(canvas);

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = Number.parseInt(params.get('seed') || '1', 10) || 1;
const rng = makeRng(seed);

const api = { player, hollows, lance, sound, world, hud };
const round = new Round(api, rng);
api.damageCore = (amount) => round.damageCore(amount);
api.damagePlayer = (amount) => round.damagePlayer(amount);
// A dev handle for the capture and the console; the game itself never reads it back.
window.__watch = { camera, scene, player, round, hollows, world, lance };

const tracer = new THREE.Mesh(
  new THREE.BoxGeometry(0.03, 0.03, 1),
  new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.9 }),
);
tracer.visible = false;
scene.add(tracer);

const flareLight = new THREE.PointLight(0xffb24a, 0, 22, 1.8);
scene.add(flareLight);

const FLARE_TARGETS = [];
const forward = new THREE.Vector3();
let tracerTimer = 0;
let flareFlash = 0;

function makeRng(initial) {
  let state = initial >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function showTracer(origin, dir, distance, color) {
  tracer.visible = true;
  tracerTimer = 0.055;
  tracer.material.color.setHex(color);
  tracer.scale.set(1, 1, Math.max(0.25, distance));
  tracer.position.set(
    origin.x + dir.x * distance * 0.5,
    origin.y + dir.y * distance * 0.5,
    origin.z + dir.z * distance * 0.5,
  );
  tracer.lookAt(origin.x + dir.x * distance, origin.y + dir.y * distance, origin.z + dir.z * distance);
}

// One lance shot: spread from heat and motion, a head sphere worth more than a body, and a vent lock.
function fireLance() {
  camera.updateMatrixWorld();
  forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
  const moving = Math.hypot(player.vel.x, player.vel.z) > 0.7;
  const spread = lance.spread + (moving ? LANCE.spreadMove : 0) + lance.recoil * 0.8;
  forward.x += (rng() - 0.5) * spread;
  forward.y += (rng() - 0.5) * spread;
  forward.z += (rng() - 0.5) * spread;
  forward.normalize();
  lance.registerShot();
  muzzle.intensity = 11;
  player.pitch = Math.min(0.75, player.pitch + LANCE.recoilPitch);
  sound.lance();
  hollows.alert(player.pos.x, player.pos.z, 13);
  const index = hollows.raycast(camera.position, forward, LANCE.range);
  if (index < 0) {
    round.registerShot(false);
    showTracer(camera.position, forward, LANCE.range, 0x9fb4c4);
    return;
  }
  const head = hollows.hitHead;
  const item = hollows.items[index];
  const damage = (head ? LANCE.crit : LANCE.damage) * lance.damageMul;
  const killed = hollows.applyDamage(index, damage);
  round.registerShot(true);
  if (killed) {
    round.addKill(item.score, item.salvage);
    sound.kill();
  } else if (head) {
    sound.crit();
  } else {
    sound.hit();
  }
  showTracer(camera.position, forward, hollows.hitDistance, head ? 0xfff2c8 : 0xffc46b);
}

function burstFlare(x, z) {
  flareLight.position.set(x, 2.1, z);
  flareFlash = 0.55;
  hollows.gatherWithin(x, z, FLARE.radius, FLARE_TARGETS);
  for (const index of FLARE_TARGETS) {
    const item = hollows.items[index];
    const killed = hollows.applyDamage(index, FLARE.damage * lance.damageMul);
    hollows.stun(index, FLARE.stun);
    if (killed) {
      round.addKill(item.score, item.salvage);
      sound.kill();
    }
  }
}

function readInput(dt) {
  if (input.consume('KeyM')) sound.setMuted(!sound.muted);
  const look = input.flushLook();
  if (look.dx !== 0 || look.dy !== 0) player.look(look.dx, look.dy);
  if (input.held('ArrowLeft')) player.look(-14 * dt * 60, 0);
  if (input.held('ArrowRight')) player.look(14 * dt * 60, 0);
  if (input.held('ArrowUp')) player.look(0, -9 * dt * 60);
  if (input.held('ArrowDown')) player.look(0, 9 * dt * 60);
}

function stepOnce(dt) {
  readInput(dt);
  if (round.state === STATE.TITLE) {
    if (input.consume('Enter') || input.consume('Space') || input.consume('NumpadEnter')) {
      sound.unlock();
      sound.startAmbience();
      round.start();
      input.lock();
    }
  } else if (round.state === STATE.PLAYING) {
    if (input.consume('Escape')) {
      round.pause();
      return;
    }
    if (input.consume('KeyR')) lance.vent();
    if (input.consume('KeyG')) lance.throwFlare(camera);
    if (input.firing && lance.canFire()) fireLance();
    player.step(dt, input, world.walls, world.core, sound);
  } else if (round.state === STATE.UPGRADE) {
    if (input.consume('Digit1') || input.consume('Numpad1')) round.chooseUpgrade(0);
    if (input.consume('Digit2') || input.consume('Numpad2')) round.chooseUpgrade(1);
    if (input.consume('Digit3') || input.consume('Numpad3')) round.chooseUpgrade(2);
  } else if (round.state === STATE.DEFEAT || round.state === STATE.VICTORY) {
    if (input.consume('KeyR') || input.consume('Enter')) {
      round.start();
      input.lock();
    }
  } else if (round.state === STATE.PAUSED) {
    if (input.consume('Escape') || input.consume('Enter')) round.resume();
  }

  lance.step(dt, Math.hypot(player.vel.x, player.vel.z) > 0.7);
  lance.stepFlares(dt, burstFlare);
  if (tracerTimer > 0) {
    tracerTimer -= dt;
    if (tracerTimer <= 0) tracer.visible = false;
  }
  if (muzzle.intensity > 0) muzzle.intensity = Math.max(0, muzzle.intensity - dt * 90);
  if (flareFlash > 0) {
    flareFlash -= dt * 1.7;
    flareLight.intensity = Math.max(0, flareFlash * 40);
  } else {
    flareLight.intensity = 0;
  }
  round.step(dt);
  input.endStep();
}

function render() {
  poseCamera(camera, player);
  world.beaconLight.intensity = 9 + 19 * (round.coreHealth / round.coreMax);
  hud.update(round, player, lance);
  renderer.render(scene, camera);
}

// The four screenshots of shots.json are posed with the game's own state machine and then rendered.
function poseShot() {
  if (!shot) return;
  if (shot === 'start') {
    round.state = STATE.TITLE;
  } else if (shot === 'play') {
    round.start();
    round.spawnQueue.length = 0;
    round.wave = 3;
    round.score = 240;
    round.salvage = 21;
    round.kills = 7;
    round.hits = 9;
    round.shots = 11;
    round.banner = 'WAVE 3 / 8';
    round.bannerTimer = 0.9;
    hollows.spawn('crawler', -1.5, 8.5, 3);
    hollows.spawn('crawler', 2.6, 7.2, 3);
    hollows.spawn('striker', 5.2, 10.5, 3);
    hollows.spawn('crawler', -4.0, 12.0, 3);
    hollows.spawn('striker', 0.8, 13.2, 3);
    hollows.spawn('brute', -2.0, 6.0, 3);
    player.pos.x = 7.2;
    player.pos.z = 16.8;
    player.yaw = 0.42;
    player.pitch = -0.07;
    for (let i = 0; i < 30 && round.state === STATE.PLAYING; i += 1) {
      player.step(STEP, IDLE, world.walls, world.core, sound);
      round.step(STEP);
    }
    lance.heat = 46;
    aimAtApproach(6.0);
    fireLance();
  } else if (shot === 'upgrade') {
    round.jumpToUpgrade(3, 42);
    hud.cache.overlay = '';
  } else if (shot === 'end') {
    round.jumpToEnd('defeat', 1240, 7, 'the beacon went dark on the seventh wave');
    hud.cache.overlay = '';
  }
  if (shot === 'play') muzzle.intensity = 4;
  frozen = true;
}

// Aim at the nearest Hollow that is at least `closest` metres out, so the shot frames a fight
// instead of the back of the one that already reached the keeper.
function aimAtApproach(closest) {
  let best = -1;
  let bestGap = Infinity;
  for (let i = 0; i < hollows.items.length; i += 1) {
    const item = hollows.items[i];
    if (!item.alive) continue;
    const gap = Math.hypot(item.x - player.pos.x, item.z - player.pos.z);
    if (gap < closest) continue;
    if (gap < bestGap) {
      bestGap = gap;
      best = i;
    }
  }
  if (best < 0) return;
  const item = hollows.items[best];
  const dx = item.x - player.pos.x;
  const dz = item.z - player.pos.z;
  player.yaw = Math.atan2(-dx, -dz);
  player.pitch = -Math.atan2(1.2, Math.max(2, Math.hypot(dx, dz))) * 0.55;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
}

addEventListener('resize', onResize);
addEventListener('mousedown', () => {
  if (round.state === STATE.PLAYING) input.lock();
});

let last = performance.now();
let accumulated = 0;
let frames = 0;
// A posed screenshot holds still: the step is off, the frame is still drawn.
let frozen = false;

function frame(now) {
  const delta = Math.min(MAX_FRAME, Math.max(0, (now - last) / 1000));
  last = now;
  accumulated += delta;
  let guard = 0;
  while (!frozen && accumulated >= STEP && guard < 8) {
    stepOnce(STEP);
    accumulated -= STEP;
    guard += 1;
  }
  if (frozen) accumulated = 0;
  render();
  frames += 1;
  if (shot && frames >= 3) window.__shotReady = true;
  requestAnimationFrame(frame);
}

poseShot();
render();
requestAnimationFrame(frame);
