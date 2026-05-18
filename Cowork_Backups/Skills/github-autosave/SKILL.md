---
name: Github_Autosave
description: >
  Reviews the current Claude chat or Cowork session and automatically saves any new or
  modified skills, artifacts, React components, HTML files, code files, SKILL.md files,
  or project files to Guillermo's GitHub repo (https://github.intuit.com/gguzman/Claude_Github)
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

```bash
source ~/Documents/Claude/env.sh 2>/dev/null
# env.sh sets GITHUB_PAT, GITHUB_REPO, GITHUB_API
# Stored at ~/Documents/Claude/env.sh — never committed to GitHub
```

Never write the PAT to any file or include it in commit messages.

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
3. Where it should go in GitHub (which folder under https://github.intuit.com/gguzman/Claude_Github)
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

## STEP 3 — Test connectivity first, then commit

### 3a — Connectivity check (do this BEFORE attempting any commits)

```bash
HTTP_CODE=$(curl -s --max-time 8 -o /dev/null -w "%{http_code}" \
  -H "Authorization: token $GITHUB_PAT" "https://github.intuit.com/api/v3/user")
echo "GitHub connectivity: $HTTP_CODE"
```

If `HTTP_CODE` is `000`, `403`, or empty → **GitHub is blocked by the Intuit network proxy.**
- Skip all remaining curl/API calls — they will all fail
- Jump straight to Step 4 (save files to workspace folder)
- Use the "blocked" report template in Step 5

Only proceed with Steps 3b/3c if `HTTP_CODE` is `200`.

### 3b — Check if file exists (get SHA for updates)
```bash
RESPONSE=$(curl -s -H "Authorization: token $GITHUB_PAT" \
  "$GITHUB_API/<repo_path>")
SHA=$(echo $RESPONSE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))" 2>/dev/null)
```

### 3c — Encode content and commit
```bash
CONTENT_B64=$(base64 -w 0 < /path/to/local/file)

# Build payload — omit sha field if new file
if [ -n "$SHA" ]; then
  PAYLOAD=$(printf '{"message":"Github_Autosave: %s [%s]","content":"%s","sha":"%s"}' \
    "<description>" "$(date +%Y-%m-%d)" "$CONTENT_B64" "$SHA")
else
  PAYLOAD=$(printf '{"message":"Github_Autosave: %s [%s]","content":"%s"}' \
    "<description>" "$(date +%Y-%m-%d)" "$CONTENT_B64")
fi

curl -s -X PUT \
  -H "Authorization: token $GITHUB_PAT" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$GITHUB_API/<repo_path>"
```

### Error handling
| Error | Action |
|-------|--------|
| 401 Unauthorized | PAT expired — update AUTHENTICATION section with new token |
| 422 Unprocessable | SHA mismatch — re-fetch SHA and retry once |
| File > 1MB | Warn user, skip, suggest manual upload |
| `000` / `403` / proxy error | GitHub blocked — skip to Step 4, use blocked report in Step 5 |

---

## STEP 4 — Copy final outputs to workspace folder

Copy all deliverables to the workspace folder so Guillermo can open them directly.
Find the current session's workspace path by running:
```bash
ls /sessions/*/mnt/Claude/ 2>/dev/null | head -1
```
The workspace root is: `/sessions/<session-id>/mnt/Claude/`

⚠️ IMPORTANT: NEVER create files or folders outside of `/sessions/<session-id>/mnt/Claude/`. Everything must be saved inside this folder. Do NOT create folders directly in `/sessions/<session-id>/mnt/` or anywhere else on the filesystem outside the Claude folder.

For skills, copy the packaged `.skill` file to the `skills/` subfolder.
For code files, copy to an appropriate subfolder per the workspace-organizer structure.

---

## STEP 5 — Report what was saved

### If GitHub push succeeded:
```
✅ Github_Autosave complete — [N] files saved

GitHub (https://github.intuit.com/gguzman/Claude_Github):
• [file] → [path]
• [file] → [path]

Workspace folder (Claude):
• [file] → [subfolder]

Commit: [short SHA or message]
```

### If nothing new was found:
```
Nothing new to save — session had no new files or code changes.
```

### If GitHub was blocked by network:
```
⚠️ GitHub push blocked — Intuit's network proxy is blocking api.github.com from this session.

Files are saved to your workspace folder ✅

To push to GitHub, run this in your terminal:

cd /Users/gguzman/Documents/Claude/Claude_Github
git add [list the specific new/changed files here]
git commit -m "Github_Autosave: [describe what was saved] [YYYY-MM-DD]"
git pull https://gguzman:$GITHUB_PAT@github.intuit.com/gguzman/Claude_Github.git --rebase
git push https://gguzman:$GITHUB_PAT@github.intuit.com/gguzman/Claude_Github.git
```

Always list the exact files to `git add` so Guillermo doesn't have to figure it out.

---

## Success criteria

- All new/modified files from the session committed to GitHub (or terminal commands provided if blocked) ✓
- Final deliverables copied to workspace folder ✓
- Commit message clearly describes what was saved ✓
- No conflicts or push errors ✓
