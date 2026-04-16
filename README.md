# Claude Prompt Vault — Guillermo Guzman

A version-controlled reference library for Claude skills, prompt templates, artifacts, and context files used across Cowork sessions and Claude conversations.

---

## How to Use This Repo

At the start of any Claude or Cowork session, reference files from this vault to instantly ground Claude in your role, workflows, and tools. Paste file contents directly into the conversation or attach them when starting a new session.

**Quick start:** Attach `context/role-context.md` to any new Claude session to skip re-explaining who you are and how you work.

---

## Folder Structure

### `/skills`
Extracted SKILL.md files from installed `.skill` bundles. Each file is a ready-to-invoke prompt skill that Claude can execute.

| File | What it does |
|------|-------------|
| `daily-briefing.md` | Morning briefing: Gmail + Calendar + Slack compiled into a prioritized to-do list |
| `clpse-thankyou.md` | Reads a Google Drive scope doc and drafts a Slack recognition message for a CLPSE |
| `promotion-proposal.md` | Generates a polished `.docx` promotion proposal for Intuit review cycles |

#### `/skills/scheduled`
Skills wired to a cron schedule via the Cowork scheduler.

| Folder | Schedule | Description |
|--------|----------|-------------|
| `daily-briefing-guillermo/` | Mon–Fri 8:30 AM PT | Personalized briefing with CLPSE tracker + Slack delivery |

---

### `/prompts`
Reusable prompt templates, grouped by communication context. Populate these as you build and refine prompts you use repeatedly.

| Subfolder | Use for |
|-----------|---------|
| `team-comms/` | DMs, team announcements, shift notes, conflict escalation |
| `exec-updates/` | Cross-functional syncs, leadership-facing status updates |
| `recognition/` | Shoutouts, wins framing, Spotlight nominations |

---

### `/artifacts`
Claude-generated outputs worth keeping as references or templates.

| Path | Description |
|------|-------------|
| `dashboards/Legal_Hold_Workflow_Dashboard.html` | Current legal hold workflow dashboard (interactive HTML) |
| `dashboards/archive/Legal_Hold_Workflow_Dashboard_V1.html` | Previous version — archived for reference |
| `briefings/daily_briefing_march25.html` | March 2025 daily briefing (HTML format) |
| `briefings/daily-briefing-2026-04-07.md` | April 7, 2026 daily briefing output (Markdown) |

---

### `/context`
Org and role context files. Attach these to new Claude sessions to skip re-explaining your setup.

| File | Contents |
|------|----------|
| `role-context.md` | Who you are, how you work, tools, workflows, communication style |
| `team-roster.md` | *(add your team members, roles, and locations)* |
| `recurring-workflows.md` | *(document your repeating operational workflows)* |

---

### `/configs`
Scheduled task definitions and configuration references.

| File | Contents |
|------|----------|
| `scheduled-tasks.md` | Log of all active scheduled tasks with cron strings and data sources |

---

## Maintenance Notes

- Keep one canonical version of each skill in `/skills` — the `.skill` archive originals live in `Claude_Desktop_MTV/Downloaded_Skills` on your machine.
- Archive old artifact versions to `artifacts/*/archive/` rather than deleting them.
- Update `context/role-context.md` whenever your team, tools, or workflows change.
- Add new prompt templates to `/prompts` as you refine them — name files descriptively (e.g., `exec-updates/weekly-status-template.md`).
