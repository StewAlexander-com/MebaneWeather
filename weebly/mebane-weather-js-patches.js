/* ═══════════════════════════════════════════════════════════════════════════
   Mebane Weather Widget — JS patches (search/replace in <script> block)
   ═══════════════════════════════════════════════════════════════════════════ */

// ── PATCH 1 (P0): NOW hour — use floor, not round ─────────────────────────
// In buildCards(), replace:
//   var nowSlot = (nowFrac!=null && nowFrac>=0) ? Math.round(nowFrac) : -1;
// With:
var nowSlot = (nowFrac != null && nowFrac >= 0) ? Math.floor(nowFrac) : -1;

// In renderRadar(), replace:
//   var nowSlotIdx=(nowFrac>=0)?Math.round(nowFrac):-1;
// With:
var nowSlotIdx = (nowFrac >= 0) ? Math.floor(nowFrac) : -1;

// In renderChart() nowLinePlugin, replace:
//   var nowIdx=Math.round(nowF);
// With:
var nowIdx = Math.floor(nowF);


// ── PATCH 2 (P0): jumpNow — land on current hour, not midnight ──────────────
// Replace entire jumpNow function with:
function jumpNow() {
  var etStr = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    hour12: false
  });
  var lh = parseInt(etStr, 10) % 24;

  if (S.di !== 0) {
    S.di = 0;
    S.hi = lh;  // was 0 — caused jump to midnight
    buildTabs();
    renderDay();
  } else {
    selectH(lh);
  }
  jumpCards(lh);
}


// ── PATCH 3 (P1): Day tab + chart tab ARIA ──────────────────────────────────
// In buildTabs(), after b.textContent=lbl:
b.setAttribute('role', 'tab');
b.setAttribute('aria-selected', i === S.di ? 'true' : 'false');

// Wrap mwdtabs once on first build (in buildTabs before forEach):
// if (!c.getAttribute('role')) c.setAttribute('role', 'tablist');

// In setChart(), add:
document.querySelectorAll('.mw2-ctab').forEach(function (t) {
  t.setAttribute('role', 'tab');
  t.setAttribute('aria-selected', t.dataset.c === type ? 'true' : 'false');
});


// ── PATCH 4 (P1): Live regions for dynamic text ─────────────────────────────
// In HTML, add to #mwalertxt parent or span:
//   id="mwalertxt" aria-live="polite"
// Add to #mwts:
//   aria-live="polite"


// ── PATCH 5 (P1): Show stale indicator when data is old ─────────────────────
// In fetchAll(), after setting $('mwts').textContent, add:
if (r1 && r1.properties && r1.properties.updateTime) {
  var nwsUT = new Date(r1.properties.updateTime);
  var ageMin = Math.round((now - nwsUT) / 60000);
  var staleEl = $('mwstale');
  if (staleEl) staleEl.style.display = ageMin > 90 ? 'inline-block' : 'none';
}


// ── PATCH 6 (P2): Safer horizontal scroll step ──────────────────────────────
// Replace scrollRow inner step calculation:
function scrollRow(id, steps) {
  var el = document.getElementById(id);
  if (!el) return;
  var card = el.querySelector('.mw2-hcard, .mw2-dtab, .mw2-rcell');
  var gap = parseFloat(getComputedStyle(el).gap) || 7;
  var step = card ? card.offsetWidth + gap : el.clientWidth * 0.75;
  el.scrollBy({ left: steps * step, behavior: 'smooth' });
}
