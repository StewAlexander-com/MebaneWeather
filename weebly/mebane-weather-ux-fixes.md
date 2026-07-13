# Mebane Weather Widget — 10-Pass Rubber Duck UX Review

Senior UI/UX review of the `#mwdb` embedded widget. Each pass asks one question; fixes are ordered P0 → P2.

---

## Pass 1 — "Does dark mode actually work everywhere?"

**Duck says:** Root tokens are solid, but dozens of hardcoded light-theme hex values leak through.

| Issue | Where | Impact |
|-------|-------|--------|
| Scroll fade gradients use `rgba(255,255,255,.95)` | `.mw2-scroll-outer::before/after` | White fog on dark backgrounds — looks broken |
| Day-tab / radar fade variants hardcode `#fafafa` / `#f5f5f5` | `.daytabs`, `.radar` modifiers | Same |
| Legend cards use `#333`, `#666`, `#bbb`, `#ebebeb` | `.mw2-leg-*` | Illegible glossary in dark mode |
| Detail panel dividers `#f3f3f3`, `#ebebeb` | `.mw2-kv`, `.mw2-mbg`, `.mw2-cons` | Low contrast stripes |
| Chart tabs `#ddd` / `#666` | `.mw2-ctab` | Tabs look disabled at night |
| SPC text inline `color:#555` | `#mwspctxt` | Muted wrong in dark |
| **CSS typo** | `.mw2-jump-btn.now:hover{background:var(--mw-card-bg)3f0}` | Invalid rule — hover does nothing |

**Fix:** Extend tokens + replace hardcoded colors. See `mebane-weather-ux-patch.css`.

---

## Pass 2 — "Can someone with glasses / on a phone read this?"

**Duck says:** Mobile `@media (max-width:480px)` bump is thoughtful, but several elements stay too small.

| Issue | Size | Fix |
|-------|------|-----|
| Footer Diag / Sources buttons | 10px / tiny padding | `min-height:44px`, `font-size:0.75rem` |
| Summary stat tooltips | `0.5rem` | Hide on touch (`@media (hover:hover)`); rely on `title` |
| Chart tab desktop | `min-height:36px` | Raise to 44px globally |
| `.mw2-ts` / stale badge | 10px class | OK on mobile after bump; desktop still small |

**Fix:** Touch-target block in patch CSS; tooltip gated to hover-capable devices.

---

## Pass 3 — "Does keyboard / screen-reader user get lost?"

**Duck says:** Hour cards and legend toggle are good. Gaps elsewhere.

| Issue | Fix |
|-------|-----|
| No visible `:focus-visible` on tabs, cards, scroll chevrons | Add 2px purple outline + offset |
| Chart section uses buttons but no `role="tablist"` / `aria-selected` | Add in `setChart` + `buildTabs` |
| Alert / LIVE updates are silent | `aria-live="polite"` on `#mwalertxt`, `#mwts` |
| `LIVE` is color+animation only | Add `sr-only` "Data refreshing" or `aria-label` on container |
| Day tab buttons lack `aria-selected` | Set in `buildTabs` |

**Fix:** JS snippets in patch section below.

---

## Pass 4 — "Is the information hierarchy obvious in 3 seconds?"

**Duck says:** Stack is dense but logical: Header → Alerts → SPC → Days → Summary → Timeline → Detail → Chart → Radar.

| Issue | Recommendation |
|-------|----------------|
| Summary strip hidden until data loads — good | Keep |
| Three time navigators (slider, jump pills, hour cards) | OK for power users; add one-line hint in glossary (already there) |
| Source panel + Diag in footer compete with attribution | Move Sources into glossary accordion footer or collapse Diag behind long-press |

**Fix (optional P2):** Visually de-emphasize footer utility buttons (lower contrast until hover).

---

## Pass 5 — "Do horizontal scroll areas feel discoverable?"

**Duck says:** Fade + chevron pattern is excellent. Two bugs undermine it.

| Issue | Fix |
|-------|-----|
| Dark-mode fades invisible/wrong | Token-based fades (Pass 1) |
| `scrollRow` uses `offsetWidth + 5` — breaks if gap CSS changes | Use `gap` from computed style or `scrollBy({ left: el.clientWidth * 0.8 })` |

**Fix:** JS one-liner in patch.

---

## Pass 6 — "What happens while loading, failing, and recovering?"

**Duck says:** Skeletons, retry, graceful API degradation — strong.

| Issue | Fix |
|-------|-----|
| `jumpNow()` when switching from future day sets `S.hi=0` (midnight) not **current hour** | Set `S.hi` to `lh` before `renderDay()` |
| Stale badge `#mwstale` never shown in pasted code | Wire: if `ageMin > 90` show stale |
| SPC fallback `*` suffix is good | Add `(estimated)` visually in badge title attr |

**Fix:** `jumpNow` patch below (P0 bug).

---

## Pass 7 — "Is the code maintainable for the next you?"

**Duck says:** Single embed block is Weebly-appropriate but CSS has duplication.

| Issue | Fix |
|-------|-----|
| Two separate `@media (prefers-color-scheme:dark)` blocks for SPC badges | Merge into one |
| `fetchSPC` fake Response wrapper | `safeFetch` already returns JSON — simplify chain |
| Inline styles in `renderDetail` / `buildCards` | Gradual move to classes (P2) |

---

## Pass 8 — "Are motion and contrast respectful?"

**Duck says:** Pulsing LIVE dot, SPC pill, severe alert dot — no `prefers-reduced-motion`.

| Issue | Fix |
|-------|-----|
| Animations ignore OS setting | `@media (prefers-reduced-motion: reduce)` disable pulses |
| `.mw2-sstat-label` `#9b7ac8` on white | ~3.5:1 — bump to `var(--mw-purple)` or `#7B2FBE` |
| Threat badges color-only | Keep text labels (already have TSTM/RAIN) — good |

**Fix:** Reduced-motion block in patch CSS.

---

## Pass 9 — "Are there logic bugs that *look* like UI bugs?"

**Duck says:** Yes — NOW marker hour is wrong half the day.

| Issue | Example | Fix |
|-------|---------|-----|
| `nowSlot = Math.round(nowFrac)` | At 2:30 PM, `nowFrac=14.5` → rounds to **15** (3 PM) | Use `Math.floor(nowFrac)` for card/needle |
| Chart NOW line same bug | Vertical line at wrong hour | Same |
| `jumpNow` sets `S.hi=0` when changing days | Lands on midnight not now | Set to `lh` |

**Fix:** JS patch (P0).

---

## Pass 10 — "Does it survive Weebly embed reality?"

**Duck says:** `#mwdb` scoping, `file://` guard, no SW blocking — good.

| Issue | Fix |
|-------|-----|
| Widget may inherit Weebly link styles | `#mwdb a { color: inherit }` where needed — mostly OK |
| `max-width:1040px` but parent may pad | Already `width:100%; min-width:0` — good |
| Chart.js CDN failure | Already handled; consider static fallback message in chart area |

---

## Priority summary

| Priority | Item | Effort |
|----------|------|--------|
| **P0** | `jumpNow` sets hour 0 not current hour | 2 lines JS |
| **P0** | NOW marker uses `round` → should be `floor` | 3 lines JS |
| **P0** | `.mw2-jump-btn.now:hover` CSS typo | 1 line CSS |
| **P0** | Dark scroll fades | ~15 lines CSS |
| **P1** | Focus-visible styles | ~10 lines CSS |
| **P1** | `prefers-reduced-motion` | ~8 lines CSS |
| **P1** | Theme hardcoded grays in legend/detail/chart tabs | ~30 lines CSS |
| **P1** | Footer button touch targets | ~5 lines CSS |
| **P2** | Tab ARIA roles | ~10 lines JS |
| **P2** | Stale data indicator wiring | ~5 lines JS |

---

## Drop-in files

- `mebane-weather-ux-patch.css` — append inside your `<style>` block (or after existing rules)
- JS patches below — search/replace in your `<script>` block
