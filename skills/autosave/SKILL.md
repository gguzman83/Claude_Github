---
name: autosave
description: >
  Reviews the current Claude chat or Cowork session and automatically saves any new or
  modified skills, artifacts, React components, HTML files, code files, SKILL.md files,
  or project files to Guillermo's GitHub repo (https://github.com/gguzman83/Claude_Github)
  AND to the workspace folder. Use this skill whenever the user says "autosave", "save my
  work", "save to GitHub", "sync my session", "push changes", "save any new skills or
  artifacts", or asks to persist anything created in the current session. Also self-trigger
  at the end of any session where new files were created, code was written, or skills were
  modified. When in doubt, trigger — saving is always better than losing work.
---

You are Guillermo's personal session archivist. Your job is to find everything created or
modified in this session and make sure it's saved to both GitHub and the workspace folder.

---

## STEP 1 — Scan the session for saveable items

Read the current session transcript to identify all items created or modified:

```
Items to look for:
- New or updated SKILL.md files (skills)
- HTML files (apps, tools, web pages)
- React / JSX components
- Python scripts
- JavaScript files
- Google Apps Script files (Code.gs, etc.)
- Any other code files
- Markdown documents / reports
- Config files (JSON, YAML)
- .skill zip packages
```

For each item found, note:
1. What it is (type + name)
2. Where it currently lives (path in /sessions/... or /tmp/...)
3. Where it should go in GitHub (which folder under https://github.com/gguzman83/Claude_Github)
4. Whether it's NEW or MODIFIED

---

## STEP 2 — Determine GitHub target paths

Use this mapping to determine where each file goes in the GitHub repo:

| File type | GitHub path |
|-----------|-------------|
| SKILL.md for a skill named `foo` | `skills/foo/SKILL.md` |
| Apps Script files (Code.gs, index.html) | `daily-notes-app/` |
| React / HTML artifacts | `artifacts/[name]/` |
| Python scripts | `scripts/[name].py` |
| Other tools/apps | `tools/[name]/` |
| Packaged .skill files | `skill-packages/` |

If unsure, default to `misc/[filename]`.

---

## STEP 3 — Pull latest from GitHub and stage changes

Use Bash to:

```bash
cd /sessions/zealous-serene-dijkstra/Claude_Github

# Pull latest to avoid conflicts
git pull origin main

# Copy new/modified files to the correct target paths
# (Do this for each file identified in Step 1)
# Example:
# cp /tmp/autosave-skill/SKILL.md skills/autosave/SKILL.md
# cp /sessions/.../apps-script/index.html daily-notes-app/index.html

# Stage all changes
git add -A

# Show what's staged
git status
git diff --staged --stat
```

---

## STEP 4 — Commit with a descriptive message

Generate a commit message that lists what was saved. Format:

```
autosave: [brief summary of session work]

Files saved:
- [file 1] — [what it does / what changed]
- [file 2] — [what it does / what changed]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Then run:
```bash
cd /sessions/zealous-serene-dijkstra/Claude_Github
git commit -m "[generated message above]"
git push origin main
```

---

## STEP 5 — Copy final outputs to workspace folder

Also copy all deliverables to the workspace folder so Guillermo can open them directly:
`/sessions/zealous-serene-dijkstra/mnt/Claude_Desktop_MTV/`

For skills, copy the packaged `.skill` file to:
`/sessions/zealous-serene-dijkstra/mnt/Claude_Desktop_MTV/Personal_Skills/`

For code files, copy to an appropriate subfolder.

---

## STEP 6 — Report what was saved

Tell Guillermo exactly what was saved and where. Be concise:

```
✅ Autosave complete — [N] files saved

GitHub (https://github.com/gguzman83/Claude_Github):
• [file] → [path]
• [file] → [path]

Workspace folder:
• [file] → Personal_Skills/ (or wherever)

Commit: [short SHA or message]
```

If nothing new was found:
```
Nothing new to save — session had no new files or code changes.
```

---

## Success criteria

- All new/modified files from the session committed to GitHub ✓
- Final deliverables copied to workspace folder ✓
- Commit message clearly describes what was saved ✓
- No conflicts or push errors ✓
