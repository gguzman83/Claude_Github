---
name: github-autosave
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
Guillermo's SSH key (~/.ssh/id_ed25519) is registered on GitHub.

The local git repo is at:
/Users/gguzman/Desktop/Claude_Desktop_MTV/Claude_Github

The remote must always use SSH format:
git@github.com:gguzman83/Claude_Github.git

Verify the remote is set correctly before giving push commands:
cd /Users/gguzman/Desktop/Claude_Desktop_MTV/Claude_Github
git remote get-url origin
# If it shows https://, fix it:
git remote set-url origin git@github.com:gguzman83/Claude_Github.git

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
4. Whether it is NEW or MODIFIED

---

## STEP 2 — Determine GitHub target paths

File type                        | GitHub path
---------------------------------|---------------------------
SKILL.md for a skill named foo   | skills/foo/SKILL.md
Apps Script files (Code.gs etc.) | daily-notes-app/
React / HTML artifacts           | artifacts/[name]/
Python scripts                   | scripts/[name].py
Other tools/apps                 | tools/[name]/
Packaged .skill files            | skill-packages/

If unsure, default to misc/[filename].

---

## STEP 3 — Copy files and provide terminal commands to push

Since Cowork sessions cannot SSH out directly, provide Guillermo with exact terminal
commands to run. Copy updated files into the Claude_Github workspace folder, then commit.

Provide these terminal commands:

cp /path/to/updated/file /Users/gguzman/Desktop/Claude_Desktop_MTV/Claude_Github/<target_path>
cd /Users/gguzman/Desktop/Claude_Desktop_MTV/Claude_Github
git add <file(s)>
git commit -m "Github_Autosave: <description> [YYYY-MM-DD]"
git push origin main

If the remote is not SSH yet, include this fix before pushing:
git remote set-url origin git@github.com:gguzman83/Claude_Github.git

Error handling:
- "Permission denied (publickey)" — run ssh-add ~/.ssh/id_ed25519 then retry
- "not a git repository"          — wrong folder; cd into Claude_Github not Claude_Desktop_MTV
- File over 1MB                   — warn user, skip, suggest manual upload

---

## STEP 4 — Copy final outputs to workspace folder

Copy all deliverables to the workspace folder so Guillermo can open them directly.
The workspace root is: /sessions/<session-id>/mnt/Claude/

---

## STEP 5 — Report what was saved

Provide the exact terminal commands to push:

cd /Users/gguzman/Desktop/Claude_Desktop_MTV/Claude_Github
git add [exact files]
git commit -m "Github_Autosave: [description] [YYYY-MM-DD]"
git push origin main

If nothing new was found: "Nothing new to save — session had no new files or code changes."

---

## Success criteria

- All new/modified files copied to workspace folder
- Exact terminal commands provided for git push
- Commit message clearly describes what was saved
- No PAT, no HTTPS URLs, SSH only
