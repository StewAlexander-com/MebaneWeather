# Resilience, Availability, and Accuracy Assessment

This document evaluates the Mebane Weather widget using **SNR (signal-to-noise ratio)** and **normal-distribution** reasoning for resilience, availability, and accuracy.

---

## 1. SNR (Signal-to-Noise Ratio)

**Definitions in this context**
- **Signal**: Correct, timely data; clear source attribution; unambiguous state (live vs cached); useful timestamps and age.
- **Noise**: Misleading status, stale data presented as live, redundant or confusing messages, wrong “Updated” when showing cache.

### Signal (high)
- **Live vs cached**: Status bar and dot show “Live” only on successful fetch; “Cached data” when showing cache; “Retrying… (n/3)” during retries; “Offline” when `navigator.onLine` is false.
- **Timestamp**: “Updated HH:MM” only when state is success; when cached, status bar shows “X min ago” / “X hr ago” (no “Updated”).
- **Stale banner**: Explicit “Showing cached data (X min/hr old) — live fetch failed. Verify at source links below.”
- **Sources**: Single audit trail in footer; each card/section links to NWS/SPC; “Verify at weather.gov” / “Verify at spc.noaa.gov” for alerts/SPC.
- **No mixed-state lie**: We never show “Live” while displaying cached weather; “Updated” is cleared when not success.

### Noise (minimized)
- **No stale “Updated”**: When state is error/loading, the “Updated” field is cleared so an old time is not shown.
- **Cache age in status bar**: When showing cached data, the right side of the status bar shows “X min ago” / “X hr ago” so age is visible at a glance.
- **Retries**: Message is clear (“Retrying… (1/3)”) and does not imply success.

**SNR conclusion**: Signal is strong and noise is low. The UI state (live/cached/retrying/offline) and data age are unambiguous, which supports **high effective accuracy** (user knows when to trust or discount the numbers).

---

## 2. Normal-Distribution View (Resilience & Availability)

### Latency and timeouts
- Assume request latency *L* is roughly normal: *L* ~ N(μ, σ²). Typical μ might be 1–3 s, σ 1–2 s.
- **Timeouts**: First attempt 10 s; retries use 13 s, 16 s (capped at 25 s). So we allow out to ~μ + several σ before aborting, which handles the right tail of slow networks.
- **Retries**: Three attempts with exponential backoff + jitter give three roughly independent draws; P(at least one success) = 1 − (1−p)³, where *p* = P(*L* < timeout). This raises effective availability versus a single attempt.

### Failure rate and availability
- Over many requests, success rate behaves like a proportion. **Caching** shifts “user-observable” availability:
  - **Effective availability** ≈ P(fetch OK) + P(fetch fail) × P(has valid cache).
- So even when the network fails (low *p*), the user still sees useful data if cache exists (2 h for weather, 30 min SPC, 10 min NWS), and status clearly says “Cached data” and age.
- **Alerts/SPC**: Refreshed every 3 min independently of main weather, so when weather is cached, alerts/SPC can still be fresh—improving perceived availability for critical information.

### Backoff and jitter
- **Exponential backoff** (2^attempt, capped) spaces retries so we don’t hammer a struggling server; under high load or bad network, later attempts have a better chance.
- **Jitter** (e.g. 80–120% of delay) avoids synchronized retries across many clients (e.g. after an outage), which would create a thundering herd and add variance to load.

**Normal-distribution conclusion**: Timeouts and retries are aligned with a typical latency distribution; caching and independent alerts/SPC refresh improve the **distribution of outcomes** the user sees (more often “useful data” and “correct state”), supporting **high resilience and availability**.

---

## 3. Accuracy

- **Source accuracy**: Temperature, 7-day, and conditions come from Open-Meteo; alerts from NWS; convective outlook from SPC. We do not alter values; we only display and attribute.
- **Our contribution to accuracy**:
  - Correct labels and links (no mixing of sources).
  - **Disclosure of state**: Live vs cached and age (X min/hr ago) so the user can mentally discount cached data (e.g. treat as “about that old”).
  - Footer and per-section links allow verification at source (audit trail).
- **Limits**: Accuracy of the numbers themselves is determined by Open-Meteo/NWS/SPC and their models; we only ensure that what we show is **correctly attributed and not misrepresented as fresher than it is**.

**Accuracy conclusion**: Results are **highly accurate in the sense that** (1) we display source data without corruption, (2) we clearly separate live vs cached and show age, and (3) we support verification at source. So from an SNR and disclosure perspective, the system is **highly accurate**; absolute numerical accuracy is inherited from the upstream providers.

---

## 4. Summary Table

| Dimension       | SNR / distribution view | Assessment |
|----------------|--------------------------|------------|
| **Resilience** | Retries, backoff, jitter, timeouts aligned with latency tail; cache and alerts/SPC refresh reduce impact of failures | **High**   |
| **Availability** | Effective availability = P(fetch OK) + P(fail)×P(cache); clear state and age; no false “Live” | **High**   |
| **Accuracy**   | Correct attribution; live vs cached and age disclosed; audit trail and source links | **High**   |

---

## 5. Code Change (This Session)

- **Status bar when cached**: When showing cached data, the status bar no longer leaves a stale “Updated HH:MM” from the last success. It either shows “X min ago” / “X hr ago” (set in `showStale`) or is cleared when status is not success and not “Cached data.” This improves **SNR** by removing misleading “live” timestamps when the data is cached.
