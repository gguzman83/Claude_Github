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

This skill uses the GitHub REST API with a pre-configured PAT. Set it at the start of every run:

export GITHUB_PAT=YOUR_GITHUB_PAT_HERE
export GITHUB_REPO="gguzman83/Claude_Github"
export GITHUB_API="https://api.github.com/repos/$GITHUB_REPO/contents"

Never write the PAT to any file or include it in commit messages.

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

## STEP 3 — Commit each file via GitHub REST API

3a — Check if file exists (get SHA for updates):
RESPONSE=$(curl -s -H "Authorization: token $GITHUB_PAT" "$GITHUB_API/<repo_path>")
SHA=$(echo $RESPONSE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))" 2>/dev/null)

3b — Encode and commit:
CONTENT_B64=$(base64 -w 0 < /path/to/local/file)
if [ -n "$SHA" ]; then
  PAYLOAD=$(printf '{"message":"Github_Autosave: %s [%s]","content":"%s","sha":"%s"}' "<desc>" "$(date +%Y-%m-%d)" "$CONTENT_B64" "$SHA")
else
  PAYLOAD=$(printf '{"message":"Github_Autosave: %s [%s]","content":"%s"}' "<desc>" "$(date +%Y-%m-%d)" "$CONTENT_B64")
fi
curl -s -X PUT -H "Authorization: token $GITHUB_PAT" -H "Content-Type: application/json" -d "$PAYLOAD" "$GITHUB_API/<repo_path>"

Error handling:
- 401 Unauthorized     → PAT expired, update AUTHENTICATION section
- 422 Unprocessable    → SHA mismatch, re-fetch SHA and retry
- File over 1MB        → Warn user, skip, suggest manual upload
- Host not in allowlist→ Skip GitHub push, save to workspace only, retry later

---

## STEP 4 — Copy final outputs to workspace folder

Copy all deliverables to:
/sessions/zealous-serene-dijkstra/mnt/Claude_Desktop_MTV/

For skills, copy .skill file to:
/sessions/zealous-serene-dijkstra/mnt/Claude_Desktop_MTV/Personal_Skills/

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
If GitHub blocked: "⚠️ GitHub push blocked (network egress). Files saved to workspace only. Retry from a session with github.com access."

---

## Success criteria
- All new/modified files committed to GitHub ✓
- Final deliverables copied to workspace folder ✓
- Commit message clearly describes what was saved ✓
- No conflicts or push errors ✓
