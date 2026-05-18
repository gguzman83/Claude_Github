---
name: organize-folder
description: >
  Scans the root of Guillermo's Documents/Claude workspace folder and moves loose files into the correct subfolders (Scripts/, Artifacts/, Docs/, Archive/, MISC_Chats/), creates any missing folders, and deletes junk. Use this skill whenever Guillermo says "organize my Claude folder", "clean up Documents/Claude", "run the folder organizer", "my Claude folder is messy", "tidy up Claude", or anything implying the workspace folder needs organizing. Also self-trigger proactively at the end of any session where several new files landed in the Claude folder root — keeping it tidy is always better than letting it drift. When in doubt, trigger.
---

# Organize Claude Folder

Scans the root of Guillermo's Documents/Claude folder, routes each loose file to the right subfolder, creates any missing folders, and reports what moved.

## Workspace path

The Claude folder is mounted at: `/sessions/stoic-charming-pasteur/mnt/Claude`

## Step 1 — Scan for loose files

Run:
```bash
ls /sessions/stoic-charming-pasteur/mnt/Claude/
```

Collect only the **files** at root (not subdirectories). These are what you'll organize.

## Step 2 — Route each file

Apply these rules in order:

| File type / name pattern | Destination |
|---|---|
| `.gs` | `Scripts/` |
| `.sh`, `.command` | `Scripts/` |
| `.html` — filename contains "eval", "review", or "test" | `MISC_Chats/` |
| `.html` — all others | `Artifacts/` |
| `.skill`, any file named `SKILL.md` | `MISC_Chats/` (these are loose copies, not installed skills) |
| `.md` — except `Claude_Inventory.md` | `Docs/` |
| `.docx` — filename contains `v#` (like v10, v11), `archived`, or `_old` | `Archive/` |
| No extension — small temp/junk file | Flag for deletion (see Step 3) |
| Anything ambiguous | Ask Guillermo before touching it |

**Hard rules — never break these:**
- Never move folders, only loose files
- Never move `Claude_Inventory.md` — it stays at root as a quick reference
- Never move `Claude_Environment_Master_Reference_LATEST.docx` — the LATEST version stays at root

## Step 3 — Handle junk/deletion

Before deleting any file, call the `mcp__cowork__allow_cowork_file_delete` tool with the file path. Once permission is granted, delete with `rm`.

## Step 4 — Create missing folders and move files

```bash
mkdir -p /sessions/stoic-charming-pasteur/mnt/Claude/Scripts
mkdir -p /sessions/stoic-charming-pasteur/mnt/Claude/Artifacts
mkdir -p /sessions/stoic-charming-pasteur/mnt/Claude/Docs
mkdir -p /sessions/stoic-charming-pasteur/mnt/Claude/Archive
mkdir -p /sessions/stoic-charming-pasteur/mnt/Claude/MISC_Chats
```

Then `mv` each file to its destination.

## Step 5 — Report

Give a clean, brief summary. Something like:

```
Cleaned up! Here's what moved:

→ Scripts/: Code.gs, DailyBriefing.gs, env.sh
→ Artifacts/: clpse-tracker.html, daily-notes-app-index.html
→ MISC_Chats/: master-save.skill, old-briefing-SKILL.md
→ Deleted: zibYtI3T (temp zip)

⚠ Left at root (needs a call): mystery-file.txt — wasn't sure where this goes.
```

If everything was already clean, just say so — no drama needed.
