# Ember Watch

A first-person night watch on a lamp rock. Hollow things walk out of the sea and want the beacon dark;
you have one ember lance, three flares and until dawn. Hold eight waves and the light holds with you.

[![best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01)
[![rank](https://make.fun/badge/best-game-01/flavyn/makefun-best-game-01/rank.svg)](https://make.fun/bounty/best-game-01)
[![reward](https://make.fun/badge/best-game-01/flavyn/makefun-best-game-01/reward.svg)](https://make.fun/bounty/best-game-01)

## Play it

```
node serve.ts            # http://127.0.0.1:8080/
```

Desktop Chrome, keyboard and mouse. `W A S D` move, mouse look, left click the ember lance,
`R` vents its heat, `G` throws a flare, `C` crouches, `Esc` pauses, `M` mutes.

## How a night goes

The beacon at the middle of the rock has 100 integrity. Hollows walk in from eight gates and break it;
you break them first. Every wave is bigger than the last, and between waves salvage buys one of three
upgrades. The watch ends when the keeper falls, the beacon goes dark, or wave eight breaks and dawn comes.

## Handing it in

```
node main.ts             # copies game/ and screenshots/ to $MAKEFUN_OUTPUT_DIR and writes dossier.json
```

`main.ts` uses `buildDossier` from `vendor/makefun-game.ts`, the kit's own copy, so the gate's rebuild
is byte for byte the dossier this program writes. `game/` is plain static files: three.js is the only
library, vendored as `game/vendor/three/*.min.js`, and every sound is made in code by `game/src/audio.js`.

## Files

```
game/index.html        the page, the HUD, the three screens, the import map
game/src/main.js       bootstrap and the fixed-step loop
game/src/world.js      the rock, its lanes, its lamps, and the collision boxes
game/src/player.js     movement, crouch, wall collision, the camera
game/src/hollow.js     the Hollow pool, its behaviour, and hit detection
game/src/weapon.js     heat, vent, spread, recoil, flares
game/src/rounds.js     waves, salvage, upgrades, win and loss
game/src/hud.js        the bars and numbers, written only when they change
game/src/audio.js      every sound, synthesised in WebAudio
game/src/input.js      keyboard, mouse and pointer lock
```

MIT licensed; see `LICENSE`.
