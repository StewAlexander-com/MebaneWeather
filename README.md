# 🌩️ MebaneWeather.com - Enhanced Severe Weather Dashboard

> 🏠 **Live at:** [MebaneWeather.com](https://www.stewalexander.com/weather.html) - Your trusted source for Mebane, NC weather monitoring!

[![Weebly Compatible](https://img.shields.io/badge/Weebly-Compatible-00A86B?style=flat-square&logo=weebly)](https://www.weebly.com/)
[![NOAA Integration](https://img.shields.io/badge/NOAA-Integrated-0078D4?style=flat-square)](https://www.noaa.gov/)
[![SPC Real-time](https://img.shields.io/badge/SPC-Real--time-FF6B35?style=flat-square)](https://www.spc.noaa.gov/)
[![Mobile Responsive](https://img.shields.io/badge/Mobile-Responsive-28A745?style=flat-square)](https://github.com/StewAlexander-com/mebane-weather-dashboard)

## 🎯 Project Overview

**MebaneWeather.com** features a sophisticated, real-time severe weather monitoring dashboard specifically designed for Mebane, North Carolina (Alamance County). This dashboard integrates official NOAA Storm Prediction Center (SPC) threat assessments with National Weather Service (NWS) alerts and forecast discussions to provide residents with accurate, up-to-date severe weather information.

### 🚀 Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| ⚡ **SPC Threat Integration** | Real-time Storm Prediction Center risk levels | ✅ Active |
| 🎯 **Location-Specific** | Precision targeting for Mebane, NC (36.096°N, -79.267°W) | ✅ Active |
| 📱 **Mobile Responsive** | Optimized for all device sizes | ✅ Active |
| 🔄 **Auto-Refresh** | Updates every 15 minutes with 3-minute alert polling | ✅ Active |
| 🖱️ **Interactive Panels** | Clickable sections linking to official sources | ✅ Active |
| 📝 **Intelligent AFD Summarization** | Extracts key severe weather highlights from forecast discussions | ✅ Active |
| 🌐 **Weebly Optimized** | Self-contained HTML for easy Weebly integration | ✅ Active |

## 📑 Table of Contents

- [Smart Threat Assessment](#-smart-threat-assessment)
- [Technical Architecture](#-technical-architecture)
- [Installation & Configuration](#-installation--configuration)
- [Troubleshooting](#-troubleshooting)
- [Testing](#-testing)
- [Browser Compatibility](#-browser-compatibility)
- [Code Documentation](#-code-documentation)
- [Contributing](#-contributing)
- [License & Project Info](#-license--project-info)
- [Emergency Weather Information](#-emergency-weather-information)

## 🛡️ Smart Threat Assessment

The dashboard uses a four-tier threat classification system with priority-based evaluation:

| Threat Level | Icon | Color | Description | Trigger |
|--------------|------|-------|-------------|---------|
| **WARNING** | ⚠️ | 🔴 Red | Active weather warnings in effect | Active NWS warnings |
| **CAUTION** | ⚡ | 🟠 Orange | Elevated severe weather risk | SPC Enhanced/Moderate/High risk |
| **MONITOR** | □ | 🟡 Yellow | Monitor conditions for development | SPC Marginal/Slight risk |
| **SAFE** | ✅ | 🟢 Green | No severe weather expected | No warnings, no SPC risk |

**Priority**: Warnings override all other indicators, followed by elevated SPC risks (CAUTION), then lower risks (MONITOR).

**SPC Risk Categories**: TSTM, MRGL, SLGT, ENH, MDT, HIGH - Maps official Storm Prediction Center outlook levels with intelligent forecast discussion summarization.

## 🔧 Technical Architecture

### API Integrations

1. **SPC GIS MapServer** - Storm threat polygons via point-in-polygon spatial analysis (Mebane coordinates)
2. **NWS Alerts API** - Zone-specific alerts (NCZ023) with statewide fallback, filtered for warnings/watches/advisories
3. **NWS Forecast Discussion** - AFD from NWS Raleigh (RAH) with intelligent text processing and summarization

### Update Cycle

**Dual-interval strategy:**
- **Full Refresh**: Every 15 minutes - SPC risk, alerts, forecast discussion, threat level calculation
- **Fast Alert Polling**: Every 3 minutes - Immediate warning detection triggers threat update
- **Visibility Refresh**: Updates when browser tab regains focus after inactivity

**Data Flow**: Initialize → SPC Risk Check → Alert Processing (zone → statewide fallback) → Threat Calculation → AFD Processing → UI Update

## 🚀 Installation & Configuration

### Quick Install (Weebly)

1. Log into Weebly Editor → Drag "Embed Code" element to page
2. Copy entire code from `Severe-Weather-Dashboard.html`
3. Paste into Custom HTML box → Click "Update" → Publish

**Other Platforms**: WordPress (HTML widget), Squarespace (Code block), Wix (HTML iframe), Static HTML (direct include), GitHub Pages (reference in page)

### Customization

**Location**: Update coordinates and NWS zone code
```javascript
const coords = { lat: 36.096, lng: -79.267 }; // Mebane, NC
// Also update: api.weather.gov/alerts/active?zone=YOUR_ZONE
```

**Update Intervals**: Modify `updateInterval` (default: 900000ms = 15min) and alert polling (default: 180000ms = 3min)

**Visual Styling**: Edit inline CSS - Backgrounds (`#1a1a1a`, `#2d2d2d`, `#373737`), Accent colors (primary `#4fc3f7`, warning `#f44336`, etc.)

**Advanced**: Modify alert filtering in `updateLocalAlertsAndGetStatus()` or AFD scoring in `updateForecastDiscussion()`

## 🔍 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "SPC: Data temporarily unavailable" | Wait 15min auto-retry, check console - defaults to SAFE if unavailable |
| "Loading threat assessment..." persists | Check console (F12) for JS errors, verify code embedding, check browser compatibility |
| Not responsive on mobile | Code includes `!important` overrides - check responsive breakpoints if issues persist |
| Alerts not updating quickly | Alert polling is 3min - adjust `180000ms` interval if needed (mind API rate limits) |
| "No significant weather" in AFD | Check console for fetch errors - scoring algorithm requires specific keywords |

**Debug Mode**: Open Developer Tools (F12) → Console tab shows SPC detection, API responses, alert processing, update timing, and errors.

**Verify Functionality**: Check console for fetch requests to `mapservices.weather.noaa.gov`, `api.weather.gov`, `forecast.weather.gov`. Compare threat level with [SPC outlook](https://www.spc.noaa.gov/products/outlook/).

## 🧪 Testing

**Quick Start:**
```bash
./run-tests.sh  # or: python3 run_tests.py
```

**Test Coverage (21 tests)**: SPC Risk Mapping (7), Threat Level Calculation (7), Alert Processing (3), Error Handling (4)

**Test Files**: `run_tests.py` (Python, primary), `run-tests.js` (Node.js, optional), `run-tests.sh` (shell wrapper), `test-dashboard.html` (browser test suite)

**Approach**: Elegant, conservative, mock-based tests focusing on critical business logic. Fast execution (<1s) with colored terminal output. For visual verification, open `test-dashboard.html` in browser.

## 🌐 Browser Compatibility

**Supported**: Chrome, Firefox, Safari (iOS 12+), Edge - Full desktop & mobile support  
**Not Supported**: IE 11 (requires ES6+, Fetch API, CSS Grid, AbortController)

## 📝 Code Documentation

Comprehensive inline documentation in docstring style: File headers, JSDoc-style function docs, section comments, and inline explanations covering threat level hierarchy, alert filtering, AFD processing, polling intervals, and error handling.

## 🤝 Contributing

**Development**: Fork → Clone → Make changes → Test thoroughly → Submit PR with detailed description

**Guidelines**: Maintain weather data accuracy, preserve responsive design, keep code lightweight, follow documentation style, include error handling, test on multiple browsers/devices.

**Feature Requests**: Open issue with clear description, use case, implementation suggestions, and impact assessment.

**Bug Reports**: Include browser/version, steps to reproduce, expected vs actual behavior, console errors, and screenshots.

## 📜 License & Project Info

**License**: MIT License - see [LICENSE](LICENSE) file for details

**Project Stats**: Created June 2025 • Last Updated December 2024 • Location: Mebane, NC (Alamance County, Zone NCZ023) • NWS Office: Raleigh, NC (RAH) • Maintainer: [@StewAlexander-com](https://github.com/StewAlexander-com)

**Acknowledgments**: NOAA/National Weather Service, Storm Prediction Center, Weebly Platform

**Live Site**: [MebaneWeather.com](https://www.stewalexander.com/weather.html)

## 🚨 Emergency Weather Information

**⚠️ IMPORTANT**: This dashboard is for informational purposes only. For official warnings and emergency information, consult: [National Weather Service](https://weather.gov), Emergency Alert System (local radio/TV), Wireless Emergency Alerts, Local Emergency Management, [Storm Prediction Center](https://www.spc.noaa.gov)

**In case of severe weather**: Follow local authority instructions, seek immediate shelter if warnings issued, monitor multiple sources, have an emergency plan ready.

---

*Built with ❤️ for the Mebane, NC community*