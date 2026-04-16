---
name: daily-briefing-guillermo
description: Used to send me important updates and things that need to be followed up
---

You are running Guillermo's daily morning briefing. The user is not present — execute autonomously without asking clarifying questions.

## Fetch Strategy (IMPORTANT — follow this order to avoid timeouts)

**Step 1 — Fetch the Daily Tasks Google Doc first, alone:**
Fetch: https://docs.google.com/document/d/1PRS_iUx0ma6JGt_hJGtAU-oqIgMHpnuLNbILpq9346k/edit
Navigate to the tab matching today's date. Extract only bolded items that are NOT struck through. These are the Day to Day Priorities.
Wait for this to complete before proceeding.

**Step 2 — Then fetch these four sources in parallel:**
- **Gmail** — Search: `is:unread after:<yesterday's date>` — up to 25 results
- **Google Calendar** — List all events for today (midnight to 23:59 PT). Use condenseEventDetails: false. Skip all-day OOO markers when listing meetings.
- **Slack DMs** — Search: `to:me after:<yesterday>` with channel_types: im,mpim
- **Slack @mentions** — Search: `@W8DFFCX24 after:<yesterday>` across all channels
- **Smartsheet** — Fetch the Care Launch Requests sheet: https://app.smartsheet.com/sheets/r88mFFmvxcrWcXVQVPRJ648Wj4vXJ9C8p3Qx3fC1 — Extract columns: Request Name, Assigned To (CLPSE), CLPSE Project Status. Always live — never hardcode counts.

---

## Error Handling — IMPORTANT

If any data source fails (connection error, tool error, timeout, stale connector, etc.):

1. In the briefing, include ONE brief line for that source only: `⚠️ [Source] unavailable — retry scheduled.`
2. After sending the briefing, create a one-time retry scheduled task for each failed source using `create_scheduled_task`, firing 15 minutes from now.

Use this prompt template for the retry task (fill in the bracketed fields):

```
BRIEFING RETRY — [SOURCE NAME]
Attempt: 1 of 8
Original briefing date: [YYYY-MM-DD]

Your only job is to fetch [SOURCE NAME] and, if successful, send a SHORT Slack update to D2YFUFTSR. Do NOT resend the full briefing.

FETCH INSTRUCTIONS:
[Copy the exact fetch instructions for this source from the main briefing — e.g. for Google Calendar: list all events for [date] in America/Los_Angeles, timeMin=[date]T00:00:00, timeMax=[date]T23:59:59, condenseEventDetails:false, skip all-day OOO markers. For Gmail: search is:unread after:[date]. For Slack DMs: to:me after:[date] channel_types im,mpim. For Smartsheet: fetch https://app.smartsheet.com/sheets/r88mFFmvxcrWcXVQVPRJ648Wj4vXJ9C8p3Qx3fC1 columns Request Name / Assigned To (CLPSE) / CLPSE Project Status.]

IF FETCH SUCCEEDS:
Post one Slack message to D2YFUFTSR:

  📡 **Briefing Update — [Source Name] (retrieved [HH:MM AM PT])**
  _Update to your [Day, Month Date] morning briefing_

  [Formatted section — same style as main briefing section for this source]

Then stop. Do not create another retry task.

IF FETCH FAILS AND ATTEMPT < 8:
Do not post to Slack. Create a new one-time scheduled task with the same prompt but with Attempt incremented by 1 and fireAt 15 minutes from now. Use taskId: briefing-retry-[source-slug]-[YYYY-MM-DD]-[N+1]
Then stop.

IF ATTEMPT = 8 AND STILL FAILING:
Post one Slack message to D2YFUFTSR:
  ⚠️ **Briefing Update — [Source Name] still unavailable**
  _Tried 8 times over ~2 hours. Check manually._
Then stop. Do not create another retry task.
```

Retry task naming: `briefing-retry-gcal-[YYYY-MM-DD]`, `briefing-retry-gmail-[YYYY-MM-DD]`, `briefing-retry-slack-[YYYY-MM-DD]`, `briefing-retry-smartsheet-[YYYY-MM-DD]`, `briefing-retry-dailytasks-[YYYY-MM-DD]`

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

_Sources: Gmail · Google Calendar · Slack · Smartsheet · Daily Tasks Doc_

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
- If the Daily Tasks Google Doc times out despite being fetched first and alone, note it clearly in the briefing, include the direct link, and create a retry task
- Any failed source: one-line note in briefing + retry task created immediately after sending