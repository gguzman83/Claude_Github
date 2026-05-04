---
name: workspace-organizer
description: >
  Knows Guillermo's Claude workspace file structure and enforces it. Use this skill
  whenever the user says "organize my files", "clean up", "sync files", "where should
  I save this", "fix my folder structure", "move stray files", or any time Claude
  is about to create a new file and needs to know the correct destination. Also trigger
  when the user asks "what's in my Claude folder" or when files appear to be in the
  wrong place. Proactively use this skill any time you're saving outputs — it tells
  you exactly where things belong so nothing lands in the wrong spot.
---

# Workspace Organizer

Guillermo has one workspace folder connected to Cowork, located at:
- **Cowork root**: `/sessions/.../mnt/` (his `/Documents/Claude` on Mac)
- **Main output folder**: `Claude_Desktop_MTV/` (inside the Cowork root)

## The Golden Rule

**All Claude outputs go into `Claude_Desktop_MTV/` — never into the Cowork root directly.**

The Cowork root is a system-managed space. Only system folders live there. Guillermo's actual work lives inside `Claude_Desktop_MTV/`.

---

## Cowork Root — Protected System Folders (Never Touch)

These folders live in the Cowork root and must never be used as output destinations or reorganized:

| Folder | Purpose |
|--------|---------|
| `.claude/` | Claude Code config, skills, sessions |
| `.scheduled/` | Scheduled tasks — **stays here always** |
| `.remote-plugins/` | Installed plugins |
| `.cowork-lib/` | Cowork system library |
| `.cowork-perm-req/` | Permission request queue |
| `.cowork-perm-resp/` | Permission response queue |
| `uploads/` | Temporary file uploads from the user |

---

## Claude_Desktop_MTV — Canonical Folder Structure

```
Claude_Desktop_MTV/
├── artifacts/              ← HTML artifacts, live apps, dashboards
│   ├── assessments/        ← Tech assessment tools
│   ├── briefings/          ← Briefing artifacts
│   ├── dashboards/         ← Dashboard artifacts
│   │   └── archive/        ← Old dashboard versions
│   └── weekly-quiz/        ← Quiz artifacts and admin
├── configs/                ← Config files (e.g., Code.gs, .json configs)
├── context/                ← Context docs Claude reads for background info
├── docs/                   ← Word docs, PDFs, reports, reference images
│   └── Master_Reference_doc/ ← Master reference document versions
├── skills/                 ← .skill package files
├── Claude_Github/          ← GitHub-synced code and skill repos
├── Legal Hold/             ← Legal hold files
├── exec-tech-assessment/   ← Executive tech assessment project
├── daily-notes-app/        ← Daily notes application
└── send-daily-briefing/    ← Daily briefing automation
```

---

## Where New Files Should Go

When creating files, use this routing guide:

| File type | Destination |
|-----------|------------|
| HTML artifact / dashboard / app | `artifacts/` (or appropriate subfolder) |
| Word doc (.docx), PDF, report | `docs/` |
| Script / config (.gs, .json, .yaml) | `configs/` |
| Skill package (.skill) | `skills/` |
| Context / reference file | `context/` |
| Images used as reference/docs | `docs/` |
| Project with multiple files | Create a named subfolder at root of `Claude_Desktop_MTV/` |
| Code synced to GitHub | `Claude_Github/` |

---

## Sync / Cleanup Workflow

When the user asks to organize, clean up, or sync files:

1. **Identify stray files** — files sitting at the root of `Claude_Desktop_MTV/` that belong in a subfolder
2. **Run the sync script** to get a dry-run preview first:
   ```bash
   python3 /path/to/workspace-organizer/scripts/sync.py --dry-run
   ```
3. **Show the user the proposed moves** and confirm before executing
4. **Run without `--dry-run`** to apply:
   ```bash
   python3 /path/to/workspace-organizer/scripts/sync.py
   ```
5. **Report what moved** and note anything that needed human judgment

The script path is relative to wherever the skill is installed — look for it in `Claude_Desktop_MTV/skills/workspace-organizer/scripts/sync.py`.

---

## Known Stray Files (as of May 2026)

These files are currently at the root of `Claude_Desktop_MTV/` and should be moved:

| File | Should go to |
|------|-------------|
| `Code.gs` | `configs/` |
| `index.html` | `artifacts/` |
| `save-master-reference-doc.skill` | `skills/` |
| `Locked_html_Instructions.jpg` | `docs/` |
| `README.md` | Root of `Claude_Desktop_MTV/` is fine (it's documentation for the folder) |

---

## Rules for Claude

1. **Before saving any file**, check this skill to confirm the right destination
2. **Never create new files in the Cowork root** — always go into `Claude_Desktop_MTV/`
3. **Never touch `.scheduled/`** — that folder is managed by the scheduling system
4. **When in doubt about where a file goes**, default to `Claude_Desktop_MTV/` root and note it for cleanup
5. **If creating a new project with 3+ files**, create a descriptive named subfolder inside `Claude_Desktop_MTV/`
6. **After completing a task**, if you created files in a temp location, copy them to the right place in `Claude_Desktop_MTV/` before telling the user you're done
