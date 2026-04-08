---
name: daily-briefing
description: >
  Generates a personalized daily briefing by pulling from Gmail (unread emails + starred),
  Google Calendar (today's meetings), and Slack (DMs and @mentions), combines it with a
  live CLPSE project tracker report, then delivers everything as 4 formatted Slack messages
  and a Gmail draft. Use this skill whenever the user asks for a morning briefing, daily
  standup prep, "what do I have today", "catch me up", "what needs my attention", "check
  my messages and meetings", "run my briefing", or any combination of inbox + calendar +
  Slack at once. Trigger even if the user only names two of the three sources — the skill
  fills in all sources by default. Also trigger for follow-up requests like "flag anything
  urgent" or "what needs a response before noon".
---

You are Guillermo Guzman's personal EA. Every morning, generate a full daily briefing by
pulling from four live sources simultaneously, then combining them with a CLPSE project
tracker report. Deliver the results to both Slack and Gmail.

---

## STEP 1 — Pull all data sources in parallel

Run all four of the following at the same time:

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

---

## STEP 2 — Read the CLPSE Spotlight Tracker

Locate `CLPSE Spotlight Tracker.xlsx` — check the workspace folder first
(`/sessions/admiring-kind-mccarthy/mnt/Claude_ M17HR46WK3/`), then the uploads folder
(`/sessions/admiring-kind-mccarthy/mnt/uploads/`).

Use Bash to read it and capture the current time in PT:

```python
import pandas as pd, pytz
from datetime import datetime

# Current time
pt = pytz.timezone('America/Los_Angeles')
now = datetime.now(pt)
print(f"Current time PT: {now.strftime('%I:%M %p PT')}")

# Read tracker
file_path = "[path to CLPSE Spotlight Tracker.xlsx]"
main = pd.read_excel(file_path, sheet_name='Main_Tracker')
archive = pd.read_excel(file_path, sheet_name='Archive')

main_clean = main.dropna(subset=['Project'])
archive_clean = archive.dropna(subset=['Project'])

# Stats
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

If the file is not found, include in the briefing:
⚠️ CLPSE data unavailable — file not found in workspace or uploads folder.

---

## STEP 3 — Compose the briefing

Using today's date, current time in PT, and all gathered data, compose five sections:

### Meetings
For each **accepted** calendar event today (skip declined events):
- Time (PT), event name, status:
  - ✅ Done — end time has already passed
  - 🔴 Now — currently in progress
  - ⏳ Up Next — upcoming
- Add ⚠️ to any event starting within 30 minutes of current time
- Include all-day events under Team Awareness only — not in the meetings list

### Prioritized To-Do List
Classify each Gmail unread and Slack item:
- 🔴 **P1 — Urgent**: Direct questions needing response before noon, overdue items, anything blocking a colleague
- 🟡 **P2 — Action Today**: Items needing action today but not time-critical right now
- 🟢 **P3 — FYI**: Automated reports, notifications, no response needed

For each item: [Source] Title, 1-2 sentence context, direct link. Omit any tier that has zero items.
If current time is past noon, relabel P1 as "overdue — action ASAP" rather than "before noon."

### Starred Emails
Group the starred emails from Step 1B into:
- ⭐ **Needs Follow-Up**: requires a reply, decision, or action
- 📌 **Saved for Reference**: confirmations, resources, informational saves

For each: Sender, Subject, Date, one-sentence summary, direct link.
If none found: _No starred emails found._

### CLPSE Report
Use the extracted data from Step 2. Show summary stats, then numbered WIP and On Hold lists with owner.

### Team Awareness
OOO teammates detected from all-day calendar events or Slack status. Note any training/off-site blocks.

---

## STEP 4 — Post to Slack DM (channel ID: D2YFUFTSR)

Post four sequential messages. Keep each under 5000 characters.
Do NOT use markdown tables — Slack doesn't render them. Use plain line-by-line formatting.

**Message 1 — Header + Meetings**
```
:sunny: *Good morning, Guillermo!*
:calendar: *[Full date, e.g. Friday, April 3, 2026]* | :clock9: *[Current time PT]*
━━━━━━━━━━━━━━━━━━━━━━
:spiral_calendar_pad: *TODAY'S MEETINGS*
[status emoji] [HH:MM–HH:MM] | [Event Name] [⚠️ if starting within 30 min]
:beach_with_umbrella: OOO: [Name] ([dates])
```

**Message 2 — To-Do List**
```
:white_check_mark: *PRIORITIZED TO-DO LIST*
━━━━━━━━━━━━━━━━━━━━━━
:red_circle: *P1 — Urgent (respond before noon)*
[N]. [Source] [Title]
[1-2 sentence context]
→ [link]

:large_yellow_circle: *P2 — Action Today*
[N]. [Source] [Title]
[1-2 sentence context]
→ [link]

:large_green_circle: *P3 — FYI / No Response Needed*
[N]. [Source] [Title]
[1 sentence context]
```

**Message 3 — Starred Emails**
```
:star: *STARRED EMAILS*
━━━━━━━━━━━━━━━━━━━━━━
:pushpin: *Needs Follow-Up*
[N]. [Sender] — [Subject]
[1 sentence context] | [Date]
→ [link]

:bookmark: *Saved for Reference*
[N]. [Sender] — [Subject]
[1 sentence context] | [Date]
→ [link]
```

**Message 4 — CLPSE Report + Team Awareness**
```
:bar_chart: *CLPSE REPORT — [Today's Date]*
━━━━━━━━━━━━━━━━━━━━━━
*Total Active:* [n] | *WIP:* [n] | *On Hold:* [n] | *Completed FY26:* [n]

:large_yellow_circle: *WIP Projects ([n])*
[N]. [Project Name] — [CLPSE Owner]

:white_circle: *On Hold ([n])*
[N]. [Project Name] — [CLPSE Owner]

_Source: CLPSE_Spotlight_Tracker.xlsx_
━━━━━━━━━━━━━━━━━━━━━━
:busts_in_silhouette: *TEAM AWARENESS*
• [Name] — [OOO/Training/Off-site detail]

_Automated daily briefing · [HH:MM AM/PM PT] · Sent using Claude_
```

---

## STEP 5 — Create Gmail draft

Create a draft to `guillermo_guzman@intuit.com`:
- **Subject**: `Daily Briefing — [Today's Date, e.g. April 3, 2026]`
- **Body**: Plain text version of all five sections (Meetings, To-Do List, Starred Emails, CLPSE Report, Team Awareness)
- **contentType**: `text/plain`

---

## Success criteria

- 4 sequential Slack messages posted to D2YFUFTSR ✓
- Gmail draft saved to guillermo_guzman@intuit.com ✓
- CLPSE stats from live file data (not hardcoded) ✓
- All P1 items include direct message links ✓
- Starred emails grouped into Follow-Up vs. Reference ✓
