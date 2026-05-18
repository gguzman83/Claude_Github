---
name: master-save
description: >
  Orchestrates all of Guillermo's autosave skills in one shot. Scans the current session,
  figures out which saves apply, and triggers each one automatically. Use this skill whenever
  Guillermo says "master save", "save everything", "end of session save", "wrap up and save",
  "do all the saves", "run all autosaves", or anything that implies he wants a comprehensive
  save at the end of a session. Also self-trigger proactively at the end of any productive
  session where files were created, skills were built or modified, or environment changes were
  made — don't wait to be asked. When in doubt, trigger.
---

# Master Save — Orchestrator

You're Guillermo's session closer. Your job is to look at everything that happened this
session and make sure the right things get saved to the right places — without him having
to remember which skill does what.

There are three autosave skills. Your job is to figure out which ones apply and run them
in sequence. Think of yourself as the router — you read the session, make the call, and
hand off to each skill that needs to fire.

---

## Step 1 — Scan the session

Read through the current conversation and build a quick inventory of what happened.
You're looking for:

| Category | Examples |
|----------|---------|
| **Code / artifacts** | HTML files, React components, Python scripts, JS files, Apps Script (.gs), config files (JSON, YAML) |
| **Skills** | New SKILL.md created, existing SKILL.md modified |
| **Project work** | A new Cowork project built, a significant project updated |
| **Environment changes** | Skill added/modified, config values changed (Slack IDs, file paths, sheet URLs, machine paths), Apps Script instructions updated |
| **Documents / reports** | Markdown files, .docx, .xlsx, .pptx created |
| **Master Reference changes** | Same as "environment changes" — these require a new version of the reference doc |

Write a brief internal inventory before deciding. Something like:
```
Session inventory:
- Modified: daily-briefing/SKILL.md (updated Step 2)
- Created: new HTML artifact (mtv-dashboard-v3.html)
- No new projects built
- Config change: updated Slack channel ID in skill
```

---

## Step 2 — Decide which skills to run

Use this decision table:

| If the session had... | Run this skill |
|-----------------------|---------------|
| New or modified code files, HTML, scripts, artifacts, SKILL.md files, markdown docs | **github-autosave** |
| A new Cowork project built, OR a skill significantly updated or created | **cowork-backup** |
| A skill added/modified, config values changed, Apps Script updated, or environment structure changed | **save-master-reference-doc** |

A single session can trigger all three. That's normal — just run them in order.

If the session had nothing saveable (pure Q&A, no files, no changes), say so clearly and stop.

---

## Step 3 — Run each applicable skill in sequence

For each skill that applies, invoke it using the Skill tool in this order:
1. `github-autosave` (broadest — catches everything)
2. `cowork-backup` (project/skill-level backup)
3. `save-master-reference-doc` (reference doc versioning)

Don't skip a skill just because there's overlap with another one — each serves a different
purpose. github-autosave pushes individual files to GitHub. cowork-backup creates a
self-contained restore bundle. save-master-reference-doc versions the environment doc.

---

## Step 4 — Update Claude_Inventory.md

After the autosave skills have run, update the inventory file to reflect anything new from
this session. This file lives in two places — keep both in sync:
- `~/Documents/Claude/Claude_Inventory.md` (workspace)
- `~/Documents/Claude/Claude_Github/Claude_Inventory.md` (repo)

**What to update:**

| If this session had... | Update this section |
|---|---|
| New skill installed | Add a row to the appropriate Skills table |
| Skill removed or renamed | Remove or update that row |
| New project created | Add a row to Projects |
| New artifact created | Add a row to Artifacts |
| New Cowork backup added | Add a row to Cowork Backups |
| New key link or config | Add to Key Links |

**How to update:**
1. Read the current `Claude_Inventory.md` from the workspace
2. Add/update only the rows that changed — don't rewrite the whole file
3. Update the `Last updated:` date at the top to today
4. Write the updated file back to both locations using the Edit tool

Keep entries concise — one line per item, matching the format already in the file.
If nothing new was added this session, skip this step.

---

## Step 5 — Report the full save summary

After all applicable skills have run and the inventory is updated, give Guillermo one clean summary:

```
✅ Master Save complete

What ran:
• github-autosave — [N] files pushed to GitHub
• cowork-backup — [project/skill name] backed up to Cowork_Backups
• save-master-reference-doc — Master Reference updated to v[N]
• Claude_Inventory.md — updated ([what changed])

Nothing ran for: [any skills that didn't apply and why]
```

If GitHub was blocked by the network proxy (common on Intuit's network), the individual
skills will have already noted this and provided terminal commands. Include a reminder in
the summary so Guillermo knows to run those commands.

---

## Adding a new autosave skill

If Guillermo ever creates a new autosave skill (a 4th skill designed to save/commit/backup
something), it won't automatically be part of this orchestrator. To wire it in:

1. Open this SKILL.md
2. Add a new row to the decision table in Step 2 with the trigger condition and skill name
3. Add it to the execution sequence in Step 3

New *content* skills (daily-briefing, weekly-standup, etc.) don't need any changes here —
github-autosave already catches those by file type automatically.

---

## Edge cases

**Nothing to save:** If the session was purely conversational (no files, no changes, no new
skills), say: "Nothing new to save this session — looks like it was all conversation."
Don't run any skills unnecessarily.

**Unclear whether a skill applies:** Err on the side of running it. A redundant save is
always better than a missed one.

**Sub-skill fails or errors:** Don't stop. Log the error, continue to the next skill, and
report what succeeded and what failed in the final summary.
