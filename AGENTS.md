# Stick War Saga — AGENTS.md

## Project Overview
Browser-based Stick War Saga clone. Single `index.html` with vanilla JS + Canvas2D.

## File Structure
- `/home/piotr/alek-game/index.html` — entry point, loads `/js/main.ts` as module
- `/home/piotr/alek-game/js/*.ts` — TypeScript source files (modules)
- `/home/piotr/alek-game/tsconfig.json` — TypeScript config
- `/home/piotr/alek-game/vite.config.ts` — Vite dev server + Vitest config
- `/home/piotr/alek-game/biome.json` — Biome linter config

## How to Run
Run `npm run dev` (starts Vite dev server), then open the URL shown (usually http://localhost:5173).
For production build: `npm run build` (outputs to `dist/`).

## Linting
Uses **Biome** (v2.5.8) — Rust-based linter + formatter.
- `npm run lint` — check for issues
- `npm run lint:fix` — apply safe fixes
- `npm run lint:unsafe` — apply all fixes (use with care; may change semantics)
Config in `biome.json`. Key rule overrides (matches tsconfig strictness):
- `noUnusedVariables`: off (matches `noUnusedLocals: false`)
- `noExplicitAny`: off
- `noNonNullAssertion`: off

## Game Modes

### Player vs AI (`mode: 'ai'`)
- Endless waves with escalating difficulty
- Shop panel on the right with clickable unit cards
- Click to buy, or use P1 keyboard shortcuts
- Wave progression with bonus gold between rounds

### Player vs Player (`mode: 'pvp'`)
- Hotseat: both players share one keyboard
- No shop clicking (cards show key reference only)
- P1 uses: `1` `q` `a` `z` `x` `s` `w` `2`
- P2 uses: `.` `;` `[` `=` `-` `p` `l` `,`
- Equal starting gold (400g) + 3 miners each
- Best-of-5 rounds (most wins after 5 rounds wins the match)
- Armies reset each round (both get 400g + 3 miners)

## Key Mappings

| Unit | P1 Key | P2 Key |
|------|--------|--------|
| Miner | `1` | `=` |
| Swordsman | `q` | `[` |
| Archer | `a` | `;` |
| Spearman | `z` | `.` |
| Knight | `x` | `,` |
| Mage | `s` | `l` |
| Giant | `w` | `p` |
| Healer | `2` | `-` |

## Code Architecture

### Key Functions
- `startGame(mode)` — entry point, resets state and starts first wave
- `startPrep()` — prep phase setup, positions units in formation
- `startBattle()` — begins auto-combat, all non-miners march
- `endBattle(winner)` — shows result, triggers transition
- `buyUnit(type, team)` — purchases a unit for either team
- `updateUnits(dt)` — per-frame unit AI (targeting, movement, combat)
- `updateEconomy(dt)` — miner gold generation
- `updateFormationPositions()` — calculates formation layout for both teams
- `aiUpdate(dt)` — enemy AI buys units during prep (AI mode only)
- `checkBattleEnd()` — detects when one side is eliminated

### Game State (`game` object)
- `game.mode`: `'ai'` | `'pvp'`
- `game.phase`: `'prep'` | `'battle'` | `'transition'` | `'gameover'`
- `game.player`: `{ gold, income, units[] }` — green team (left)
- `game.enemy`: `{ gold, income, units[] }` — red team (right)
- `game.projectiles[]`, `game.particles[]`, `game.floatingTexts[]`

### Unit Object
Each unit has: `{ type, team, x, y, hp, maxHp, dmg, range, speed, atkCd, state, formationX, formationY, ... }`

State machine: `idle` → `marching` → `attacking` → `dying` → `dead`

### Unit Types & Costs
- Miner: 80g (income: +3g/s)
- Swordsman: 100g (melee)
- Archer: 140g (ranged)
- Spearman: 120g (melee)
- Knight: 200g (fast melee)
- Mage: 240g (AoE ranged)
- Giant: 400g (tank)
- Healer: 180g (heals allies)

## Important Gotchas
- `formationY` MUST be set on every unit or y-coord becomes NaN (fixed in `createUnit`)
- `updateFormationPositions()` handles BOTH teams now
- In PvP mode, shop cards are display-only (pointer-events: none)
- AI timer (`game._aiTimer`) is only active during prep in AI mode
- Unit positions snap to formation on wave start via `u.x = u.formationX`

## Testing
- **Manual**: Open `index.html` in a browser, play both modes. Check console for errors.
- **Unit tests**: Run `npx vitest run` (63 tests across 9 files).
- Test files live in `js/__tests__/` — they define pure-logic copies of key functions in `setup.js` (no DOM dependency).
- No browser needed for tests — runs in Node via Vitest.

## Test Coverage (63 tests)

| File | Tests | What's tested |
|------|-------|---------------|
| `config.test.js` | 8 | All 8 unit types defined, costs > 0, HP > 0, keys complete |
| `factory.test.js` | 10 | Unit object shape, flags, scales, dir, all 8 types |
| `simulation-economy.test.js` | 5 | Income rate, multi-miner, battle rate, dead miners, both teams |
| `simulation-combat.test.js` | 6 | Win detection, miner activation, phase guard |
| `simulation-effects.test.js` | 9 | Projectile spawn/move/remove, particles, floating text |
| `ai.test.js` | 4 | Affordability, no Miner buys, budget respect |
| `phases.test.js` | 10 | PvP scoring, round advance, AI bonus gold, wave scaling |
| `shop.test.js` | 6 | Team-specific deduction, phase guard, insufficient gold |
| `formation.test.js` | 5 | Non-NaN positions, miner/combat separation, enemy mirroring |
