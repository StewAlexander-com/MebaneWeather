# Mebane Weather Widget — Paste Instructions

## Model Forecast Dashboard

**`mebane-weather-widget.html`** (2,470 lines) — paste into one Weebly Embed Code block.

## Live Radar

**`mebane-weather-radar-widget.html`** (~1,230 lines) — paste into a separate Weebly Embed Code block on your radar page.

## How to paste on MebaneWeather.com (Weebly)

1. Weebly editor → page with the widget
2. Click the **Embed Code** element (or add one: Build → Embed Code)
3. **Select all** existing code in the embed block and delete it
4. Open the appropriate `.html` file → **Cmd+A** → **Cmd+C**
5. Paste into the Weebly Embed Code block
6. **Publish** the site

## Copy from terminal (macOS)

```bash
# Forecast dashboard
pbcopy < "/Users/stewartalexander/Weebly-Updates/mebane-weather-widget.html"

# Live radar
pbcopy < "/Users/stewartalexander/Weebly-Updates/mebane-weather-radar-widget.html"
```

## Do NOT wrap in `<html>` or `<iframe>`

Paste each fragment exactly as-is. Each starts with HTML comments and ends with `</script>`.

## Versions

- Forecast widget: `MWD.version` → **2.1.0**
- Live radar: `MWR.version` → **2.1.0**
