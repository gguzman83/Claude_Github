---
name: daily-briefing-guillermo
description: Weekday morning briefing — Gmail + Calendar + Slack + Daily Tasks Doc + Smartsheet CLPSE — posted to Slack DM and saved as Gmail draft
schedule: 8:30 AM, Monday–Friday (cron: 30 8 * * 1-5)
---

You are running Guillermo's daily morning briefing. Pull from all five sources simultaneously and compile into a single structured briefing.

## Sources to pull

**Gmail** — Search: `is:unread after:<yesterday's date>` — up to 25 results

**Google Calendar** — List all events for today (midnight to 23:59 PT). Use condenseEventDetails: false. Skip all-day OOO markers when listing meetings.

**Slack** — Search DMs/group DMs: `to:me after:<yesterday>` with channel_types: im,mpim. Also search @mentions: `@W8DFFCX24 after:<yesterday>` across all channels.

**Daily Tasks Google Doc** — Fetch this doc: https://docs.google.com/document/d/1PRS_iUx0ma6JGt_hJGtAU-oqIgMHpnuLNbILpq9346k/edit — Navigate to the tab matching today's date. Extract only bolded items that are NOT struck through. These are the Day to Day Priorities.

**Smartsheet** — Fetch the Care Launch Requests sheet: https://app.smartsheet.com/sheets/r88mFFmvxcrWcXVQVPRJ648Wj4vXJ9C8p3Qx3fC1 — Extract columns: Request Name, Assigned To (CLPSE), CLPSE Project Status. Always live — never hardcode counts.

---

## Output

Deliver the briefing in TWO ways:
1. Post as a Slack DM to D2YFUFTSR (split into multiple messages if needed — one per section)
2. Create a Gmail draft to guillermo_guzman@intuit.com with subject: "Daily Briefing — [Day, Month Date, Year]"

---

## Slack Formatting Rules (IMPORTANT)

Slack does NOT render markdown tables. Use bullet lists and plain text instead.

BOLD TEXT: The Slack tool uses STANDARD MARKDOWN, not Slack mrkdwn. This means:
- **double asterisks** = bold (ALWAYS use this for bold)
- _single underscores_ = italic
- Single *asterisks* = italic (do NOT use for bold)

CRITICAL BOLD REQUIREMENTS — every one of these must use **double asterisks**:
- Every section emoji header: **🗓️ Today's Meetings**, **✅ Prioritized To-Do List**, **📌 Day to Day Priority**, **📊 CLPSE Project Status**, **👥 Team Awareness**
- Every priority sub-header: **🔴 P1 — Urgent**, **🟡 P2 — Action Today**, **🟢 P3 — FYI / No Response Needed**
- The title line of every numbered item: **1. [ServiceNow] TASK3425795 — Druva Backup Request**
- Sub-section labels: **In Progress**, **On Hold**, **Complete**
- Meeting times: **08:00–08:15**

Other rules:
- Use • for bullet points
- Always put a blank line between every section header and its content
- Always put a blank line between every individual item (each meeting, each to-do, each project)
- Always put a blank line between every major section
- Never use markdown table syntax (no pipe characters for tables) — use bullet lists instead
- Use emoji section headers for visual separation: 🗓️ 📋 📌 📊 👥

---

## Section Format

### **🗓️ Today's Meetings**

For each meeting, one line per meeting with a blank line between each:

**HH:MM–HH:MM** — Event Name (Organizer) 🕓 Up next / 🔴 Now / ✅ Done

[OOO teammates listed after meetings, clearly labeled]

---

### **✅ Prioritized To-Do List**

#### **🔴 P1 — Urgent**

**N. [Source] Short title**
What was asked, who asked it, what action is needed.
→ link

[blank line between each item]

#### **🟡 P2 — Action Today**

**N. [Source] Short title**
Brief context + what to do.
→ link

[blank line between each item]

#### **🟢 P3 — FYI / No Response Needed**

**N. [Source] Short title**
One sentence of context.

[blank line between each item]

---

### **📌 Day to Day Priority**
_Live from Daily Tasks FY26 Q2-Q4 — today's bolded items_

• **Item** — context or sub-bullet if relevant

[blank line between each item]
[Skip struck-through items]

Link: https://docs.google.com/document/d/1PRS_iUx0ma6JGt_hJGtAU-oqIgMHpnuLNbILpq9346k/edit

---

### **📊 CLPSE Project Status**
_Live from Smartsheet — Care Launch Requests_

🟡 In Progress: N
⏸ On Hold: N
✅ Complete: N
❌ Cancelled: N
**Total: N**

**In Progress**
• Project name — CLPSE name

[blank line between each project]

**On Hold**
• Project name — CLPSE name

[blank line between each project]

[Complete and Cancelled are counts only — no detail list]

Link: https://app.smartsheet.com/sheets/r88mFFmvxcrWcXVQVPRJ648Wj4vXJ9C8p3Qx3fC1

---

### **👥 Team Awareness**
• Name — OOO reason + dates (backup contact if known)

---

_Sources: Gmail · Google Calendar · Smartsheet · Daily Tasks Doc_

---

## Briefing Rules
- Lead with most urgent item needing human attention
- Summarize full Slack threads, not just the last message
- ServiceNow emails: include ticket number AND plain-language description
- Flag meetings starting within 30 minutes with 🔴 Now
- Past noon? Reframe P1 as "overdue — action ASAP"
- Skip P3 section if nothing is genuinely FYI-only
- Day to Day Priority: today's tab only, bolded, skip struck-through
- CLPSE counts: always live from Smartsheet fetch, never hardcoded
- Spacing: always a blank line between items, always a blank line between sections — make it easy to scan
