# Mebane Live Radar Widget — Hardening notes

## v2.1.1 — Safari PWA fullscreen fix

| Pass | Finding | Fix |
|------|---------|-----|
| **1** | `contain: layout` on `.mw-radar-wrap` (from v2.1.0 hardening) creates a containing block. iOS/PWA fullscreen uses `position: fixed`, which then only fills the embed box — desktop Fullscreen API still works (top layer). | Removed `contain: layout style`; keep `overflow-anchor: none` only |
| **2** | Weebly parents often use `overflow: hidden` / transforms, which also trap `position: fixed` | Reparent `#map-container` to `document.body` while CSS fullscreen is open; restore on exit |
| **3** | UA-only `/iPhone\|iPad/` misses iPad desktop mode + `navigator.standalone` PWAs | `needsCssFullscreen()` covers iOS UA, iPadOS touch Mac, standalone display-mode, Safari+touch |

Also: `100dvh` / `100dvw`, body scroll lock (`mw-radar-fs-open`), higher z-index.

## v2.1.0 — original hardening

| Stage | Focus | Changes |
|-------|-------|---------|
| **1** | Embed safety | `file://` guard |
| **2** | CDN | Leaflet pinned 1.9.4; retry/onerror |
| **3** | Fetch | `cache:'no-store'`; JSON parse catch |
| **4** | Cache | validate `obj.d` |
| **5** | Init | `_radarBooted` |
| **6** | Tabs | refresh only when visible |
| **7** | CSS / a11y | 44px targets, focus-visible, reduced motion, dark mode (**layout contain reverted in 2.1.1**) |
| **8** | Live regions | `aria-live` on timestamp |
| **9** | API | `window.MWR` |
| **10** | Weebly | onclick globals preserved |

## Paste

`mebane-weather-radar-widget.html` → Weebly Embed Code (radar page).
