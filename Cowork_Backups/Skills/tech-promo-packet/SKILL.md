---
name: tech-promo-packet
description: >
  Generate a polished, review-ready promotion proposal document (.docx) for Intuit managers
  submitting an employee for promotion. Use this skill whenever a manager wants to build,
  create, draft, or document a promotion case — whether they say "help me write a promo doc,"
  "I need to submit a promotion for [name]," "can you put together a promotion proposal,"
  "my employee is ready for the next level," or any similar phrasing. Also trigger when a
  manager shares a mid-year review, performance check-in, accomplishment list, or Spotlight
  award and says anything about a promotion or level change. When in doubt, trigger — it's
  easier to confirm than to miss a promotion window.
---

# Promotion Proposal Skill

Generates a branded, professional promotion packet (.docx) for Intuit technicians and IT staff.
Takes a name, current role, target role, and raw performance notes — outputs a polished Word doc
ready for manager submission.

---

## Inputs to Collect

Before generating, make sure you have:

| Field | Required | Notes |
|---|---|---|
| `tech_name` | ✅ | Full name (e.g., Gilbert Liborio) |
| `current_role` | ✅ | e.g., Desktop Analyst |
| `target_role` | ✅ | e.g., Senior Desktop Analyst |
| `submitting_manager` | ✅ | e.g., Guillermo Guzman III, Onsite IT Manager |
| `performance_notes` | ✅ | Raw bullet points, numbers, accomplishments — anything the manager provides |
| `time_period` | ⚠️ optional | e.g., Q1 FY26 – April 2026. Default: "past 12 months" |

If any required field is missing, ask for it before proceeding. Don't generate with placeholder values.

---

## Step 1 — Synthesize 3 Promotion Pillars

From the raw performance notes, extract and write **3 evidence-based bullets** using this framework:

### Pillar Structure
Each pillar should:
- Have a bold **label** (e.g., "Volume & Sustained Above-Level Performance")
- Lead with the strongest quantitative claim
- Be 3–5 sentences max
- Be written in manager voice — direct, confident, corporate-casual (not stiff)
- Avoid superlatives without data to back them up (don't say "#1" if the notes say "top 3")

### Recommended Pillar Categories (adapt to what the notes support)
1. **Volume & Performance** — ticket counts, resolution rates, rankings, throughput vs peers
2. **Cross-Functional Ownership & Impact** — projects led, partnerships, scope beyond core role, KBs authored
3. **Coaching, Mentorship & Innovation** — peers developed, AI tools built, process improvements, force-multiplier behaviors

### Writing Rules
- Numbers must match the notes exactly — never round up or inflate
- If ranking is mentioned (e.g., "top 3"), use that — never upgrade to "#1"
- Tie each bullet back to Senior-level expectations implicitly or explicitly
- End at least one bullet with a punchy closing line (e.g., "He's not just performing at the next level — he's raising the floor for everyone around him.")

---

## Step 2 — Generate the .docx

Use the `docx` npm package. Always read `/mnt/skills/public/docx/SKILL.md` before writing code.

### Document Structure

```
[Header]        Confidential banner + tech name
[Cover Banner]  Blue banner: "PROMOTION RECOMMENDATION" | Name | Role transition arrow
[Summary]       2-sentence italic lead-in
[Metrics Table] Key quantitative stats as visual cards (2 rows of 3)
[Pillar 1]      Section header + sub-bullets
[Pillar 2]      Section header + sub-bullets
[Pillar 3]      Section header + sub-bullets
[Rec Block]     Light blue callout box with manager sign-off
[Footer]        Manager name + page number
```

### Brand Colors
```
INTUIT_BLUE  = "0077C5"
LIGHT_BLUE   = "E8F4FD"
MID_BLUE     = "B3D9F2"
WHITE        = "FFFFFF"
DARK         = "1A1A1A"
```

### Metrics Cards
Pull all quantitative data from the notes and surface them as visual metric cards:
- Format: large bold number on top, label below, sub-label (e.g., time period) below that
- Show up to 6 cards across 2 rows of 3
- Leave a blank filler cell if count is odd

### Page Setup
- US Letter: 12240 × 15840 DXA
- Margins: top/bottom 1080, left/right 1260
- Font: Arial throughout
- Never use unicode bullets — use `LevelFormat.BULLET` with numbering config

---

## Step 3 — Output

1. Save to `/home/claude/{tech_last_name}_promo_packet.docx`
2. Copy to `/mnt/user-data/outputs/{tech_last_name}_promo_packet.docx`
3. Call `present_files` with the output path
4. Follow up asking: "Want me to also draft the Slack message to your manager?"

---

## Slack Message Option

If the manager wants a Slack version:
- 3 bullets max, matching the pillars
- Casual but credible tone — this is a DM to their manager, not a formal doc
- Close with: "He's already doing the [target role] job. Happy to walk through the details whenever works for you."
- Use `slack_send_message_draft` — always draft first, never send directly
- Look up manager's Slack user ID with `slack_search_users` before drafting

---

## Quality Checks Before Delivering

- [ ] Tech name is spelled correctly throughout (header, banner, recommendation block)
- [ ] All numbers match the input notes exactly
- [ ] No rank inflation (e.g., "top 3" not "#1" unless notes say so)
- [ ] Pillar labels match the actual content of each section
- [ ] Manager name is correct in footer and recommendation block
- [ ] File saved to outputs directory and presented with `present_files`
