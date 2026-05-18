# Claude Environment Inventory
**Last updated:** 2026-05-18  
**Owner:** Guillermo Guzman · IT Manager, Techknow Bar MV & SF

> This file is auto-updated by the `master-save` skill whenever a new skill, project, or artifact is added or modified.

---

## Skills

### Autosave & Environment Management

| Skill | Trigger | Description |
|---|---|---|
| **master-save** | `"master save"` / `"save everything"` / `"end of session save"` | Orchestrator — scans the session and triggers all applicable autosave skills in one shot |
| **github-autosave** | `"autosave"` / `"save my work"` / `"save to GitHub"` | Saves new/modified skills, code, and artifacts to GitHub and workspace folder |
| **cowork-backup** | `"back up [project]"` / `"update my backup"` | Backs up Cowork projects and skills to Cowork_Backups/ folder |
| **save-master-reference-doc** | `"save changes to master reference"` | Rebuilds and versions the Claude Environment Master Reference .docx |
| **consolidate-memory** | `"consolidate memory"` | Merges duplicate memory files, fixes stale facts, prunes the index |

### Daily Operations

| Skill | Trigger | Description |
|---|---|---|
| **daily-briefing** | `"run my briefing"` / `"catch me up"` / `"what do I have today"` | Pulls Gmail, Google Calendar, and Slack into a formatted morning briefing; posts to Slack + Gmail draft |
| **chat-summary** | `"summarize this chat"` / `"end of day summary"` / `"wrap up this session"` | Generates a structured summary of today's Claude sessions |
| **schedule** | `"schedule a task"` / `"run every morning"` / `"remind me in an hour"` | Creates and manages scheduled/recurring tasks |
| **clpse-thankyou** | `"write a thank-you for the CLPSE"` | Reads a project scope doc from Google Drive and drafts a Slack thank-you for the CLPSE |

### Document & File Creation

| Skill | Trigger | Description |
|---|---|---|
| **docx** | `"Word doc"` / `".docx"` / `"write a report"` | Creates, edits, and manipulates Word documents with full formatting support |
| **pptx** | `"deck"` / `"slides"` / `".pptx"` | Creates and edits PowerPoint presentations |
| **xlsx** | `"spreadsheet"` / `".xlsx"` / `"Excel"` | Creates and edits Excel spreadsheets with formulas and charts |
| **pdf** | `"PDF"` / `".pdf"` / `"extract"` / `"merge"` | Creates, extracts, merges, and manipulates PDF files |

### Promotion & People

| Skill | Trigger | Description |
|---|---|---|
| **promotion-proposal** | `"help me write a promo doc"` / `"submit a promotion for [name]"` | Generates a polished promotion proposal .docx for Intuit review (general managers) |
| **tech-promo-packet** | `"promotion packet for tech"` | Generates a promotion proposal for IC/tech roles |

### Setup & Development

| Skill | Trigger | Description |
|---|---|---|
| **skill-creator** | `"create a skill"` / `"optimize this skill"` / `"edit the SKILL.md for..."` | Creates new skills, modifies existing skills, runs evals and benchmarks |
| **setup-cowork** | `"set up Cowork"` / `"install plugins"` | Guided Cowork setup — installs role-matched plugins and connects tools |
| **dashboard-sync-docs** | `"update the docs"` / `"sync the docs"` | Keeps the MTV Tech Dashboard documentation in sync after any change |

---

## Projects

| Project | Location | Description |
|---|---|---|
| **MTV Tech Projects Dashboard** | `Projects/Tech Dashboard - MTV/` | Live HTML dashboard for tracking tech projects at the Mountain View Techknow Bar |
| **Care Launch CLPSE Tracker** | `.artifacts/care-launch-clpse-tracker/` | Live artifact tracker for Care Launch CLPSE project |

---

## Artifacts

| Artifact | Path | Description |
|---|---|---|
| **care-launch-clpse-tracker** | `.artifacts/care-launch-clpse-tracker/index.html` | CLPSE tracker artifact — live data view |

---

## Cowork Backups

Backups are stored in `Cowork_Backups/` and mirrored to `Claude_Github/Cowork_Backups/`.

| Backup | Description |
|---|---|
| **Care Launch CLPSE Tracker** | Full project backup with README and restore instructions |
| **ExecTech Assessment** | Full project backup |
| **MTV - Tech Projects Dashboard** | Full project backup |
| **My Daily Briefing** | Daily briefing skill and config backup |
| **My Daily Notes App** | Daily Notes App (HTML + Apps Script) backup |
| **Skills/** | Individual skill backups for all installed skills |

---

## Key Links

| Resource | URL / Path |
|---|---|
| GitHub Repo | https://github.intuit.com/gguzman/Claude_Github |
| CLPSE Tracker (live) | https://docs.google.com/spreadsheets/d/1HCgtlfpknaPxS_R72lmSStRO6Om4jJfFZfW7PoIjTbY/edit |
| Master Reference Doc | https://docs.google.com/document/d/1DikWYZoNKolALoBeeBUXTboT7LlgHJNAK1LoXF7Gk9M/edit |
| Skills folder | `~/Documents/Claude/Skills/` |
| Workspace folder | `~/Documents/Claude/` |
