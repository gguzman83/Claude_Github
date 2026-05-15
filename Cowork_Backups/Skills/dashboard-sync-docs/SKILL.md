---
name: dashboard-sync-docs
description: |
  Keeps the MTV Tech Dashboard documentation in sync after any change is made. Updates the "? How to Read" help modal inside the HTML file AND regenerates the "How to Make This Dashboard.md" reference guide. Trigger this skill whenever the user makes any change to the MTV Tech Dashboard (filters, cards, stat strip, edit fields, colors, layout, counters, etc.), whenever the user says "update the docs", "sync the docs", "update how to read", "update the guide", or similar, or at the end of any session where the dashboard HTML was edited. When in doubt, trigger — keeping the docs in sync is always better than letting them drift.
---

# Dashboard Sync Docs Skill

After any change to the MTV Tech Dashboard, this skill:
1. Reads the live HTML file and infers the current feature set from the actual code
2. Rewrites the "? How to Read" help modal content to match reality
3. Creates/overwrites **How to Make This Dashboard.md** in the workspace

---

## Files

- **Dashboard HTML**: `/sessions/gifted-kind-hawking/mnt/Tech Dashboard - MTV/MTV Tech Dashboard.html`
- **How to Make doc**: `/sessions/gifted-kind-hawking/mnt/Tech Dashboard - MTV/How to Make This Dashboard.md`

---

## Step 1 — Read and analyze the dashboard

Read the full HTML file. Extract the current state of:

| Area | What to look for |
|------|-----------------|
| Filter bar | Tab buttons (`setWcFilter`), any dropdowns or toggles |
| Stat strip | All chips in `renderStatStrip()` — which are static, which call a filter function on click |
| Card front | Fields rendered in `buildCard(p)` — photo, name, title, tenure, location, manager, end date countdown, rank badge, star |
| Card back | Tabs/sections in the detail panel |
| Edit Manager Fields | Everything injected by `startEditProfile()` — which fields, which are FTE-only vs all |
| Sort options | `<select id="sort-select">` option values |
| Special features | Compare mode, Pipeline view, Focus List, Import/Export buttons |
| Worker class logic | How `workerClass === 'Employee'` vs `'Agency/Temp'` changes what's shown |

Pay attention to **conditional rendering** — a feature that only appears for FTE employees or only when a counter > 0 is worth calling out explicitly in the docs.

---

## Step 2 — Rewrite the "? How to Read" modal

Find the `openHelp()` function and the modal it builds. The help content lives inside divs with class `help-section`. 

**How to replace**: Find the first `<div class="help-section">` occurrence inside the help modal and the closing structure. Replace everything between the modal's opening content area and its back-to-top/close buttons with the fresh content below.

Build the new help content using only features that are actually present in the HTML. Write it in warm, practical language — this is Guillermo's personal team tool, not a generic product manual.

### Required sections (include only what exists):

**🃏 Card Front**
- What each visible field means (rank badge, photo, name, title, tenure, location, manager)
- Green card = FTE employee; white/default = Agency/Temp
- End date countdown (Agency/Temp only) — what the red text means
- Star button — what it does (Focus List)

**📍 Stat Strip**
- List every chip: label, what the count represents, whether clicking filters the grid
- Note that clickable chips highlight when active and can be clicked again to clear

**🔍 Filters**
- All / Employee / Agency/Temp tabs
- Any other active filter controls

**✏️ Edit Manager Fields**
- How to open (View Details → Edit Manager Fields button)
- Fields available for all workers vs FTE-only (e.g. Promotion Readiness)
- Where data is stored (browser localStorage) and how to back it up (Scorecard CSV)

**⚖ Compare** (if present)
- How to select 2–5 cards and open side-by-side view

**🏗 Pipeline View** (if present)
- What it shows, when to use it

Keep each bullet to 1–2 sentences. No jargon. End with a one-line note about localStorage persistence.

---

## Step 3 — Write "How to Make This Dashboard.md"

This is a technical reference Guillermo can use to understand how the dashboard was built and how to make changes confidently. Write it as if explaining to a smart non-developer who built this with Claude's help and wants to understand it well enough to maintain it.

### Document structure:

```
# How to Make This Dashboard

## What this is
Brief description of the dashboard's purpose and who it's for.

## Architecture
- Single self-contained HTML file — no server, no database, no install
- All player data lives in the `ALL_PLAYERS` JavaScript array inside the file
- Manager-entered data (ratings, notes, readiness) is saved in browser localStorage
- Photos are embedded as base64 strings in the `PLAYER_PHOTOS` object

## Player Data Structure
Explain each field in a player object:
- id, name, title, team, manager, workerClass, location
- hireDate (YYYY-MM-DD) — used to calculate live tenure
- endDate (YYYY-MM-DD, Agency/Temp only) — drives the countdown
- readiness (FTE only) — set via Edit Manager Fields
- Any other fields present

## How Tenure Works
Explain calcTenure(hireDateStr) — reads hire date daily, no manual updates needed.

## How the Card Color Works
FTE = Employee workerClass → light green (.card-fte). Agency/Temp = default white.

## How Filtering Works
State variables (wcFilter, rdnsFilter, actionFilter) → getVisible() applies them → renderGrid() re-renders.

## How the Stat Strip Works
renderStatStrip() counts from RANKED array, renders static + clickable chips.

## Edit Manager Fields
startEditProfile() → injects form fields → saveEditProfile() → persists to localStorage.
Promotion Readiness only shown when p.workerClass === 'Employee'.

## How to Add a New Team Member
Step-by-step:
1. Add a new object to ALL_PLAYERS with all required fields
2. Add their photo to PLAYER_PHOTOS[id] as a base64 data URI (or use the default)
3. If FTE: set workerClass to 'Employee'; if contractor: 'Agency/Temp' + add endDate
4. Save the file

## How to Update a Person's Info
Edit their object in ALL_PLAYERS directly. For things like readiness or notes that
are manager-entered, use the Edit Manager Fields modal instead (saves to localStorage).

## How to Change the Promotion Readiness Options
Find the rdnsOptions array in startEditProfile() and update the values.
Also update rdnsCss() and rdnsIcon() to match the new labels.

## Where Data Lives
- Static player info: ALL_PLAYERS array in the HTML file
- Manager-entered data: browser localStorage (key: tic_edit_<player_id>)
- To back up: use the Scorecard CSV export button
- To move to a new browser: export and re-import

## Tips for Making Changes
- Always work on a copy first
- Search for the player's `id` to find all references
- After any UI change, run the dashboard-sync-docs skill to keep docs current
```

Fill in each section with specifics from the actual file — real field names, real function names, real CSS class names. This should read like a map of the actual code, not a generic how-to.

---

## After completing both updates

Tell the user:
- ✅ "? How to Read" modal updated in the HTML
- ✅ How to Make This Dashboard.md saved to your workspace folder
- Call out anything you found that was previously undocumented or worth flagging
