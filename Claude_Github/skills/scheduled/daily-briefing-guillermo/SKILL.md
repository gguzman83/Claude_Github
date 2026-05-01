---
name: daily-briefing-guillermo
description: Send daily briefing report to gmail and Slack
---

You are running Guillermo's daily morning briefing. The user is not present — execute autonomously without asking clarifying questions.

---

## Fetch Strategy — ALL SOURCES IN PARALLEL

Fetch all of the following simultaneously in a single tool call batch. Do NOT wait for any one source before starting others.

- **Daily Tasks Google Doc** — Fetch file ID `1PRS_iUx0ma6JGt_hJGtAU-oqIgMHpnuLNbILpq9346k` using the Google Drive read_file_content tool. ⚠️ This doc is very large and will almost always overflow context — the tool will return an error saying the result was saved to a file path. When that happens, IMMEDIATELY run a Bash python3 script to open the saved JSON file, read `data['fileContent']`, split on newlines, find the section header matching today's date (look for `# **[Weekday, Month Day]**`), and extract all lines between that header and the next `#` header that contain `**bold**` text and are NOT struck through. If today has no section yet, use the most recent dated section. Return the bolded items as a list.
- **Gmail Unread** — Search: `is:unread after:<yesterday's date>` — up to 25 results
- **Gmail Starred** — Search: `is:starred` — up to 15 results, sorted by most recent
- **Google Calendar** — List all events for today (midnight to 23:59 PT). timeZone: America/Los_Angeles. condenseEventDetails: false. Skip all-day OOO markers when listing meetings.
- **Slack DMs** — Search: `to:me after:<yesterday>` with channel_types: im,mpim — up to 20 results
- **Slack @mentions** — Search: `@W8DFFCX24 after:<yesterday>` across all channels — up to 20 results
- **Slack Later** — Search: `is:saved` (no date filter). Limit: 20 results.
- **Smartsheet** — Fetch the Care Launch Requests sheet: https://app.smartsheet.com/sheets/r88mFFmvxcrWcXVQVPRJ648Wj4vXJ9C8p3Qx3fC1 — Extract columns: Request Name, Assigned To (CLPSE), CLPSE Project Status. Always live — never hardcode counts.

---

## Error Handling — IMPORTANT

If any data source fails (connection error, tool error, timeout, stale connector, etc.):

1. In the briefing, include ONE brief line for that source only: `⚠️ [Source] unavailable — retry scheduled.`
2. After sending the briefing, attempt to create a one-time retry scheduled task for each failed source using `create_scheduled_task`, firing 15 minutes from now. Note: retry task creation is NOT available from within a scheduled task session — if it fails silently, note that in the briefing so Guillermo knows to retry manually.

Use this prompt template for the retry task (fill in the bracketed fields):

```
BRIEFING RETRY — [SOURCE NAME]
Attempt: 1 of 8
Original briefing date: [YYYY-MM-DD]

Your only job is to fetch [SOURCE NAME] and, if successful, send a SHORT Slack update to D2YFUFTSR. Do NOT resend the full briefing.

FETCH INSTRUCTIONS: [Copy the exact fetch instructions for this source from the main briefing — e.g. for Google Calendar: list all events for [date] in America/Los_Angeles, timeMin=[date]T00:00:00, timeMax=[date]T23:59:59, condenseEventDetails:false, skip all-day OOO markers. For Gmail Unread: search is:unread after:[date]. For Gmail Starred: search is:starred. For Slack DMs: to:me after:[date] channel_types im,mpim. For Slack Later: is:saved limit 20. For Smartsheet: fetch https://app.smartsheet.com/sheets/r88mFFmvxcrWcXVQVPRJ648Wj4vXJ9C8p3Qx3fC1 columns Request Name / Assigned To (CLPSE) / CLPSE Project Status. For Daily Tasks Doc: fetch file ID 1PRS_iUx0ma6JGt_hJGtAU-oqIgMHpnuLNbILpq9346k and parse via Bash if it overflows.]

IF FETCH SUCCEEDS: Post one Slack message to D2YFUFTSR:
📡 Briefing Update — [Source Name] (retrieved [HH:MM AM PT])
Update to your [Day, Month Date] morning briefing

[Formatted section — same style as main briefing section for this source]

Then stop. Do not create another retry task.

IF FETCH FAILS AND ATTEMPT < 8: Do not post to Slack. Create a new one-time scheduled task with the same prompt but with Attempt incremented by 1 and fireAt 15 minutes from now. Use taskId: briefing-retry-[source-slug]-[YYYY-MM-DD]-[N+1]
Then stop.

IF ATTEMPT = 8 AND STILL FAILING: Post one Slack message to D2YFUFTSR:
⚠️ Briefing Update — [Source Name] still unavailable
Tried 8 times over ~2 hours. Check manually.
Then stop. Do not create another retry task.
```

Retry task naming: `briefing-retry-gcal-[YYYY-MM-DD]`, `briefing-retry-gmail-unread-[YYYY-MM-DD]`, `briefing-retry-gmail-starred-[YYYY-MM-DD]`, `briefing-retry-slack-[YYYY-MM-DD]`, `briefing-retry-slack-later-[YYYY-MM-DD]`, `briefing-retry-smartsheet-[YYYY-MM-DD]`, `briefing-retry-dailytasks-[YYYY-MM-DD]`

---

## Output

Deliver the briefing in TWO ways:
1. Post as sequential Slack DM messages to D2YFUFTSR (one per section — see below)
2. Create a Gmail draft to guillermo_guzman@intuit.com with subject: "Daily Briefing — [Day, Month Date, Year]"

---

## Slack Formatting Rules (IMPORTANT)

Slack does NOT render markdown tables. Use bullet lists and plain text instead.

BOLD TEXT: The Slack tool uses STANDARD MARKDOWN, not Slack mrkdwn. This means:
- **double asterisks** = bold (ALWAYS use this for bold)
- _single underscores_ = italic
- Single *asterisks* = italic (do NOT use for bold)

CRITICAL BOLD REQUIREMENTS — every one of these must use **double asterisks**:
- Every section emoji header: **🗓️ Today's Meetings**, **✅ Prioritized To-Do List**, **📌 Day to Day Priority**, **⏰ Slack Later**, **⭐ Starred Emails**, **📊 CLPSE Project Status**, **👥 Team Awareness**
- Every priority sub-header: **🔴 P1 — Urgent**, **🟡 P2 — Action Today**, **🟢 P3 — FYI / No Response Needed**
- The title line of every numbered item: **1. [ServiceNow] TASK3425795 — Druva Backup Request**
- Sub-section labels: **In Progress**, **On Hold**, **Complete**, **Overdue / Time-Sensitive**, **Pending Action**
- Meeting times: **08:00–08:15**

Other rules:
- Use • for bullet points
- Always put a blank line between every section header and its content
- Always put a blank line between every individual item (each meeting, each to-do, each project)
- Always put a blank line between every major section
- Never use markdown table syntax (no pipe characters for tables) — use bullet lists instead
- Use emoji section headers for visual separation: 🗓️ ✅ 📌 ⏰ ⭐ 📊 👥

---

## Section Format — Post as 6 sequential Slack messages

### Message 1 — Header + Meetings

☀️ **Good morning, Guillermo!**
🗓️ **[Full date, e.g. Friday, April 25, 2026]** | 🕘 **[Current time PT]**
━━━━━━━━━━━━━━━━━━━━━━
🗓️ **TODAY'S MEETINGS**

**HH:MM–HH:MM** — Event Name (Organizer) 🕓 Up next / 🔴 Now / ✅ Done

[OOO teammates listed after meetings, clearly labeled]

Flag meetings starting within 30 minutes with 🔴 Now. Skip declined events. Include all-day events under Team Awareness only.

---

### Message 2 — Prioritized To-Do List

Classify each Gmail unread and Slack DM/@mention item:
- 🔴 **P1 — Urgent**: Direct questions needing response before noon, overdue items, anything blocking a colleague
- 🟡 **P2 — Action Today**: Needs action today but not time-critical right now
- 🟢 **P3 — FYI**: Automated reports, notifications, no response needed

✅ **PRIORITIZED TO-DO LIST**
━━━━━━━━━━━━━━━━━━━━━━
🔴 **P1 — Urgent (respond before noon)**

**N. [Source] Short title**
What was asked, who asked it, what action is needed.
→ link

🟡 **P2 — Action Today**

**N. [Source] Short title**
Brief context + what to do.
→ link

🟢 **P3 — FYI / No Response Needed**

**N. [Source] Short title**
One sentence of context.
→ link

Past noon? Reframe P1 as "overdue — action ASAP." Omit any tier with zero items.

---

### Message 3 — Day to Day Priority + Slack Later

📌 **DAY TO DAY PRIORITY**
_Live from Daily Tasks FY26 Q2-Q4 — today's bolded items_

- **Item** — context or sub-bullet if relevant

Link: https://docs.google.com/document/d/1PRS_iUx0ma6JGt_hJGtAU-oqIgMHpnuLNbILpq9346k/edit
━━━━━━━━━━━━━━━━━━━━━━
⏰ **SLACK LATER — FOLLOW-UPS**

🔴 **Overdue / Time-Sensitive** _(saved 3+ days ago or flagged urgent)_

**N. [Sender]** — [Channel/DM]
What action is needed.
Saved: [date] → [permalink]

🟡 **Pending Action**

**N. [Sender]** — [Channel/DM]
What action is needed.
Saved: [date] → [permalink]

Skip struck-through items in Day to Day Priority. If no Slack Later items: _No items in Slack Later._

---

### Message 4 — Starred Emails

⭐ **STARRED EMAILS**
━━━━━━━━━━━━━━━━━━━━━━
📌 **Needs Follow-Up**

**N. [Sender] — [Subject]**
One sentence context. | [Date]
→ link

🔖 **Saved for Reference**

**N. [Sender] — [Subject]**
One sentence context. | [Date]
→ link

If none found: _No starred emails found._

---

### Message 5 — CLPSE Project Status

📊 **CLPSE PROJECT STATUS**
_Live from Smartsheet — Care Launch Requests_
━━━━━━━━━━━━━━━━━━━━━━
🟡 In Progress: N
⏸ On Hold: N
✅ Complete: N
❌ Cancelled: N
**Total: N**

**In Progress**
- Project name — CLPSE name

**On Hold**
- Project name — CLPSE name

[Complete and Cancelled are counts only — no detail list]

Link: https://app.smartsheet.com/sheets/r88mFFmvxcrWcXVQVPRJ648Wj4vXJ9C8p3Qx3fC1

Always live from Smartsheet fetch — never hardcode counts.

---

### Message 6 — Team Awareness

👥 **TEAM AWARENESS**
━━━━━━━━━━━━━━━━━━━━━━
- Name — OOO reason + dates (backup contact if known)

_Sources: Gmail · Google Calendar · Slack · Slack Later · Smartsheet · Daily Tasks Doc_
_Automated daily briefing · [HH:MM AM/PM PT] · Sent using Claude_

OOO teammates detected from all-day calendar events or Slack status. Note any training/off-site blocks.

---

## Briefing Rules
- Lead with most urgent item needing human attention
- Summarize full Slack threads, not just the last message
- ServiceNow emails: include ticket number AND plain-language description
- Flag meetings starting within 30 minutes with 🔴 Now
- Past noon? Reframe P1 as "overdue — action ASAP"
- Skip P3 section if nothing is genuinely FYI-only
- Day to Day Priority: today's tab only, bolded items only, skip struck-through
- CLPSE counts: always live from Smartsheet fetch, never hardcoded
- Slack Later: items 3+ days old = Overdue; everything else = Pending Action
- Starred Emails: group into Needs Follow-Up vs Saved for Reference
- Spacing: always a blank line between items, always a blank line between sections
- If the Daily Tasks Google Doc times out, note it clearly, include the direct link, and attempt a retry task
- Any failed source: one-line note in briefing + attempt retry task creation