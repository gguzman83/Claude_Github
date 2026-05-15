---
name: cowork-backup
description: >
  Backs up a Cowork project or skill to the Cowork_Backups folder in both
  /Users/gguzman/Documents/Claude/Claude_Github and /Users/gguzman/Documents/Claude/Cowork_Backups.
  Use this skill whenever Guillermo says "back up [project]", "add [project] to Cowork_Backups",
  "update my backup", "back up my skills", "add this to the backup folder", or anything involving
  saving a project or skill to the Cowork_Backups folder. Also trigger at the end of any session
  where a new project was built or a skill was significantly updated — keeping the backup current
  is always better than letting it drift. When in doubt, trigger.
---

# Cowork Backup Skill

This skill backs up Cowork projects and skills to a central `Cowork_Backups/` folder so Guillermo
can restore his entire environment if he moves machines or his Cowork gets wiped.

## Paths (do not change these)

| Location | VM Path |
|----------|---------|
| Local git repo | `/sessions/determined-intelligent-feynman/mnt/Claude_Github` |
| `/Documents/Claude` | `/sessions/determined-intelligent-feynman/mnt/Claude` |
| Live skills | `/sessions/determined-intelligent-feynman/mnt/.claude/skills/` |
| Live artifacts | `/sessions/determined-intelligent-feynman/mnt/.artifacts/` |
| Live scheduled tasks | `/sessions/determined-intelligent-feynman/mnt/.scheduled/` |
| Backup destination (repo) | `/sessions/determined-intelligent-feynman/mnt/Claude_Github/Cowork_Backups/` |
| Backup destination (local) | `/sessions/determined-intelligent-feynman/mnt/Claude/Cowork_Backups/` |

> GitHub API is blocked by Intuit's network proxy. Always work from the local git clone instead.

---

## Step 1 — Identify what to back up

Determine if Guillermo wants to back up:
- **A project** (e.g., "My Daily Notes App", "ExecTech Assessment") → follow Step 2
- **A skill** (e.g., "back up my daily-briefing skill") → follow Step 3
- **All skills** (e.g., "back up all my skills") → follow Step 4
- **Everything / full backup** → run Steps 2–4 for all projects + all skills

If unclear, ask: "Is this a project backup or a skill backup — or both?"

---

## Step 2 — Back up a project

### 2a — Search for files

Search these locations for files related to the project name:
```bash
find /sessions/determined-intelligent-feynman/mnt/Claude_Github -iname "*<keyword>*" | grep -v ".git" | sort
find /sessions/determined-intelligent-feynman/mnt/Claude -iname "*<keyword>*" | grep -v Claude_Github | grep -v Cowork_Backups | sort
find /sessions/determined-intelligent-feynman/mnt/.artifacts -iname "*<keyword>*" | sort
```

Also check:
- `/sessions/determined-intelligent-feynman/mnt/Claude/Projects/` for project folders
- `/sessions/determined-intelligent-feynman/mnt/.claude/skills/` for related skills
- `/sessions/determined-intelligent-feynman/mnt/.scheduled/` for related scheduled tasks

### 2b — Identify the latest version

When multiple copies of the same file exist, use `git log` to find the most recently committed version:
```bash
cd /sessions/determined-intelligent-feynman/mnt/Claude_Github
git log --oneline -5 -- <relative-path-to-file>
```

For files with the same git commit, prefer the larger/more recent one. Files in `/Documents/Claude/Projects/` tend to be the most current (actively edited by Guillermo).

### 2c — Create the backup folder and copy files

```bash
BACKUP_NAME="<Exact Project Name>"
REPO_DEST="/sessions/determined-intelligent-feynman/mnt/Claude_Github/Cowork_Backups/$BACKUP_NAME"
LOCAL_DEST="/sessions/determined-intelligent-feynman/mnt/Claude/Cowork_Backups/$BACKUP_NAME"
mkdir -p "$REPO_DEST"
```

Copy all relevant files — preserving subfolder structure where it matters (e.g., skills, scheduled tasks).

### 2d — Redact secrets before copying

Before copying any SKILL.md or .gs file, check for hardcoded secrets:
```bash
grep -n "ghp_\|sk-\|Bearer \|password\|secret" <file> | head -10
```

If a PAT or secret is found, redact it before copying:
```bash
sed 's/ghp_[A-Za-z0-9]*/YOUR_GITHUB_PAT_HERE/g' <source> > <destination>
```

This is especially important for `github-autosave/SKILL.md` which contains a hardcoded PAT.

### 2e — Write a README.md

Every backup folder must have a `README.md` with:
- Project name + backup date
- Source path(s)
- File table (file name | description)
- How to restore (step-by-step)
- Any key integrations (Apps Script project URLs, Spreadsheet IDs, MCP connectors needed)

### 2f — Mirror to both destinations

```bash
cp -r "$REPO_DEST" "/sessions/determined-intelligent-feynman/mnt/Claude/Cowork_Backups/"
```

---

## Step 3 — Back up a specific skill

```bash
SKILL_NAME="<skill-name>"
mkdir -p "/sessions/determined-intelligent-feynman/mnt/Claude_Github/Cowork_Backups/Skills/$SKILL_NAME"

# Always pull from live .claude/skills — it's the installed version
cp "/sessions/determined-intelligent-feynman/mnt/.claude/skills/$SKILL_NAME/SKILL.md" \
   "/sessions/determined-intelligent-feynman/mnt/Claude_Github/Cowork_Backups/Skills/$SKILL_NAME/SKILL.md"
```

Redact any secrets (see Step 2d). Then mirror to local:
```bash
cp -r "/sessions/determined-intelligent-feynman/mnt/Claude_Github/Cowork_Backups/Skills/$SKILL_NAME" \
      "/sessions/determined-intelligent-feynman/mnt/Claude/Cowork_Backups/Skills/"
```

---

## Step 4 — Back up all skills

```bash
for skill_dir in /sessions/determined-intelligent-feynman/mnt/.claude/skills/*/; do
  skill_name=$(basename "$skill_dir")
  mkdir -p "/sessions/determined-intelligent-feynman/mnt/Claude_Github/Cowork_Backups/Skills/$skill_name"
  cp "$skill_dir/SKILL.md" \
     "/sessions/determined-intelligent-feynman/mnt/Claude_Github/Cowork_Backups/Skills/$skill_name/SKILL.md"
  echo "✅ $skill_name"
done
```

Redact secrets in `github-autosave/SKILL.md` (always):
```bash
sed -i 's/ghp_[A-Za-z0-9]*/YOUR_GITHUB_PAT_HERE/g' \
  "/sessions/determined-intelligent-feynman/mnt/Claude_Github/Cowork_Backups/Skills/github-autosave/SKILL.md"
```

Also check for and copy any packaged `.skill` files from `/Documents/Claude/`:
```bash
find /sessions/determined-intelligent-feynman/mnt/Claude -iname "*.skill" | grep -v Cowork_Backups | grep -v Claude_Github
```

Mirror everything to local:
```bash
cp -r "/sessions/determined-intelligent-feynman/mnt/Claude_Github/Cowork_Backups/Skills" \
      "/sessions/determined-intelligent-feynman/mnt/Claude/Cowork_Backups/"
```

---

## Step 5 — Output the git push command

Since GitHub API is blocked by Intuit's proxy, Guillermo must push from his terminal.
Always end with the exact commands to run:

```
✅ Backup complete — run this in your terminal to push to GitHub:

cd /Users/gguzman/Documents/Claude/Claude_Github
git add Cowork_Backups/
git commit -m "Cowork_Backups: add/update <project or skill name> [YYYY-MM-DD]"
git push origin main
```

---

## What a good backup looks like

```
Cowork_Backups/
└── My Project Name/
    ├── README.md              ← always required
    ├── index.html             ← main app file
    ├── Code.gs                ← Apps Script backend (if applicable)
    ├── skills/
    │   └── skill-name/
    │       └── SKILL.md
    └── versions/              ← artifact version history (if applicable)
        └── *.html
```

Keep the structure clean and self-contained — someone should be able to restore the project
from just this folder with no prior context.
