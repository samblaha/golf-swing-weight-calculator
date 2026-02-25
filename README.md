# SwingWeight Bag Lab

Spreadsheet-style golf swingweight web app built with Vite + React + TypeScript + shadcn/ui.

## Run

```bash
cd /Users/samblaha/Documents/Development/SwingWeight
npm install
npm run dev
```

Open the local URL shown by Vite.

## Build and test

```bash
npm run test
npm run build
```

## Calculator method

Inputs per club row:
- Club weight in grams
- Balance point measured from grip end (inches or mm)
- Optional target swingweight (`A0`..`G9`)

Core formulas:
- `balance_in = balance_mm / 25.4` (if mm selected)
- `inch_grams = round((balance_in - 14) * club_weight_g)`
- Swingweight ranges in 500 inch-gram blocks:
  - `A: 4550..5049`, `B: 5050..5549`, ..., `G: 7550..8049`
- Decimal step inside each letter range:
  - `(inch_grams - range_start) / 50`

Adjustment outputs:
- `delta_points = target_points - current_points`
- `head_grams = delta_points * 2`
- `grip_grams = delta_points * -4`
- `length_inches = delta_points / 6`

State is saved in browser `localStorage` under a new key for the React app.
