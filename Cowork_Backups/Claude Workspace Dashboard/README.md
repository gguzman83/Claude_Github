# Claude Workspace Dashboard

**Backed up:** 2026-05-18  
**Owner:** Guillermo Guzman · IT Manager, Techknow Bar MV & SF

## What this is

A live, interactive read-only dashboard that visualizes everything in the `~/Documents/Claude` workspace — skills, projects, artifacts, scripts, docs, archive, and scheduled tasks. Opens as a local HTML file in any browser.

## Files

| File | Description |
|------|-------------|
| `Claude_Workspace_Dashboard.html` | The dashboard — open this in a browser |
| `scripts/scan_dashboard.py` | Scans the Claude folder and regenerates dashboard data. Run manually or via master-save. |
| `scripts/watch_claude_folder.command` | Double-click to start a live file watcher. Auto-reruns the scanner on any change. |

## How to restore

1. Copy `Claude_Workspace_Dashboard.html` to `~/Documents/Claude/`
2. Copy `scripts/scan_dashboard.py` and `scripts/watch_claude_folder.command` to `~/Documents/Claude/Scripts/`
3. Make scripts executable:
   ```bash
   chmod +x ~/Documents/Claude/Scripts/scan_dashboard.py
   chmod +x ~/Documents/Claude/Scripts/watch_claude_folder.command
   ```
4. Run the initial scan:
   ```bash
   python3 ~/Documents/Claude/Scripts/scan_dashboard.py
   ```
5. Open `~/Documents/Claude/Claude_Workspace_Dashboard.html` in a browser

## How live updates work

- **Auto-refresh:** The dashboard page refreshes every 30 seconds and restores your last-viewed section
- **File watcher:** Double-click `watch_claude_folder.command` to watch for changes in real time
- **master-save integration:** `scan_dashboard.py` runs automatically at the end of every master-save session

## Key paths scanned

| Section | Source |
|---------|--------|
| Skills | `~/.claude/skills/` |
| Projects | `~/Documents/Claude/Cowork_Backups/` |
| Artifacts | `~/Documents/Claude/Artifacts/` |
| Scripts | `~/Documents/Claude/Scripts/` |
| Docs | `~/Documents/Claude/` root + `Docs/` |
| Archive | `~/Documents/Claude/Archive/` |
| Scheduled | `~/Documents/Claude/Scheduled/` |
