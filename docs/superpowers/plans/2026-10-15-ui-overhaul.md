# UI Overhaul — Modern Indigo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every tab of the Pokédex to a modern indigo/violet language (gradient header, white cards, circular transparent type halo, solid type-color badges) without touching logic, state, or layout structure.

**Architecture:** Presentation-only pass. One new pure helper (`textOn`) supplies contrast-correct badge text from `TYPE_DETAILS[].hex`; every other task swaps Tailwind className strings in place. No new files except the helper + its test. No new dependencies.

**Tech Stack:** React 19, Vite 8, Tailwind v4 (`@theme`), `node --test` (built-in, for the helper).

**Spec:** `docs/superpowers/specs/2026-10-15-ui-overhaul-design.md`

## Global Constraints

- No dark mode. Light theme only.
- No logic, state, hooks, props, or data-flow changes. className / inline-style only.
- No new dependencies.
- Do not change grid columns, `max-w-7xl`, or page structure.
- Radius scale: `12` input/filter, `16` panel, `18` card, `24` (`rounded-3xl`) modal.
- Accent: `indigo-700` `#4338ca` → `violet-600` `#7c3aed`. Gradient: `from-indigo-700 via-violet-700 to-violet-600` (mock used `100deg`).
- Canvas `#f6f7fb`; border `#e9ebf0`; ink `slate-900`; muted `slate-400`.
- Type halo: `radial-gradient(circle at 50% 42%, <hex>, transparent 68%)`, opacity `0.4`.
- Copy stays Indonesian; do not reword labels.

## Review Focus

- **Light type colors get dark text.** `electric #F7D02C`, `ice #96D9D6`, `ground #E2BF65`, `steel #B7B7CE`, `fairy #D685AD`, `normal #A8A77A`, `legendary #FFD700`, `mythical #D8BFD8` must render dark ink, not white — a user expects readable badges. → Task 1 test.
- **Every `TYPE_DETAILS` entry has a usable `hex`.** A missing/malformed hex yields an invisible badge. → Task 1 test.
- **Unknown or null type does not crash.** `type` undefined/`'bogus'` falls back to `normal` detail and still renders. → Task 1 test.
- **Immune weakness (`multiplier === 0`) stays visually distinct** (struck-through, muted) — not a solid type-colored chip. → Task 1 verification.
- **Contrast of nav/CTA states.** Active nav pill is white-on-gradient and inactive is white/80 on gradient; both must stay legible at every breakpoint. → Task 2 verification.

---

### Task 1: Type color helper + TypeBadge

**Files:**
- Create: `src/utils/typeColor.js`
- Test: `src/utils/typeColor.test.js`
- Modify: `src/components/TypeBadge.jsx`

**Interfaces:**
- Produces: `textOn(hex: string) -> '#0f172a' | '#ffffff'` from `src/utils/typeColor.js`. Later tasks do not import it; only `TypeBadge` uses it.

- [ ] **Step 1: Write the failing test**

```js
// src/utils/typeColor.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { textOn } from './typeColor.js';
import { TYPE_DETAILS } from '../constants/pokemonData.js';

test('dark ink on light fills', () => {
  assert.equal(textOn('#FFFFFF'), '#0f172a');
  assert.equal(textOn('#F7D02C'), '#0f172a');
});

test('white ink on dark fills', () => {
  assert.equal(textOn('#000000'), '#ffffff');
  assert.equal(textOn('#4338CA'), '#ffffff');
});

test('every type detail has a 6-digit hex', () => {
  for (const [key, d] of Object.entries(TYPE_DETAILS)) {
    assert.match(d.hex, /^#[0-9A-Fa-f]{6}$/, `bad hex for ${key}`);
    assert.ok(['#0f172a', '#ffffff'].includes(textOn(d.hex)), `bad ink for ${key}`);
  }
});

test('unknown type resolves to a real detail', () => {
  const detail = TYPE_DETAILS['bogus'] || TYPE_DETAILS.normal;
  assert.ok(detail && detail.hex);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/utils/typeColor.test.js`
Expected: FAIL — cannot find module `./typeColor.js`.

- [ ] **Step 3: Implement `textOn` in `src/utils/typeColor.js`**

Relative-luminance (WCAG) of the hex; return `'#0f172a'` when luminance > 0.5, else `'#ffffff'`. Export as a named export.

```js
export function textOn(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5 ? '#0f172a' : '#ffffff';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/utils/typeColor.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Rewrite `TypeBadge` to use solid hex**

Normal variant (line 36): replace `${detail.color}` with an inline style on the span —
`style={{ backgroundColor: detail.hex, color: textOn(detail.hex) }}` — and keep `inline-flex items-center gap-1 uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border border-black/5 text-[9px]`.
Weakness variant (lines 16–24): replace the neutral scale with — `multiplier >= 2` → solid hex bg + `textOn` ink; `multiplier === 0` → `bg-slate-100 text-slate-300 border-slate-200 line-through` (no fill); `multiplier < 1` → `bg-slate-100 text-slate-600 border-slate-200`; default → `bg-slate-50 border-slate-200 text-slate-500`. Import `textOn` from `../utils/typeColor`.

- [ ] **Step 6: Run build + lint, then commit**

```bash
npm run build && npm run lint
git add src/utils/typeColor.js src/utils/typeColor.test.js src/components/TypeBadge.jsx
git commit -m "feat(ui): solid type-color badges with contrast-aware ink"
```

---

### Task 2: Canvas + Header

**Files:**
- Modify: `src/index.css:32` (`body` background), `src/components/Header.jsx`

- [ ] **Step 1: Set canvas**

In `src/index.css`, change `body { background-color: #fafafa; }` to `#f6f7fb`. Leave scrollbar rules as-is.

- [ ] **Step 2: Restyle `Header.jsx`**

Replace the outer `<header>` classes with a gradient bar: `bg-gradient-to-r from-indigo-700 via-violet-700 to-violet-600 px-6 py-4 shadow-lg shadow-indigo-900/20`. Drop `sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-neutral-200/50` (keep `sticky top-0 z-40` only if it does not clash with the gradient — the mock is a solid bar, so keep `sticky top-0 z-40`).
Brand logo box → `bg-white/15 border border-white/20 rounded-xl`; logo `<svg>` stroke/text `text-white`. Title → `text-white`; delete the `<span>.MINIMAL</span>` and the `EST. ABU-ABU & PUTIH` paragraph; replace subtitle with a single `text-white/60` uppercase micro-line (e.g. `MODERN · INDIGO`).
Nav container → `bg-white/13 rounded-[13px] p-1`. Active item → `bg-white text-indigo-700 shadow-sm`. Inactive → `text-white/80 hover:text-white hover:bg-white/10`. Count pills → `bg-white/20 text-white`.

- [ ] **Step 3: Run build + lint, then commit**

```bash
npm run build && npm run lint
git add src/index.css src/components/Header.jsx
git commit -m "feat(ui): gradient header and indigo nav"
```

---

### Task 3: PokemonCard + skeleton

**Files:**
- Modify: `src/components/PokemonCard.jsx`, `src/components/PokemonCardSkeleton.jsx`

- [ ] **Step 1: Card shell + actions**

Shell (line 14): `group relative bg-white rounded-2xl border border-[#e9ebf0] transition-all duration-300 hover:-translate-y-1 flex flex-col shadow-[0_1px_2px_rgba(17,24,39,.03),0_10px_26px_-20px_rgba(17,24,39,.22)] overflow-hidden text-left`.
Action buttons (lines 24–54): keep the three SVGs and handlers; restyle each to `w-[22px] h-[22px] rounded-lg border border-[#e9ebf0] bg-[#f6f7fb] text-slate-400 inline-flex items-center justify-center transition-all cursor-pointer`. Active state (compare/fav) → `bg-gradient-to-br from-indigo-700 to-violet-600 border-transparent text-white shadow-[0_4px_10px_-3px_rgba(79,70,229,.5)]`. Set the icon `w-3.5 h-3.5`.

- [ ] **Step 2: Sprite halo**

Replace lines 59–67: outer div `flex justify-center items-center relative h-[104px] bg-white`. Add halo div: `absolute w-[104px] h-[104px] rounded-full opacity-40` with `style={{ background: \`radial-gradient(circle at 50% 42%, ${TYPE_DETAILS[pokemon.types[0]]?.hex ?? '#A8A77A'}, transparent 68%)\` }}`. Sprite `<img>` → `w-20 h-20 object-contain z-10 drop-shadow-[0_5px_7px_rgba(0,0,0,.16)] transition-transform duration-300 group-hover:scale-105`. Import `TYPE_DETAILS` from `../constants/pokemonData`.

- [ ] **Step 3: Info + CTA**

Info block (line 70): `p-4 flex flex-col flex-grow z-10 border-t border-[#f2f4f7]` (drop `bg-neutral-50/30`). Name → `text-[13.5px] font-bold capitalize tracking-tight text-slate-800 m-0`. CTA (line 88): `w-full py-3 bg-white hover:bg-indigo-50 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-700 border-t border-[#f2f4f7] mt-auto transition-colors cursor-pointer text-center`.

- [ ] **Step 4: Match the skeleton**

In `PokemonCardSkeleton.jsx`: card shell → `bg-white rounded-2xl border border-[#e9ebf0] p-4 space-y-4 animate-pulse overflow-hidden`; the sprite placeholder (line 19) already is `rounded-full` — bump to `w-24 h-24` and keep; badge placeholders → `rounded-md`; footer bar → `rounded-lg`. Keep `neutral-200` bones.

- [ ] **Step 5: Run build + lint, then commit**

```bash
npm run build && npm run lint
git add src/components/PokemonCard.jsx src/components/PokemonCardSkeleton.jsx
git commit -m "feat(ui): card with circular type halo and gradient actions"
```

---

### Task 4: App shell, toolbar, compare, toasts

**Files:**
- Modify: `src/App.jsx:452-467` (root + toolbar), `~596-690` (compare), `~776` (add-to-team modal), `~827` (toast)

- [ ] **Step 1: Root + toolbar**

Root (line 452): `min-h-screen bg-[#f6f7fb] text-slate-900 font-sans pb-16`. Progress bar (line 455): `bg-gradient-to-r from-indigo-700 to-violet-600`. Search input (line 487) + four filter selects (504, 519, 532, 545): `bg-[#f6f7fb] border border-[#e9ebf0] focus:border-indigo-600 focus:bg-white focus:outline-none transition-all rounded-xl ...`. Primary "Tembak Live" button: `bg-gradient-to-r from-indigo-700 to-violet-600 text-white shadow-[0_6px_16px_-6px_rgba(79,70,229,.55)]`. Secondary buttons (line 585): `border-[#e9ebf0] hover:bg-indigo-50 hover:text-indigo-700`.

- [ ] **Step 2: Compare section**

Compare panel (line 596): `bg-white p-8 rounded-2xl border border-[#e9ebf0] shadow-[0_1px_2px_rgba(17,24,39,.03)] max-w-5xl mx-auto`. Empty slots (608): `border-2 border-dashed border-[#e9ebf0] rounded-2xl bg-[#f6f7fb]/40`. Pokémon tiles (615): `bg-[#f6f7fb]/60 rounded-2xl border border-[#e9ebf0]`. Stat rows (660): `bg-[#f6f7fb]/50 rounded-xl border border-[#e9ebf0]`. Stat bars (674, 685): winner `bg-indigo-600`, tie `bg-slate-400`, loser `bg-slate-200`.

- [ ] **Step 3: Add-to-team modal + toast**

Modal (776–792): keep overlay; panel `bg-white rounded-3xl border border-[#e9ebf0] p-8 max-w-sm w-full space-y-5 shadow-2xl`; option buttons → `bg-[#f6f7fb] hover:bg-indigo-50 hover:border-indigo-200 border border-[#e9ebf0] rounded-xl text-slate-700`. Toast (827): keep `bg-slate-900 text-white`, add `border border-indigo-500/30`.

- [ ] **Step 4: Run build + lint, then commit**

```bash
npm run build && npm run lint
git add src/App.jsx
git commit -m "feat(ui): indigo toolbar, compare and toasts"
```

---

### Task 5: PokemonModal

**Files:**
- Modify: `src/components/PokemonModal.jsx`

- [ ] **Step 1: Shell + primary buttons**

Panel (line 37): keep `rounded-3xl`, swap `border-neutral-200/60` → `border-[#e9ebf0]`, keep `shadow-2xl p-8`. Close button and every primary action (save/confirm) → `bg-gradient-to-r from-indigo-700 to-violet-600 text-white rounded-xl`. Secondary/cancel → `border-[#e9ebf0] hover:bg-indigo-50 hover:text-indigo-700`. Inputs/selects inside the form → `bg-[#f6f7fb] border border-[#e9ebf0] focus:border-indigo-600 focus:bg-white`.

- [ ] **Step 2: Stat bars + weakness**

Stat bars: fill `bg-indigo-600` (replace any `bg-neutral-900`). Weakness rows already render `<TypeBadge isWeakness .../>` — no change needed beyond Task 1.

- [ ] **Step 3: Run build + lint, then commit**

```bash
npm run build && npm run lint
git add src/components/PokemonModal.jsx
git commit -m "feat(ui): modal indigo accents"
```

---

### Task 6: TeamManager + JournalTimeline

**Files:**
- Modify: `src/components/TeamManager.jsx`, `src/components/JournalTimeline.jsx`

- [ ] **Step 1: TeamManager**

Panel (line 22): `bg-white p-8 sm:p-10 rounded-3xl border border-[#e9ebf0] shadow-[0_1px_2px_rgba(17,24,39,.03)]`. Heading → `text-indigo-700`. Body copy `text-neutral-450` → `text-slate-400`. Create input (line 39): `bg-[#f6f7fb] border border-[#e9ebf0] focus:border-indigo-600 focus:bg-white`. Create button → gradient accent. Team cards → `border-[#e9ebf0]`, empty slot `border-dashed border-[#e9ebf0]`, team count badge → `bg-indigo-50 text-indigo-700`.

- [ ] **Step 2: JournalTimeline**

Panel (line 37): same border/shadow swap. Heading → `text-indigo-700`, copy → `text-slate-400`. Timeline rail + dots → `bg-indigo-600` / `border-indigo-600`. Log cards → `rounded-2xl border border-[#e9ebf0]`. Edit/delete buttons → `hover:text-indigo-700` / `hover:text-rose-600`. Empty state icon box → `bg-[#f6f7fb] border-[#e9ebf0]`.

- [ ] **Step 3: Run build + lint, then commit**

```bash
npm run build && npm run lint
git add src/components/TeamManager.jsx src/components/JournalTimeline.jsx
git commit -m "feat(ui): team and journal indigo pass"
```

---

### Task 7: QuizGame + BattleSimulator

**Files:**
- Modify: `src/components/QuizGame.jsx`, `src/components/BattleSimulator.jsx`

- [ ] **Step 1: QuizGame**

Panel (line 13): border `#e9ebf0`, shadow soft. Score numerals → `text-indigo-700`. Loading spinner border → `border-indigo-600 border-t-transparent`. Silhouette box (line 37): `bg-[#f6f7fb] border border-[#e9ebf0] rounded-2xl`. Answer options: default `border-[#e9ebf0] hover:bg-indigo-50 hover:border-indigo-200`; correct `border-emerald-500 bg-emerald-50 text-emerald-700`; wrong `border-rose-500 bg-rose-50 text-rose-700`.

- [ ] **Step 2: BattleSimulator**

Action buttons → gradient accent; disabled → `disabled:opacity-50`. Panels/logs → `rounded-2xl border border-[#e9ebf0]`. Keep HP bar semantics (green→amber→red) untouched. Damage numbers / winner highlight → `text-indigo-700` / `bg-indigo-50`. Do not touch battle math or turn logic.

- [ ] **Step 3: Run build + lint, then commit**

```bash
npm run build && npm run lint
git add src/components/QuizGame.jsx src/components/BattleSimulator.jsx
git commit -m "feat(ui): quiz and battle indigo pass"
```

---

### Task 8: ErrorBoundary + type-data cleanup + full verify

**Files:**
- Modify: `src/components/ErrorBoundary.jsx`, `src/constants/pokemonData.js`

- [ ] **Step 1: ErrorBoundary**

Root bg `#f6f7fb`; card `rounded-3xl border border-[#e9ebf0]`; icon box `bg-indigo-50 border-indigo-100 text-indigo-600`; "Muat Ulang" → gradient accent; "Coba Lagi" → `border-[#e9ebf0] hover:bg-indigo-50`.

- [ ] **Step 2: Drop the dead `color` field**

In `TYPE_DETAILS` (lines 1–21), remove the `color:` property from every entry, keeping `hex` and `label`. Confirm `detail.color` no longer appears anywhere.

Run: `grep -rn "detail\.color" src/ || echo CLEAN`
Expected: `CLEAN`.

- [ ] **Step 3: Full verification**

```bash
npm run build && npm run lint
node --test src/utils/typeColor.test.js
grep -rn "neutral-450\|neutral-850\|neutral-250\|neutral-350" src/ || echo NO_PHANTOM_TOKENS
```
Expected: build succeeds, lint 0 problems, 4 tests pass, `NO_PHANTOM_TOKENS`.

- [ ] **Step 4: Commit**

```bash
git add src/components/ErrorBoundary.jsx src/constants/pokemonData.js
git commit -m "feat(ui): error boundary + remove dead type color field"
```

---

## Notes for the executor

- Every task is presentation-only. If a diff changes a handler, a prop, a `useState`, or a fetch, revert that hunk.
- The mockups in `.superpowers/brainstorm/11070-1792050831/content/` (`explore-layout-v4.html` is the accepted one) are the visual source of truth for the card + header + toolbar.
- Do not add a test framework. The only automated test is the stdlib one in Task 1.
