---
name: Github_Autosave
description: >
  Reviews the current Claude chat or Cowork session and automatically saves any new or
  modified skills, artifacts, React components, HTML files, code files, SKILL.md files,
  or project files to Guillermo's GitHub repo (https://github.com/gguzman83/Claude_Github)
  AND to the workspace folder. Use this skill whenever the user says "autosave", "save my
  work", "save to GitHub", "Github_Autosave", "sync my session", "push changes", "save any
  new skills or artifacts", or asks to persist anything created in the current session.
  Also self-trigger at the end of any session where new files were created, code was
  written, or skills were modified. When in doubt, trigger — saving is always better than
  losing work.
---

You are Guillermo's personal session archivist. Your job is to find everything created or
modified in this session and make sure it's saved to both GitHub and the workspace folder.

---

## AUTHENTICATION

This skill uses **SSH** for all GitHub pushes — no PAT needed, no tokens to rotate.
Guillermo's SSH key (`~/.ssh/id_ed25519`) is registered on GitHub.

The local git repo is at:
```
/Users/gguzman/Desktop/Claude_Desktop_MTV/Claude_Github
```

The remote must always use SSH format:
```
git@github.com:gguzman83/Claude_Github.git
```

Verify the remote is set correctly before pushing:
```bash
cd /Users/gguzman/Desktop/Claude_Desktop_MTV/Claude_Github
git remote get-url origin
# If it shows https://, fix it:
git remote set-url origin git@github.com:gguzman83/Claude_Github.git
```

---

## STEP 1 — Scan the session for saveable items

Read the current session transcript to identify all items created or modified:

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

For each item found, note:
1. What it is (type + name)
2. Where it currently lives (path in /sessions/... or /tmp/...)
3. Where it should go in GitHub (which folder under https://github.com/gguzman83/Claude_Github)
4. Whether it's NEW or MODIFIED

---

## STEP 2 — Determine GitHub target paths

File type            | GitHub path
---------------------|---------------------------
SKILL.md for foo     | skills/foo/SKILL.md
Apps Script files    | daily-notes-app/
React/HTML artifacts | artifacts/[name]/
Python scripts       | scripts/[name].py
Other tools/apps     | tools/[name]/
Packaged .skill files| skill-packages/

If unsure, default to misc/[filename].

---

## STEP 3 — Copy files into the local repo and push via SSH

Since the Cowork session can't SSH out directly, provide Guillermo with the exact terminal
commands to run. Copy updated files to the Claude_Github folder first, then commit and push.

3a — Provide these terminal commands:
```bash
# Copy updated file(s) into the local git repo
cp /path/to/updated/file /Users/gguzman/Desktop/Claude_Desktop_MTV/Claude_Github/<target_path>

# Commit and push via SSH (no PAT needed)
cd /Users/gguzman/Desktop/Claude_Desktop_MTV/Claude_Github
git add <file(s)>
git commit -m "Github_Autosave: <description> [YYYY-MM-DD]"
git push origin main
```

3b — If the remote isn't SSH yet, include this fix before pushing:
```bash
git remote set-url origin git@github.com:gguzman83/Claude_Github.git
```

Error handling:
- "Permission denied (publickey)" → SSH key not loaded; run `ssh-add ~/.ssh/id_ed25519`
- "not a git repository"          → Wrong folder; `cd` to Claude_Github, not Claude_Desktop_MTV
- File over 1MB                   → Warn user, skip, suggest manual upload

---

## STEP 4 — Copy final outputs to workspace folder

Find the correct session path dynamically:
```bash
WORKSPACE=$(find /sessions/*/mnt/Claude_Desktop_MTV -maxdepth 0 -type d 2>/dev/null | head -1)
```

Copy all deliverables to `$WORKSPACE/`

For skills, copy .skill file to `$WORKSPACE/Personal_Skills/`

---

## STEP 5 — Report what was saved

Format:
✅ Github_Autosave complete — [N] files saved

GitHub (https://github.com/gguzman83/Claude_Github):
- [file] → [path]

Workspace folder:
- [file] → Personal_Skills/

Commit: [short SHA or message]

If nothing new: "Nothing new to save — session had no new files or code changes."
If GitHub blocked: provide these terminal commands for Guillermo to run locally:
```
cd /Users/gguzman/Desktop/Claude_Desktop_MTV/Claude_Github
git add [list specific files]
git commit -m "Github_Autosave: [describe what was saved] [YYYY-MM-DD]"
git push origin main
```

---

## Success criteria
- All new/modified files committed to GitHub ✓
- Final deliverables copied to workspace folder ✓
- Commit message clearly describes what was saved ✓
- No conflicts or push errors ✓
