---
name: daily-briefing
description: >
  Generates a personalized daily briefing by pulling from Gmail (unread emails + starred),
  Google Calendar (today's meetings), and Slack (DMs, @mentions, and Later/saved items), combines it with a
  live CLPSE project tracker report, then delivers everything as 5 formatted Slack messages
  and a Gmail draft. Use this skill whenever the user asks for a morning briefing, daily
  standup prep, "what do I have today", "catch me up", "what needs my attention", "check
  my messages and meetings", "run my briefing", or any combination of inbox + calendar +
  Slack at once. Trigger even if the user only names two of the three sources — the skill
  fills in all sources by default. Also trigger for follow-up requests like "flag anything
  urgent" or "what needs a response before noon".
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

# Current time
pt = pytz.timezone('America/Los_Angeles')
now = datetime.now(pt)
print(f"Current time PT: {now.strftime('%I:%M %p PT')}")

# Parse sheets from google_drive_fetch content
# Main_Tracker is sheet gid=0, Archive is the second sheet
# Adjust based on the actual content format returned by google_drive_fetch

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

**Fallback**: If `google_drive_fetch` fails, try the CSV export URLs:
- Main_Tracker: `https://docs.google.com/spreadsheets/d/1HCgtlfpknaPxS_R72lmSStRO6Om4jJfFZfW7PoIjTbY/export?format=csv&gid=0`
- Archive: `https://docs.google.com/spreadsheets/d/1HCgtlfpknaPxS_R72lmSStRO6Om4jJfFZfW7PoIjTbY/export?format=csv&gid=1`

Use `web_fetch` to download and parse them as CSV with pandas.

If all fetch attempts fail, include in the briefing:
⚠️ CLPSE data unavailable — could not access Google Sheets. Check sharing permissions.

---

## STEP 3 — Compose the briefing

Using today's date, current time in PT, and all gathered data, compose six sections:

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

### Slack - Follow-ups (Later)
List all items from Step 1E — messages Guillermo saved to Slack Later.
For each item show: sender name, channel/DM context, one-sentence summary of what needs to happen, date saved, and direct permalink.
Group into:
- 🔴 **Overdue / Time-Sensitive**: items older than 3 days or flagged as urgent
- 🟡 **Pending Action**: everything else

If none found: _No items in Slack Later._

### CLPSE Report
Use the extracted data from Step 2. Show summary stats, then numbered WIP and On Hold lists with owner.

### Team Awareness
OOO teammates detected from all-day calendar events or Slack status. Note any training/off-site blocks.

---

## STEP 4 — Post to Slack DM (channel ID: D2YFUFTSR)

Post five sequential messages. Keep each under 5000 characters.
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

Each to-do item must have a blank line before the next one — this makes each item scannable at a glance. Each section header (P1/P2/P3) should have a blank line after it before the first item.

**NUMBERING** — Items within each section are numbered sequentially starting at 1 (i.e., 1., 2., 3...). The number is NEVER replaced with the priority label. P1/P2/P3 labels only appear in the section headers, not in front of individual items.

**SOURCE COLOR CODING** — Prefix every source tag with a colored emoji so Guillermo can visually scan by source type at a glance. Use these consistently with no space between the emoji and the bracket:
- 🔵 for [Email]
- 🟠 for [Calendar]
- 🟣 for [Slack]
- 🔴 for [Slack Later]
- 🟡 for [SNOW] or [Email/SNOW]

**TITLE BOLDING** — Bold the emoji + source tag + title text up to (but NOT including) the — separator. Everything after the — is plain text. This visually separates the "what" from the "who/detail". Format: `*🔵[Email] Subject Title* — remaining description or context label`

```
:white_check_mark: *PRIORITIZED TO-DO LIST*
━━━━━━━━━━━━━━━━━━━━━━
:red_circle: *P1 — Urgent (respond before noon)*

[N]. *🔵[Email] [Title]* — [remaining subject/context label]
[1-2 sentence context]
→ [link]

[N]. *🟣[Slack] [Title]* — [remaining subject/context label]
[1-2 sentence context]
→ [link]

:large_yellow_circle: *P2 — Action Today*

[N]. *🟠[Calendar] [Title]* — [remaining subject/context label]
[1-2 sentence context]
→ [link]

[N]. *🔴[Slack Later] [Title]* — [remaining subject/context label]
[1-2 sentence context]
→ [link]

:large_green_circle: *P3 — FYI / No Response Needed*

[N]. *🟡[SNOW] [Title]* — [remaining subject/context label]
[1 sentence context]
→ [link]
```

**Message 3 — Slack Follow-ups (Later)**
```
:later: *SLACK — FOLLOW-UPS (LATER)*
━━━━━━━━━━━━━━━━━━━━━━
:red_circle: *Overdue / Time-Sensitive*

[N]. *[Sender]* — [Channel/DM]
[1 sentence on what action is needed]
Saved: [date] → [permalink]

:large_yellow_circle: *Pending Action*

[N]. *[Sender]* — [Channel/DM]
[1 sentence on what action is needed]
Saved: [date] → [permalink]
```

**Message 4 — Starred Emails**
```
:star: *STARRED EMAILS*
━━━━━━━━━━━━━━━━━━━━━━
:pushpin: *Needs Follow-Up*
[N]. *[Sender]* — [Subject]
[1 sentence context] | [Date]
→ [link]

:bookmark: *Saved for Reference*
[N]. *[Sender]* — [Subject]
[1 sentence context] | [Date]
→ [link]
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

_Source: CLPSE Spotlight Tracker (live) · https://docs.google.com/spreadsheets/d/1HCgtlfpknaPxS_R72lmSStRO6Om4jJfFZfW7PoIjTbY_
━━━━━━━━━━━━━━━━━━━━━━
:busts_in_silhouette: *TEAM AWARENESS*
• [Name] — [OOO/Training/Off-site detail]

_Automated daily briefing · [HH:MM AM/PM PT] · Sent using Claude_
```

---

## STEP 5 — Create Gmail draft

Create a draft to `guillermo_guzman@intuit.com`:
- **Subject**: `Daily Briefing — [Today's Date, e.g. April 3, 2026]`
- **Format**: Use the `htmlBody` parameter (NOT `body` or `contentType: text/plain`) so all links render as clickable hyperlinks
- **ALWAYS use emojis** throughout — every section header, priority tier, and status indicator should include the same emojis used in the Slack messages (e.g. ☀️, 📅, ✅, 🔴, 🟡, 🟢, ⭐, 📌, 📊, 👥, ⏳, ⚠️, etc.)
- **ALWAYS use 12-hour time format** (e.g. 9:30 AM, 1:45 PM) for ALL times — never use 24-hour format
- **All links must use `<a href="URL">Open in Gmail</a>` or `<a href="URL">Open in Slack</a>` format** — never paste raw URLs

### Gmail HTML structure

Build the htmlBody as a self-contained HTML email using this template:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; max-width: 700px; }
  hr { border: none; border-top: 2px solid #555; margin: 8px 0 12px 0; }
  .section-title { font-weight: bold; font-size: 15px; margin-top: 22px; margin-bottom: 4px; }
  .item { margin: 12px 0 8px 0; }
  .item-title { font-weight: bold; }
  .item-meta { color: #555; font-size: 13px; }
  .p1 { color: #c0392b; font-weight: bold; }
  .p2 { color: #e67e22; font-weight: bold; }
  .p3 { color: #27ae60; font-weight: bold; }
  .overdue { color: #c0392b; font-weight: bold; }
  .pending { color: #e67e22; font-weight: bold; }
  .footer { color: #888; font-size: 12px; margin-top: 24px; border-top: 1px solid #ccc; padding-top: 8px; }
  a { color: #1a73e8; }
</style>
</head>
<body>

<p>☀️ <strong>GOOD MORNING, GUILLERMO!</strong><br>
📅 <strong>[Full Date]</strong> &nbsp;|&nbsp; 🕘 <strong>[Current Time PT]</strong></p>
<hr>

<!-- MEETINGS -->
<p class="section-title">🗓️ TODAY'S MEETINGS</p>
<hr>
<table style="width:100%; border-collapse:collapse;">
  <tr>
    <td style="padding:4px 8px;">[status emoji]</td>
    <td style="padding:4px 8px;"><strong>[HH:MM AM – HH:MM AM]</strong></td>
    <td style="padding:4px 8px;">[Event Name] [⚠️ if within 30 min]</td>
  </tr>
  <!-- repeat for each meeting -->
</table>
<p>🏖️ OOO: [Name] — [dates]</p>

<!-- TO-DO LIST -->
<p class="section-title">✅ PRIORITIZED TO-DO LIST</p>
<hr>
<p class="p1">🔴 P1 — URGENT (respond before noon)</p>
<div class="item">
  <span class="item-title">[N]. [Source] [Title]</span><br>
  [1-2 sentence context]<br>
  → <a href="[URL]">Open in Gmail</a>  <!-- or Open in Slack -->
</div>
<p class="p2">🟡 P2 — ACTION TODAY</p>
<div class="item">
  <span class="item-title">[N]. [Source] [Title]</span><br>
  [context]<br>
  → <a href="[URL]">Open in Gmail</a>
</div>
<p class="p3">🟢 P3 — FYI / NO RESPONSE NEEDED</p>
<div class="item">
  <span class="item-title">[N]. [Source] [Title]</span><br>
  [context]<br>
  → <a href="[URL]">Open in Gmail</a>
</div>

<!-- SLACK LATER -->
<p class="section-title">💬 SLACK — FOLLOW-UPS (LATER)</p>
<hr>
<p class="overdue">🔴 OVERDUE / TIME-SENSITIVE</p>
<div class="item">
  <span class="item-title">[N]. [Sender] — [Channel/DM]</span><br>
  [1 sentence on what action is needed]<br>
  <span class="item-meta">Saved: [date]</span> → <a href="[permalink]">Open in Slack</a>
</div>
<p class="pending">🟡 PENDING ACTION</p>
<div class="item">
  <span class="item-title">[N]. [Sender] — [Channel/DM]</span><br>
  [context]<br>
  <span class="item-meta">Saved: [date]</span> → <a href="[permalink]">Open in Slack</a>
</div>

<!-- STARRED EMAILS -->
<p class="section-title">⭐ STARRED EMAILS</p>
<hr>
<p><strong>📌 NEEDS FOLLOW-UP</strong></p>
<div class="item">
  <span class="item-title">[N]. [Sender] — [Subject]</span><br>
  [1 sentence context] <span class="item-meta">| [Date]</span><br>
  → <a href="[URL]">Open in Gmail</a>
</div>
<p><strong>🔖 SAVED FOR REFERENCE</strong></p>
<div class="item">
  <span class="item-title">[N]. [Sender] — [Subject]</span><br>
  [1 sentence context] <span class="item-meta">| [Date]</span><br>
  → <a href="[URL]">Open in Gmail</a>
</div>

<!-- CLPSE REPORT -->
<p class="section-title">📊 CLPSE REPORT — [Today's Date]</p>
<hr>
<p><strong>Total Active:</strong> [n] &nbsp;|&nbsp; <strong>WIP:</strong> [n] &nbsp;|&nbsp; <strong>On Hold:</strong> [n] &nbsp;|&nbsp; <strong>Completed FY26:</strong> [n]</p>
<p><strong>🟡 WIP Projects</strong></p>
<p>[N]. [Project Name] — [CLPSE Owner]</p>
<p><strong>⚪ On Hold</strong></p>
<p>[N]. [Project Name] — [CLPSE Owner]</p>
<p>Source: <a href="https://docs.google.com/spreadsheets/d/1HCgtlfpknaPxS_R72lmSStRO6Om4jJfFZfW7PoIjTbY">CLPSE Spotlight Tracker (live)</a></p>

<!-- TEAM AWARENESS -->
<p class="section-title">👥 TEAM AWARENESS</p>
<hr>
<p>• <strong>[Name]</strong> — [OOO/Training/Off-site detail]</p>

<p class="footer">Automated daily briefing · [HH:MM AM/PM PT] · Sent using Claude</p>

</body>
</html>
```

---

## Success criteria

- 5 sequential Slack messages posted to D2YFUFTSR ✓
- Gmail draft saved to guillermo_guzman@intuit.com ✓
- Gmail draft uses `htmlBody` with all links as clickable `<a href>` tags ✓
- CLPSE stats pulled from live Google Sheets (not local file) ✓
- All P1 items include direct message links ✓
- Starred emails grouped into Follow-Up vs. Reference ✓
- Slack Later items grouped into Overdue vs. Pending Action ✓
- Gmail draft uses emojis throughout ✓
- Gmail draft uses 12-hour time format for all times ✓
- To-Do List items use source color coding (🔵 Email, 🟠 Calendar, 🟣 Slack, 🔴 Slack Later, 🟡 SNOW) ✓
