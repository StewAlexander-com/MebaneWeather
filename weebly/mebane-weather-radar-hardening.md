# Mebane Live Radar Widget — 10-Stage Hardening (v2.1.0)

| Stage | Focus | Changes |
|-------|-------|---------|
| **1** | Embed safety | `file://` guard — no API/map init when opened locally |
| **2** | CDN resilience | Leaflet pinned to **1.9.4**; `onerror` + 30×400ms retry cap; user-facing error |
| **3** | Fetch hardening | `cache:'no-store'`; JSON parse `.catch` on RainViewer response |
| **4** | Cache integrity | `loadRadarCache` rejects entries missing `obj.d` |
| **5** | Init idempotency | `_radarBooted` prevents double map creation |
| **6** | Background tabs | 10-min auto-refresh only when `document.visibilityState === 'visible'` |
| **7** | CSS / a11y | `contain: layout style`; 44px mobile buttons; `:focus-visible`; `prefers-reduced-motion`; dark mode surfaces |
| **8** | Live regions | `aria-live="polite"` on `#timestamp-display` |
| **9** | Public API | `window.MWR` with `version`, `retry`, `refresh`, play/nav helpers |
| **10** | Weebly compat | All original `onclick` globals preserved |

## Paste file

`mebane-weather-radar-widget.html` — entire file into Weebly Embed Code block.

```bash
pbcopy < "/Users/stewartalexander/Weebly-Updates/mebane-weather-radar-widget.html"
```
