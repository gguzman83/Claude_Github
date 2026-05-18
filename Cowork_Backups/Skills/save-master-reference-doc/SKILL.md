---
name: save-master-reference-doc
description: "Saves any new changes or modifications to the Claude_Environment_Master_Reference doc, archives older versions into the Archived folder, and pushes to GitHub. Use whenever the user says 'update the master reference doc', 'save changes to the reference', 'version the reference doc', or any similar phrasing. Also trigger proactively at the end of any session where a skill was modified, a new skill was added, Apps Script instructions changed, or config values were updated."
---

# Save Master Reference Skill

Captures changes from the current Claude session, rebuilds the Claude Environment
Master Reference document as a new versioned .docx, archives the previous version,
and saves everything to GitHub.

---

## When to Trigger

- User says "save changes to the master reference" or similar
- A skill was modified or created during the session
- A new skill was added to the environment
- Apps Script setup instructions changed
- Any config value (Slack ID, path, sheet URL, etc.) was updated
- End of any session where environment changes were made

**Proactive prompt:** At the end of sessions where changes were detected, ask:

> "Looks like we made some changes this session — want me to save them to the
> Master Reference doc? I'll version it and push to GitHub."

---

## Step 1 — Identify What Changed

Scan the current conversation for any of the following:

- **Skill changes**: New skills added, existing skills modified (content, paths, triggers)
- **Config changes**: Updated Slack IDs, file paths, sheet URLs, machine names
- **Apps Script changes**: New scripts, updated setup instructions, new config values
- **Doc structure changes**: New sections, removed sections, updated checklists

Build a changelog list — one line per change. Example format:

    CHANGED: daily-briefing SKILL.md — Step 2 now reads from Google Sheet URL instead of local file
    ADDED: save-master-reference skill (this skill)

---

## Step 2 — Determine the New Version Number

Find the current version by checking the sandbox workspace docs folder:

    ls /sessions/$(ls /sessions/ | head -1)/mnt/Claude_MBA/docs/Claude_Environment_Master_Reference_v*.docx

Parse the highest version number and increment by 1. Format: v3, v4, etc.

New filename format: Claude_Environment_Master_Reference_v[N].docx
Version stamp format for inside the doc: v[N] — [Month DD, YYYY] (e.g. v8 — May 14, 2026)

---

## Step 3 — Rebuild the Master Reference Doc

Read the docx SKILL.md before writing any code:
`/sessions/$(ls /sessions/ | head -1)/mnt/.claude/skills/docx/SKILL.md`

Rebuild the full document using the existing node.js docx build script pattern,
incorporating all changes identified in Step 1.

Key things to update in the rebuilt doc:

1. Cover page version stamp — update to v[N] — [Date]
2. Header — update version reference if present
3. Footer — update "Last updated" date
4. Changelog section (Section 0) — prepend the newest version at the top of the table.
   Format each row as: Version | Date | Changes summary
5. Section 1 — update any skill entries that changed
6. Section 3 (Key Config) — update any changed values

Save to:
- `/sessions/$(ls /sessions/ | head -1)/mnt/Claude_MBA/docs/Claude_Environment_Master_Reference_v[N].docx`

Call present_files with the output path.

---

## Step 4 — Archive Older Versions

**This step is mandatory every time a new version is saved.**

After saving the new version, move ALL previous versioned files out of `docs/` into
the `Archived/` folder. The `docs/` root should ALWAYS contain exactly one versioned
file — the one just built. No LATEST file. No duplicates.

```bash
DOCS=/sessions/$(ls /sessions/ | head -1)/mnt/Claude_MBA/docs
ARCHIVE="$DOCS/Archived"
NEW_FILE="Claude_Environment_Master_Reference_v[N].docx"   # substitute actual version

mkdir -p "$ARCHIVE"

for f in "$DOCS"/Claude_Environment_Master_Reference_v*.docx; do
  [ -f "$f" ] || continue
  fname=$(basename "$f")
  if [[ "$fname" != "$NEW_FILE" ]]; then
    mv "$f" "$ARCHIVE/$fname" && echo "Archived: $fname" || echo "Could not move: $fname — use mcp__cowork__allow_cowork_file_delete if blocked"
  fi
done
```

After this step, `docs/` must contain only:
- `Claude_Environment_Master_Reference_v[N].docx`   ← new version (the only file)
- `Archived/`                                        ← all prior versions

**GitHub repo** (`Claude_Github/docs/`):
Apply the same move using `git mv` in the local repo before committing (handled in Step 5).

---

## Step 5 — Push to GitHub

**Load the PAT from ~/.claude-pat — never ask Guillermo for it:**

The PAT is stored locally at `~/.claude-pat` (not git-tracked, never pushed to GitHub).
To set it up on a new machine: `echo "ghp_TOKEN" > ~/.claude-pat && chmod 600 ~/.claude-pat`

```bash
PAT=$(cat ~/.claude-pat 2>/dev/null | tr -d '[:space:]')
[ -z "$PAT" ] && echo "⚠️  No PAT found at ~/.claude-pat — create it first" && exit 1
echo "PAT loaded: ${PAT:0:8}..."
```

**Auto-detect the git root — the repo root is the Claude_MBA folder, NOT Claude_Github:**

```bash
# The git root is Claude_MBA (parent of Claude_Github)
REPO=$(find ~ -maxdepth 3 -name "Claude_MBA" -type d 2>/dev/null | head -1)
# Known paths as fallback:
#   Work:  ~/Desktop/Claude_Desktop_MTV
#   Home:  ~/Claude_MBA
[ -z "$REPO" ] && REPO=~/Desktop/Claude_Desktop_MTV
[ ! -d "$REPO" ] && REPO=~/Claude_MBA
echo "Using repo root: $REPO"
```

Commit the new version and archive moves in one operation:

```bash
# Stage all relevant files (paths relative to Claude_MBA git root)
git -C "$REPO" add docs/Claude_Environment_Master_Reference_v[N].docx
git -C "$REPO" add docs/Archived/
git -C "$REPO" add skills/user/save-master-reference-doc/SKILL.md
git -C "$REPO" add configs/github-config.md

# Commit and push using stored PAT
git -C "$REPO" commit -m "update: Master Reference v[N] -- [one-line summary] [YYYY-MM-DD]"
git -C "$REPO" pull --rebase https://${PAT}@github.intuit.com/gguzman/Claude_Github.git main
git -C "$REPO" push https://${PAT}@github.intuit.com/gguzman/Claude_Github.git main
```

Report results:

    Saved to GitHub:
    - docs/Claude_Environment_Master_Reference_v[N].docx             (new)
    - docs/Archived/Claude_Environment_Master_Reference_v[N-1].docx  (archived)
    View: https://github.intuit.com/gguzman/Claude_Github

---

## Step 6 — Also Commit Any Updated Skills

If any SKILL.md was modified during the session, also commit those to GitHub
in the same operation:

    skills/user/<skill-name>/SKILL.md  (updated)

Include in the same commit summary so everything is tracked together.

---

## Changelog History (seed values — update as versions are saved)

v8 | May 14, 2026   | daily-briefing formatting overhaul (color-coded tags, 12hr time, pipe
                      separators, square P1/P2/P3 headers); github-autosave skill unified
                      (replaces autosave + github-sync); workspace-organizer skill added;
                      Daily Notes App: fixed Keep Watch drag highlight + PINNED tab formatting;
                      save-master-reference-doc updated: archive folder renamed to Archived,
                      LATEST file removed, PAT stored in configs/github-config.md,
                      auto-detect repo path for work + home machines

v7 | May 4, 2026    | Daily Notes App: Keep Watch section upgraded with full note UI --
                      edit, checkbox, drag-drop, Pin & Archive matching all other sections;
                      fixed drag from Keep Watch to other sections

v6 | May 1, 2026    | Daily Notes App sync font updated to Avenir Next for Intuit (12pt);
                      confirmed bold section headers on sync

v5 | Apr 24, 2026   | GitHub PAT rotated; Documents/Claude merged into Desktop/Claude_Desktop_MTV;
                      Sync to Doc applies 1.15 line spacing; git push path documented

v4 | Apr 21, 2026   | Daily Notes App: replaced Meetings & Syncs with My Process Ownership;
                      cmd+Enter inserts newline; Show More/Less toggle; GitHub PAT in .claude/env.sh

v3 | Apr 20, 2026   | Updated daily-briefing STEP 2 to read CLPSE Tracker from live Google Sheets;
                      added autosave skill; added Live Notes formatting shortcuts

v2 | Apr 20, 2026   | Added autosave, weekly-team-standup, monthly-checkin skills;
                      added Apps Scripts section; added skills inventory table

v1 | Apr 20, 2026   | Initial release -- 6 skills, key config, setup checklist, troubleshooting

---

## Quality Checks Before Delivering

- Version number incremented correctly
- Cover page shows new version + date
- Changelog table has new row at the top
- All changed sections reflect actual changes (not just the version stamp)
- Older versioned files moved to docs/Archived/ (workspace + GitHub)
- docs/ root contains only the new versioned file — no LATEST, no duplicates
- File presented with present_files
- GitHub push confirmed with PAT auto-loaded from configs/github-config.md
- Updated SKILL.md files committed alongside the doc if any skill changed
