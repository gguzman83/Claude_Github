---
name: chat-summary
description: >
  Generate a clean, structured summary of today's Claude chat sessions that captures
  what was worked on, decisions made, outputs produced, and next steps. Use this skill
  whenever the user asks to summarize a chat, capture today's work, "what did we do today",
  "end of day summary", "wrap up this session", "summarize this conversation", "create a
  handoff note", "log today's work", or any similar phrasing. Also trigger when the user
  wants to save or document what happened in a Claude session for future reference, wants
  to start a new chat and needs context carried forward, or asks for a recap of work done.
  When in doubt, trigger — capturing work is always better than losing it.
---

# Chat Summary Skill

Generates a clean, structured end-of-session summary from one or more Claude chats.
Captures what was worked on, tools used, outputs produced, decisions made, and what's
still pending — formatted for easy reference, handoff, or logging.

---

## When to Trigger

- "Summarize this chat"
- "Wrap up today's session"
- "What did we do today?"
- "Create a handoff note"
- "Capture today's work"
- "I'm starting a new chat — summarize this one first"
- "Log what we worked on"
- End of day or end of session context

---

## Step 1 — Determine Scope

Ask the user (or infer from context):

1. **Which chat(s)?** Current conversation only, or multiple chats from today?
   - If current only → summarize from context window
   - If multiple → use `recent_chats` tool to pull today's sessions, then summarize each
2. **Output format?** Default is inline summary. Ask if they want a `.docx` file or Slack message instead.
3. **Any sections to skip?** e.g., "don't include the back-and-forth on X"

If the user just says "summarize this chat" with no other context — default to current conversation, inline output, no questions asked.

---

## Step 2 — Build the Summary

Use this structure for every summary. Adjust section depth based on how much was covered.

```
## 🗓️ Chat Summary — [Date]
[One sentence describing the overall theme of the session]

---

### ✅ What Was Worked On
[Grouped by topic/project. 2-4 bullets per topic. Lead with the action, not the background.]

### 📦 Outputs Produced
[Files created, docs generated, messages drafted, skills built, code written — anything tangible]
| Output | Type | Notes |
|---|---|---|

### 🔑 Key Decisions / Changes Made
[Things that were corrected, clarified, or decided during the session]

### ⏭️ Next Steps / Still Pending
[Anything unfinished, flagged for follow-up, or explicitly left for later]

### 🔗 Reference Info
[IDs, paths, URLs, names, or credentials referenced — useful for future sessions]
```

---

## Writing Rules

- **Lead with action** — "Built X", "Pushed Y to GitHub", "Drafted Z for John" — not "We discussed..."
- **Be specific** — include names, file names, IDs, and numbers where they appeared
- **No fluff** — skip conversational back-and-forth; capture outcomes, not process
- **Decisions over discussion** — if something was corrected or changed, note the final state only
- **Pending is important** — anything unresolved should be in Next Steps, not buried in What Was Worked On
- **Keep it scannable** — bullets over paragraphs, tables for outputs, bold for key terms

---

## Step 3 — Output Options

### Option A — Inline (default)
Post the summary directly in the chat. Ask at the end:
> "Want me to also save this as a `.docx` or push it to your GitHub?"

### Option B — Word Doc
If user wants a file:
- Read `/mnt/skills/public/docx/SKILL.md` before generating
- Style: clean, minimal — Arial font, blue section headers, no heavy branding
- Filename: `Chat_Summary_[YYYY-MM-DD].docx`
- Save to `/mnt/user-data/outputs/` and call `present_files`

### Option C — Slack Message
If user wants to post to Slack:
- Use `slack_send_message_draft` — always draft, never send directly
- Keep it tight — one paragraph per major topic, no tables
- Default channel: user's own DM (`W8DFFCX24`) unless they specify otherwise

### Option D — GitHub
If user wants it logged to their repo:
- Save as `summaries/YYYY-MM-DD.md` in `Claude_Github`
- Provide the terminal push command:
```bash
cd /Users/gguzman/Desktop/Claude_Desktop_MTV
git add summaries/
git commit -m "Add chat summary [date]"
git push
```

---

## Multi-Chat Summary (Today's Full Day)

If the user wants all of today's chats summarized:

1. Use `recent_chats` to pull sessions from today
2. For each chat, generate a mini-summary (title + 3-5 bullets)
3. Combine into a single "Day Summary" doc with one section per chat
4. Add a "Today's Highlights" section at the top with the 3-5 most important things from the whole day

---

## Quality Checks Before Delivering

- [ ] Outputs table is complete — every file/doc/message produced is listed
- [ ] Next Steps are actionable — not vague ("follow up on X" → "Push README update to GitHub")
- [ ] Reference Info includes anything needed to continue in a new chat (file paths, IDs, Slack user IDs, repo paths)
- [ ] No sensitive info included (passwords, tokens, SSNs)
- [ ] Date is accurate
