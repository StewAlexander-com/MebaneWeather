## Cursor Cloud specific instructions

This is a single-page severe weather monitoring dashboard (`Severe-Weather-Dashboard.html`) for Mebane, NC. No build step, no backend, no database.

### Running the application

Serve with any static HTTP server:
```
python3 -m http.server 8080
```
Then open `http://localhost:8080/Severe-Weather-Dashboard.html`. The dashboard fetches live data from public NOAA/NWS APIs (no keys needed).

### Testing

- **Primary (Python):** `python3 run_tests.py` — 49 tests, no dependencies, runs in <1s
- **Node.js alternative:** `node run-tests.js` — 36 tests, falls back to direct execution if Puppeteer/Chrome unavailable
- **Shell wrapper:** `./run-tests.sh` — tries Python first, then Node.js
- **Browser test suite:** open `http://localhost:8080/test-dashboard.html` — 62 interactive tests with "Run All Tests" button

### Gotchas

- `npm install` downloads Chromium for Puppeteer (~500MB) and can be very slow. Set `PUPPETEER_SKIP_DOWNLOAD=true` to skip if you only need direct test execution.
- The Node.js test runner gracefully falls back to direct logic execution when Puppeteer's browser is unavailable.
- The dashboard uses emoji characters that may render as mojibake (e.g. `âœ…`) in some terminal/font configurations — this is cosmetic only and does not affect functionality.
