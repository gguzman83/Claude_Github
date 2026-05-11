---
name: save-master-reference-doc
description: "Saves any new changes or modifications to the Claude_Environment_Master_Reference doc, archives older versions into the Master_Reference_doc folder, and pushes to GitHub. Use whenever the user says 'update the master reference doc', 'save changes to the reference', 'version the reference doc', or any similar phrasing. Also trigger proactively at the end of any session where a skill was modified, a new skill was added, Apps Script instructions changed, or config values were updated."
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

Find the current version by checking the workspace docs folder:

    ls ~/Documents/Claude/Claude_Desktop_MTV/docs/Claude_Environment_Master_Reference_v*.docx

Parse the highest version number and increment by 1. Format: v3, v4, etc.

New filename format: Claude_Environment_Master_Reference_v[N].docx
Version stamp format for inside the doc: v[N] — [Month DD, YYYY] (e.g. v8 — May 4, 2026)

---

## Step 3 — Rebuild the Master Reference Doc

Read the docx SKILL.md before writing any code:
`/sessions/zealous-serene-dijkstra/mnt/.claude/skills/docx/SKILL.md`

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
- `~/Documents/Claude/Claude_Desktop_MTV/docs/Claude_Environment_Master_Reference_v[N].docx`
- `~/Documents/Claude/Claude_Desktop_MTV/docs/Claude_Environment_Master_Reference_LATEST.docx`

Call present_files with the output path.

---

## Step 4 — Archive Older Versions

After saving the new version, move any previous versioned files out of `docs/` into
the `Master_Reference_doc/` archive folder. This keeps the `docs/` root clean — only
the freshly built version and LATEST live there.

**Workspace folder** (`~/Documents/Claude/Claude_Desktop_MTV/docs/`):

```bash
DOCS=~/Documents/Claude/Claude_Desktop_MTV/docs
ARCHIVE="$DOCS/Master_Reference_doc"
NEW_FILE="Claude_Environment_Master_Reference_v[N].docx"   # substitute actual version

mkdir -p "$ARCHIVE"

for f in "$DOCS"/Claude_Environment_Master_Reference_v*.docx; do
  fname=$(basename "$f")
  if [[ "$fname" != "$NEW_FILE" ]]; then
    mv "$f" "$ARCHIVE/$fname"
    echo "Archived: $fname"
  fi
done
```

After this, `docs/` should contain only:
- `Claude_Environment_Master_Reference_v[N].docx`   <- new version
- `Claude_Environment_Master_Reference_LATEST.docx` <- current pointer
- `Master_Reference_doc/`                           <- all prior versions

**GitHub repo** (`Claude_Github/docs/`):
Apply the same move using `git mv` in the local repo before committing (handled in Step 5).

---

## Step 5 — Push to GitHub

Commit the new version, the archive moves, and any updated LATEST in one operation:

```bash
REPO=~/Documents/Claude/Claude_Desktop_MTV/Claude_Github

# Create archive folder in repo if needed
mkdir -p "$REPO/docs/Master_Reference_doc"

# git mv older versioned files into archive (substitute actual NEW version)
for f in "$REPO"/docs/Claude_Environment_Master_Reference_v*.docx; do
  fname=$(basename "$f")
  if [[ "$fname" != "Claude_Environment_Master_Reference_v[N].docx" ]]; then
    git -C "$REPO" mv "docs/$fname" "docs/Master_Reference_doc/$fname"
    echo "git mv: $fname"
  fi
done

# Stage new version and updated LATEST
git -C "$REPO" add docs/Claude_Environment_Master_Reference_v[N].docx
git -C "$REPO" add docs/Claude_Environment_Master_Reference_LATEST.docx

# Commit and push
git -C "$REPO" commit -m "update: Master Reference v[N] -- [one-line summary] [YYYY-MM-DD]"
git -C "$REPO" push
```

Report results:

    Saved to GitHub:
    - docs/Claude_Environment_Master_Reference_v[N].docx                          (new)
    - docs/Claude_Environment_Master_Reference_LATEST.docx                        (updated)
    - docs/Master_Reference_doc/Claude_Environment_Master_Reference_v[N-1].docx  (archived)
    View: https://github.com/gguzman83/Claude_Github

---

## Step 6 — Also Commit Any Updated Skills

If any SKILL.md was modified during the session, also commit those to GitHub
in the same operation:

    skills/user/<skill-name>/SKILL.md  (updated)

Include in the same commit summary so everything is tracked together.

---

## Changelog History (seed values — update as versions are saved)

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
- Older versioned files moved to docs/Master_Reference_doc/ (workspace + GitHub)
- docs/ root contains only the new version + LATEST
- File presented with present_files
- GitHub push confirmed if requested
- Updated SKILL.md files committed alongside the doc if any skill changed
