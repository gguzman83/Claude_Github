# How to Make This Dashboard

*Last updated: 2026-05-13*

---

## What this is

The **MTV / SF Frontline Support Team Dashboard** is a single-file HTML app built for Guillermo Guzman, IT Manager for the Techknow Bars in Mountain View and San Francisco. It shows all 8 direct reports as flippable cards with live tenure, contract countdowns, performance metrics, and manager-entered notes — no server, no login, no install required.

Built collaboratively with Claude (Cowork mode). File location:
`Tech Dashboard - MTV/MTV Tech Dashboard.html`

---

## Architecture

Everything is in **one self-contained HTML file**:

- **Player data** — hardcoded in the `ALL_PLAYERS` JavaScript array inside the file
- **Photos** — embedded as base64 strings in the `PLAYER_PHOTOS` object (keyed by player `id`)
- **Manager-entered data** — saved to browser `localStorage` (ratings, readiness, renewal signal, notes, goals)
- **No external dependencies** — opens directly in any browser, no server needed

---

## Player Data Structure

Each person in `ALL_PLAYERS` is a JavaScript object:

```javascript
{
  id: 33,                          // unique number — used as localStorage key
  name: 'Benjamin Leu',
  title: 'Desktop Support Technician II',
  team: 'Service Desk',
  manager: 'Guillermo Guzman',
  workerClass: 'Agency/Temp',      // 'Employee' = FTE green card | 'Agency/Temp' = white card
  location: 'Mountain View, CA',
  tier: 'SD2',                     // badge shown top-right of card
  hireDate: '2024-11-18',          // YYYY-MM-DD — drives live tenure calculation
  endDate: '2027-04-20',           // Agency/Temp only — drives contract countdown
  readiness: '',                   // FTE only — default; overridden via Edit Manager Fields
  nps: 97, tickets: 142, kcs: 8, l2ops: 0,
  strengths: '', devAreas: '', promoCase: '', notes: '',
}
```

**Worker class rules:**
- `'Employee'` → green card (`.card-fte`), Promotion Readiness shown in Edit Manager Fields, appears in Pipeline view
- `'Agency/Temp'` → default white card, contract end date countdown on card front, Renewal Signal in Edit Manager Fields, excluded from Pipeline view

---

## How Tenure Works

```javascript
function calcTenure(hireDateStr) {
  const hire = new Date(hireDateStr);
  const days = Math.floor((new Date() - hire) / 86400000);
  const yrs  = days / 365.25;
  if (yrs >= 1) return (Math.round(yrs * 100) / 100) + ' yr';
  return Math.floor(days / 30.44) + ' mo';
}
```

Called once on load and injected into each player object. **No manual updates needed** — recalculates every time the file is opened. Cards are sorted by tenure (longest = rank 1) by default.

---

## How the Contract Countdown Works

For Agency/Temp employees with an `endDate`:

```javascript
Math.max(0, Math.ceil((new Date(p.endDate) - new Date()) / 86400000))
```

Shown as red text on the card front: `📅 Ends: 04/20/2027 (342 days)`. Also drives the **Contract ending ≤90d** chip in the stat strip.

---

## How Card Color Works

```css
.card-fte .card-face { background: #f0fdf4; border-color: #bbf7d0; }
```

Applied in `buildCard(p)`:
```javascript
const cardClass = p.workerClass === 'Employee' ? 'card-fte' : '';
```

---

## How the Card Badge Works

After a manager sets Promotion Readiness (FTE) or Renewal Signal (Agency/Temp) via Edit Manager Fields, a small pill badge appears next to the person's name on the card front. The logic lives in `buildCard(p)`:

```javascript
const cardSaved = JSON.parse(localStorage.getItem('tic_edit_' + p.id) || 'null') || {};
// FTE: show readiness pill
if (p.workerClass === 'Employee' && cardSaved.readiness) { ... }
// Agency/Temp: show renewal signal pill
else if (p.workerClass !== 'Employee' && cardSaved.renewalSignal) { ... }
```

Color coding:
- **Ready Now** → green | **1-2 years** → yellow | **2+ years** → gray
- **✅ Renew** → green | **🔎 Evaluate** → yellow | **⚠️ Transition** → red

Badge only appears once the manager has explicitly saved a value — it's never auto-populated from the source data.

---

## How Filtering Works

Four state variables control what's visible:

| Variable | Type | What it filters |
|----------|------|-----------------|
| `wcFilter` | `'All'` / `'Employee'` / `'Agency/Temp'` | Worker class tabs |
| `rdnsFilter` | `'All'` / `'Ready Now'` / `'1-2 years'` / `'2+ years'` | Readiness chips in stat strip |
| `actionFilter` | `true` / `false` | Action Needed chip |

All feed into `getVisible()`, which returns the filtered array. `renderGrid()` calls `getVisible()` and re-renders all cards.

---

## How the Stat Strip Works

`renderStatStrip(visible)` runs after every `renderGrid()` call. Chips rendered left to right:

1. **Contract ending ≤90d** (static — only when count > 0)
2. **Ready Now · 1-2 years · 2+ years** (clickable — counts from FTE players in full `RANKED` array)
3. **Action Needed** (clickable — based on `p._risk.css === 'risk-action'`)

Clickable chips: filled/highlighted when active, click again to clear. Clicking calls `setRdnsFilter(val)` or `setActionFilter()`.

**Note:** A `showingHtml` variable is defined inside `renderStatStrip()` but is **not** rendered in the stat strip. The "Showing X of 8 techs" count lives in the `#count-label` div just below the header, which is updated separately inside `renderGrid()`.

---

## How the Dark Mode Toggle Works

The button starts as `🌙 Dark` (page loads in light mode). Clicking switches to dark mode and the label changes to `☀️ Light`. The label always shows what you'll *switch to*, not what you're currently in.

```javascript
function toggleDark() {
  isDark = !isDark;
  document.body.classList.toggle('dark', isDark);
  document.getElementById('dark-toggle').textContent = isDark ? '☀️ Light' : '🌙 Dark';
}
```

Button HTML (initial state):
```html
<button id="dark-toggle" onclick="toggleDark()">🌙 Dark</button>
```

---

## How Edit Manager Fields Works

1. User clicks **View Details** → opens the profile panel
2. User clicks **Edit Manager Fields** → calls `startEditProfile(id)`
3. `startEditProfile()` reads `localStorage`, injects form fields into the panel:
   - **Promotion Readiness** (`edit-readiness`) — injected only when `p.workerClass === 'Employee'`
   - **Renewal Signal** (`edit-renewal-signal`) — injected only when `p.workerClass !== 'Employee'` and `p._cwRenewal` exists
4. User clicks **Save Changes** → calls `saveEditProfile()`
5. `saveEditProfile()` writes to `localStorage` under key `tic_edit_<id>`, then immediately:
   - Updates `p.readiness` on the in-memory player object
   - Re-renders the CW panel with the new renewal signal
   - Calls `renderGrid()` to update card badges
   - Calls `renderStatStrip()` to update counters
   - No close-and-reopen needed

**Promotion Readiness options:** `['— Clear —', 'Ready Now', '1-2 years', '2+ years']`
**Renewal Signal options:** `['— Clear —', '✅ Renew', '🔎 Evaluate', '⚠️ Transition']`

Selecting `— Clear —` removes the saved value from localStorage so no badge appears on the card.

To change these options: find `rdnsOptions` or `renewalOptions` in `startEditProfile()`. Also update `rdnsCss()` and `rdnsIcon()` for readiness label changes.

---

## How the Pipeline View Works

Clicking the **Pipeline** button calls `togglePipelineView()`, which calls `renderPipeline(visible)`:

```javascript
const buckets = { 'Ready Now': [], '1-2 years': [], '2+ years': [] };
visible.filter(p => p.workerClass === 'Employee').forEach(p => {
  (buckets[p.readiness] || buckets['2+ years']).push(p);
});
```

Only FTE employees appear. Agency/Temp are excluded entirely. Any unmapped readiness value falls into the "2+ years" bucket.

---

## How the Renewal Signal Works

For Agency/Temp employees, the **Contract / CW Review Panel** shows a Renewal Signal. It has two layers:

1. **Auto-computed** by `computeCWRenewal(p)` — uses performance score, tenure, and trend data to suggest Renew / Evaluate / Transition
2. **Manager override** — if `localStorage` has `renewalSignal` saved for that player, that value is used instead

The override is set via the **Renewal Signal** dropdown in Edit Manager Fields (Agency/Temp only). Selecting `— Clear —` removes the override and reverts to the auto-calculated value.

---

## How the Compare Selected Button Works

The Compare Selected button is hidden by default (`style="display:none"`). It only appears after you've checked 2 or more cards for comparison. The `updateCompareBtn()` function handles this:

```javascript
btn.style.display = compareIds.length > 0 ? '' : 'none';
```

This keeps the header clean — the button shows up right when you need it and disappears when the selection is cleared.

---

## How to Add a New Team Member

1. Add a new object to `ALL_PLAYERS`:
   ```javascript
   {
     id: 999,                         // pick a unique number
     name: 'First Last',
     title: 'Their Title',
     team: 'Service Desk',
     manager: 'Guillermo Guzman',
     workerClass: 'Employee',         // or 'Agency/Temp'
     location: 'Mountain View, CA',
     tier: 'SD2',
     hireDate: 'YYYY-MM-DD',
     endDate: 'YYYY-MM-DD',           // Agency/Temp only — remove for FTE
     readiness: '',                   // FTE only
     nps: 0, tickets: 0, kcs: 0, l2ops: 0,
     strengths: '', devAreas: '', promoCase: '', notes: '',
   }
   ```
2. Add their photo to `PLAYER_PHOTOS[999]` as a base64 data URI (optional)
3. Save and refresh

---

## How to Update a Person's Info

- **Static info** (name, title, location, hire/end date, worker class): edit their object in `ALL_PLAYERS`
- **Performance metrics** (NPS, tickets, KCS): edit directly or use **Import CSV**
- **Manager-entered data** (readiness, renewal signal, notes, ratings): use **Edit Manager Fields** modal

---

## How Photos Work

Photos live in the `PLAYER_PHOTOS` object at the top of the script, keyed by player `id`:

```javascript
const PLAYER_PHOTOS = {
  33: 'data:image/jpeg;base64,/9j/4AAQ...',
};
```

To add/replace: base64-encode the image file (`base64 -i photo.jpg` in Terminal, or use an online converter), then set `PLAYER_PHOTOS[id] = 'data:image/jpeg;base64,' + result`.

---

## Where Data Lives

| Data | Location | How to back up |
|------|----------|----------------|
| Player info & metrics | `ALL_PLAYERS` array in the HTML | Copy the file |
| Photos | `PLAYER_PHOTOS` object in the HTML | Copy the file |
| Readiness, renewal signal, notes, ratings | Browser `localStorage` (`tic_edit_<id>`) | Scorecard CSV export |

---

## Keeping Docs in Sync

After any change to the dashboard, say **"update doc and how to read"** to run the `dashboard-sync-docs` skill. It re-reads the HTML and rewrites both this document and the "❓ How to Read" modal automatically.
