# Survive the Dungeon (Web Port)

Browser dungeon crawler built with TypeScript + Vite.

## Run

```bash
cd web
npm install
npm run dev
```

## Build

```bash
cd web
npm run build
npm run preview
```

## Unit Tests

```bash
cd web
npm test
```

Or from repo root:

```bash
make web-test
```

## Included gameplay fixes from code review

- Combat now applies the attacker Strength modifier correctly.
- Boss challenge level is preserved and no longer overwritten by generic room scaling.
- Turn-based effect expiration naming is consistent (`hasExpired` / `has_expired`) to avoid runtime mismatches.
- Online leaderboard/daily APIs were removed for the web port.
- Map generation now creates a connected graph with extra loops instead of a pure linear room chain.

## Controls

- Move: `WASD` or arrow keys
- `I`: open/close inventory
- `O`: open/close shop (in shop room)
- `Esc`: close current modal
- Battle actions: keys `1-5`

## Save / Resume (No DB)

- Use `Save` in the run header to generate a portable save token.
- `Load` accepts either:
  - the raw token, or
  - a full URL with `?save=...`.
- The game also keeps a local autosave in browser storage (`Resume Last` on the menu).

## Text Tuning / Localization Prep

- Player-facing English strings are centralized in:
  - `/Users/miselin/src/survive-the-dungeon/web/src/strings/en.ts`
- `main.tsx`, `game.ts`, and `combat.ts` now consume that module, so wording tweaks do not require grep-based edits across gameplay files.

## Balance Tuning

- Gameplay/balance knobs are centralized in:
  - `/Users/miselin/src/survive-the-dungeon/web/src/constants.ts`
- This now includes combat stance multipliers, crit limits/defaults, enemy behavior thresholds, spawn/loot odds, shop costs, floor-heal values, and starting loadout values.
