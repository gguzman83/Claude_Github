# My Daily Notes App — Backup

**Backed up:** 2026-05-15  
**Source:** /Users/gguzman/Documents/Claude/Claude_Github (local git clone)  
**Latest changes:** Quick Capture preview fix (shows for any text), layout restructured to independent flex columns so minimizing a section pulls the one below it up

## Files

| File | Description |
|------|-------------|
| `index.html` | Frontend app — main UI (143KB, self-contained) |
| `Code.gs` | Google Apps Script backend — handles Doc sync, formatting, sections |

## Notes
- `Code.gs` was pulled from the repo root (latest version), not `daily-notes-app/Code.gs` (older version)
- Deploy `Code.gs` via Google Apps Script bound to the Daily Notes Google Doc
- `index.html` is served as a web app or sidebar from Apps Script

