# Mebane Weather Widget — 10-Stage Hardening Pass (v2.1.0)

| Stage | Focus | Changes Applied |
|-------|-------|-----------------|
| **1** | XSS / injection | `esc()` helper; alert names & wxDesc escaped; diag log escaped |
| **2** | Network resilience | `_fetchInFlight` guard; `safeFetch` JSON parse catch; `safeFetchText` for SPC HTML fallback |
| **3** | SPC pipeline | Removed broken fake-Response wrapper; HTML fallback now parses real text |
| **4** | Memory / listeners | `bindScrollRow()` re-binds after `renderTL` recreates `#mwcards`; removes stale listeners |
| **5** | Scheduler health | Single `_schedTimer`; cleared before reschedule; no stacked timeouts |
| **6** | Timezone correctness | `refreshET()` on each fetch; `localETHour()` DRY helper; EST/EDT label (not hardcoded EDT) |
| **7** | Chart robustness | Canvas/context null checks; `_chartFail()` UI if CDN blocked; dark-mode fix `S.ct` not `S.chartTab` |
| **8** | Accessibility | Radar cells `role=button` + keyboard; space `preventDefault` on hour cards |
| **9** | Layout isolation | `contain: layout style` on `#mwdb`; `overflow-anchor: none` |
| **10** | Operability | `MW_VER` / `MWD.version`; `rel="noopener noreferrer"` on alert links |

## Paste file

`mebane-weather-widget.html` — copy entire file into Weebly Embed Code block.
