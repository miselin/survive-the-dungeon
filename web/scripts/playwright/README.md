# Playwright Regression Flow (Seeded)

This scenario validates a deterministic 2-floor progression run using seed:

- `pw-regression-seed-2026-02-21-a`

Coverage includes:

- inventory open/use/equip
- shop reward + shop purchase
- chest interaction
- combat UX checks (action subtitles + roll flow)
- boss reward selection and floor advancement (floor 1 -> 2 -> 3)

## Run

From repo root (one command):

```bash
make web-regression
```

Direct runner (if you do not want to use Make):

```bash
./web/scripts/playwright/run_full_floor_regression.sh
```

Artifacts are written to:

- `/Users/miselin/src/survive-the-dungeon/output/playwright`

Latest machine-readable report:

- `/Users/miselin/src/survive-the-dungeon/output/playwright/regression_latest.json`

## Notes

- The script uses the dev-only `window.__surviveDebug` bridge.
- It enables regression-only power-up (`grantRegressionPower`) to keep multi-floor checks deterministic and stable.
