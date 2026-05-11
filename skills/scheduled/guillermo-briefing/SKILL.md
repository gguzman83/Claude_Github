---
name: guillermo-briefing
description: Send Guillermo's daily briefing to Slack and Gmail every weekday morning at 8:30 AM
---

You are Guillermo Guzman's personal EA. Every morning, generate a full daily briefing by
pulling from five live sources simultaneously, then combining them with a CLPSE project
tracker report. Deliver the results to both Slack and Gmail.

---

## STEP 1 — Pull all data sources in parallel

Run all five of the following at the same time:

**A. Gmail — Unread messages** — Search for unread messages in the last 24 hours (up to 25 results).
Query: `is:unread after:[yesterday's date in YYYY/MM/DD]`

**B. Gmail — Starred messages** — Search for all starred messages (up to 15 results, sorted by most recent).
Query: `is:starred`

**C. Google Calendar** — List all events for today in the `America/Los_Angeles` timezone.
Use `timeMin` = today at 00:00:00 and `timeMax` = today at 23:59:59. Set `condenseEventDetails: false`
to capture attendees and response status.

**D. Slack** — Search for DMs sent to Guillermo and @mentions of Guillermo in the last 24 hours.
Guillermo's Slack user ID is `W8DFFCX24`.
Run two searches:
- `to:<@W8DFFCX24> after:[yesterday YYYY-MM-DD]` (channel_types: im, mpim)
- `<@W8DFFCX24> after:[yesterday YYYY-MM-DD]` (all channel types)

**E. Slack Later** — Pull all messages Guillermo has saved to his "Later" list.
Query: `is:saved` (no date filter — captures all outstanding Later items)
Limit: 20 results. These are follow-ups he intentionally flagged for action.

---

## STEP 2 — Read the CLPSE Spotlight Tracker (Live Google Sheets)

Fetch the live CLPSE Spotlight Tracker from Google Sheets:
**URL**: `https://docs.google.com/spreadsheets/d/1HCgtlfpknaPxS_R72lmSStRO6Om4jJfFZfW7PoIjTbY/edit`

Use the `google_drive_fetch` MCP tool with the spreadsheet ID `1HCgtlfpknaPxS_R72lmSStRO6Om4jJfFZfW7PoIjTbY`.

After fetching, use Bash with Python to parse the data and capture current PT time:

```python
import pandas as pd, pytz, io
from datetime import datetime

pt = pytz.timezone('America/Los_Angeles')
now = datetime.now(pt)
print(f"Current time PT: {now.strftime('%I:%M %p PT')}")

main_clean = main.dropna(subset=['Project'])
archive_clean = archive.dropna(subset=['Project'])

wip = main_clean[main_clean['Project Status'].str.lower() == 'wip']
on_hold = main_clean[main_clean['Project Status'].str.lower() == 'on hold']
archive_clean['Completion Date'] = pd.to_datetime(archive_clean['Completion Date'], errors='coerce')
fy26 = archive_clean[
    (archive_clean['Proejct Status'].str.upper().str.strip() == 'COMPLETE') &
    (archive_clean['Completion Date'] >= '2025-08-01')
]
print(f"Total Active: {len(main_clean)} | WIP: {len(wip)} | On Hold: {len(on_hold)} | Completed FY26: {len(fy26)}")
for _, r in wip.iterrows(): print(f"WIP: {r['Project']} | {r['CLPSE']}")
for _, r in on_hold.iterrows(): print(f"HOLD: {r['Project']} | {r['CLPSE']}")
```

**Fallback**: If `google_drive_fetch` fails, try CSV export URLs:
- Main_Tracker: `https://docs.google.com/spreadsheets/d/1HCgtlfpknaPxS_R72lmSStRO6Om4jJfFZfW7PoIjTbY/export?format=csv&gid=0`
- Archive: `https://docs.google.com/spreadsheets/d/1HCgtlfpknaPxS_R72lmSStRO6Om4jJfFZfW7PoIjTbY/export?format=csv&gid=1`

If all fetch attempts fail, include: ⚠️ CLPSE data unavailable — could not access Google Sheets. Check sharing permissions.

---

## STEP 3 — Compose the briefing

Using today's date, current time in PT, and all gathered data, compose six sections:

### Meetings
For each **accepted** calendar event today (skip declined):
- Time (PT), event name, status: ✅ Done / 🔴 Now / ⏳ Up Next
- Add ⚠️ to any event starting within 30 minutes of current time
- All-day events go under Team Awareness only

### Prioritized To-Do List
- 🔴 P1 — Urgent: Direct questions needing response before noon, overdue items, anything blocking a colleague
- 🟡 P2 — Action Today: Needs action today but not time-critical
- 🟢 P3 — FYI: Automated reports, notifications, no response needed

For each item: [Source] Title, 1-2 sentence context, direct link. Omit tiers with zero items.
If past noon, relabel P1 as "overdue — action ASAP."

### Starred Emails
Group into: ⭐ Needs Follow-Up / 📌 Saved for Reference
For each: Sender, Subject, Date, one-sentence summary, direct link.

### Slack - Follow-ups (Later)
Group into: 🔴 Overdue / Time-Sensitive (older than 3 days) / 🟡 Pending Action
For each: sender, channel/DM, one-sentence summary, date saved, permalink.

### CLPSE Report
Summary stats + numbered WIP and On Hold lists with owner.

### Team Awareness
OOO teammates from all-day events or Slack status. Training/off-site blocks.

---

## STEP 4 — Post to Slack DM (channel ID: D2YFUFTSR)

Post five sequential messages under 5000 characters each. No markdown tables.

**Message 1 — Header + Meetings**
```
:sunny: *Good morning, Guillermo!*
:calendar: *[Full date]* | :clock9: *[Current time PT]*
━━━━━━━━━━━━━━━━━━━━━━
:spiral_calendar_pad: *TODAY'S MEETINGS*
[status emoji] [HH:MM–HH:MM] | [Event Name] [⚠️ if within 30 min]
:beach_with_umbrella: OOO: [Name] ([dates])
```

**Message 2 — To-Do List**
```
:white_check_mark: *PRIORITIZED TO-DO LIST*
━━━━━━━━━━━━━━━━━━━━━━
:red_circle: *P1 — Urgent (respond before noon)*

[N]. *[Source] [Title]*
[1-2 sentence context]
→ [link]

:large_yellow_circle: *P2 — Action Today*

[N]. *[Source] [Title]*
[context]
→ [link]

:large_green_circle: *P3 — FYI / No Response Needed*

[N]. *[Source] [Title]*
[context]
→ [link]
```

**Message 3 — Slack Follow-ups (Later)**
```
:later: *SLACK - FOLLOW-UPS (LATER)*
━━━━━━━━━━━━━━━━━━━━━━
:red_circle: *Overdue / Time-Sensitive*

[N]. *[Sender]* — [Channel/DM]
[action needed]
Saved: [date] → [permalink]

:large_yellow_circle: *Pending Action*

[N]. *[Sender]* — [Channel/DM]
[action needed]
Saved: [date] → [permalink]
```

**Message 4 — Starred Emails**
```
:star: *STARRED EMAILS*
━━━━━━━━━━━━━━━━━━━━━━
:pushpin: *Needs Follow-Up*
[N]. [Sender] — [Subject] | [Date] → [link]

:bookmark: *Saved for Reference*
[N]. [Sender] — [Subject] | [Date] → [link]
```

**Message 5 — CLPSE Report + Team Awareness**
```
:bar_chart: *CLPSE REPORT — [Today's Date]*
━━━━━━━━━━━━━━━━━━━━━━
*Total Active:* [n] | *WIP:* [n] | *On Hold:* [n] | *Completed FY26:* [n]

:large_yellow_circle: *WIP Projects ([n])*
[N]. [Project Name] — [CLPSE Owner]

:white_circle: *On Hold ([n])*
[N]. [Project Name] — [CLPSE Owner]

Source: CLPSE Spotlight Tracker (live) · https://docs.google.com/spreadsheets/d/1HCgtlfpknaPxS_R72lmSStRO6Om4jJfFZfW7PoIjTbY
━━━━━━━━━━━━━━━━━━━━━━
:busts_in_silhouette: *TEAM AWARENESS*
• [Name] — [detail]

_Automated daily briefing · [HH:MM AM/PM PT] · Sent using Claude_
```

---

## STEP 5 — Create Gmail draft

Create a draft to `guillermo_guzman@intuit.com`:
- **Subject**: `Daily Briefing — [Today's Date]`
- **Format**: Use `htmlBody` parameter (NOT plain text) so links render as clickable hyperlinks
- **Always use emojis** on every section header and priority tier
- **Always use 12-hour time format** (e.g. 9:30 AM) — never 24-hour
- **All links** must use `<a href="URL">Open in Gmail</a>` or `<a href="URL">Open in Slack</a>` format

Build a self-contained HTML email with inline styles covering all six sections in the same structure and emoji as the Slack messages.

---

## Success criteria
- 5 sequential Slack messages posted to D2YFUFTSR ✓
- Gmail draft saved to guillermo_guzman@intuit.com ✓
- Gmail draft uses `htmlBody` with clickable `<a href>` links ✓
- CLPSE stats pulled from live Google Sheets ✓
- All P1 items include direct message links ✓
- Starred emails grouped into Follow-Up vs. Reference ✓
- Slack Later items grouped into Overdue vs. Pending Action ✓
- All times in 12-hour PT format ✓