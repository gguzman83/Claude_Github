---
name: daily-briefing
description: >
  Generates a personalized daily briefing by pulling from Gmail (unread emails),
  Google Calendar (today's meetings), Slack (DMs and @mentions), and Smartsheet
  (live CLPSE project status), then compiling everything into a prioritized action
  list. Use this skill whenever the user asks for a morning briefing, daily standup
  prep, "what do I have today", "catch me up", "what needs my attention", "check my
  messages and meetings", or any combination of checking inbox + calendar + Slack at
  once. Trigger even if the user only names two of the sources — the skill fills in
  all sources by default. Also trigger for follow-up requests like "flag anything
  urgent" or "what needs a response before noon".
---

# Daily Briefing Skill

Your job is to gather a snapshot of the user's day from five sources — Gmail, Google Calendar, Slack, Smartsheet, and the Daily Tasks Google Doc — then synthesize it into a clear, prioritized action list. Think of yourself as an EA giving a crisp morning brief: the user should finish reading and immediately know what to do first.

## Step 1: Pull data in parallel

Fetch all five sources simultaneously (don't wait for one before starting the next):

**Gmail** — Search for unread messages in the last 24 hours:
- Query: `is:unread after:<yesterday's date>`
- Aim for up to 25 results; more if the user mentions a high-volume inbox

**Google Calendar** — List all events for today:
- `timeMin`: start of today (midnight, local timezone)
- `timeMax`: end of today (23:59, local timezone)
- Include `condenseEventDetails: false` so you get attendees and response statuses
- Filter out all-day events that are just OOO/awareness markers when summarizing meetings

**Slack** — Search for DMs and @mentions in the last 24 hours:
- Search DMs/group DMs: `to:me after:<yesterday>` with `channel_types: im,mpim`
- Search @mentions: `@<user_id> after:<yesterday>` across all channel types
- Focus on threads where the user was directly addressed or asked a question

**Daily Tasks Doc** — Pull today's bolded priorities:
- Use the Google Drive connector to fetch this Google Doc: `https://docs.google.com/document/d/1PRS_iUx0ma6JGt_hJGtAU-oqIgMHpnuLNbILpq9346k/edit`
- Navigate to the document tab matching today's date (e.g. "Monday, April 6")
- Extract only the items that are **bolded** and NOT crossed out/struck through
- These are the Day to Day Priorities — action items that need attention today
- Do not include items from other dates

**Smartsheet** — Pull live CLPSE project data:
- Use the Smartsheet connector to fetch the Care Launch Requests sheet
- Sheet URL: `https://app.smartsheet.com/sheets/r88mFFmvxcrWcXVQVPRJ648Wj4vXJ9C8p3Qx3fC1`
- Columns to extract: `Request Name`, `Assigned To (CLPSE)`, `CLPSE Project Status`
- This is always live data — do not use hardcoded counts from previous runs

## Step 2: Identify what needs action

Before writing the briefing, mentally sort each item:

- **Needs a response**: Someone asked the user a direct question, made a request, or is waiting on them
- **Needs to attend**: A meeting is happening today (especially ones starting soon)
- **Needs to claim/action**: A task was assigned (e.g., ServiceNow tickets, Jira tasks)
- **FYI only**: Notifications, shipping confirmations, OOO notices — no reply needed
- **Noon flag**: Any of the above that would be rude or blocking to leave unanswered until after noon

Use judgment here. A "thank you" message doesn't need a reply. A direct question from a colleague about a count or a decision does.

## Step 3: Write the briefing

Structure the output as follows. Keep the tone like a smart EA — direct, scannable, just enough context to act.

---

### Output format

## 🗓️ Today's Meetings

| Time | Event | Status |
|------|-------|--------|
| HH:MM–HH:MM | Event name | ✅ Done / 🔴 Now / 🕓 Up next |

[Note any relevant OOO teammates below the table]

---

## ✅ Prioritized To-Do List

### 🔴 P1 — Urgent (needs response before noon / already overdue)

**N. [Source] Short title**
One or two sentences explaining what was asked, who asked it, and what action is needed.
→ [Link to message/thread/email](url)

### 🟡 P2 — Action Today

**N. [Source] Short title**
Brief context + what to do.
→ [Link](url)

### 🟢 P3 — FYI / No Response Needed

**N. [Source] Short title**
One sentence of context.

---

## 📌 Day to Day Priority
_Live from Daily Tasks FY26 Q2-Q4 — today's bolded items_

- **Item** — brief context or sub-bullet if relevant
[Omit struck-through items — those are done]
→ [Daily Tasks Doc](https://docs.google.com/document/d/1PRS_iUx0ma6JGt_hJGtAU-oqIgMHpnuLNbILpq9346k/edit)

---

## 📊 CLPSE Project Status
_Live from Smartsheet — (Form Response) Care Launch Requests_

| Status | Count |
|--------|-------|
| 🟡 In Progress | N |
| ⏸️ On Hold | N |
| ✅ Complete | N |
| ❌ Cancelled | N |
| **Total** | **N** |

### 🟡 In Progress

| Project | CLPSE |
|---------|-------|
| Project name | CLPSE name |

### ⏸️ On Hold

| Project | CLPSE |
|---------|-------|
| Project name | CLPSE name |

[Omit Complete and Cancelled from detail tables — summary counts only]

---

## 👥 Team Awareness
[List any teammates who are OOO today, with backup contacts if known]

---

**Briefing best practices:**
- Lead with most urgent item needing human attention
- Summarize full Slack threads, not just the last message
- Include ticket number AND plain-language description for ServiceNow emails
- Flag meetings starting within 30 minutes
- Past noon? Reframe P1 items as "overdue — action ASAP"
- Skip P3 section if nothing is genuinely FYI-only
- Day to Day Priority: bolded items from today's tab only, skip struck-through
- CLPSE section: always live counts, never hardcoded

## Step 4: Source attribution

Sources: [Gmail](https://mail.google.com/...) · [Google Calendar](https://calendar.google.com/...) · [Slack thread](url) · [Smartsheet](https://app.smartsheet.com/sheets/r88mFFmvxcrWcXVQVPRJ648Wj4vXJ9C8p3Qx3fC1) · [Daily Tasks Doc](https://docs.google.com/document/d/1PRS_iUx0ma6JGt_hJGtAU-oqIgMHpnuLNbILpq9346k/edit)