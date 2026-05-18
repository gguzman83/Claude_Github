# My Daily Notes App — Backup

**Backed up:** 2026-05-18  
**Source:** /Users/gguzman/Documents/Claude/Claude_Github (local git clone)  
**Latest changes:** Edit Note popup modal — clicking ✏️ on any note now opens a floating popup (like Quick Capture) instead of an inline form. Includes all format buttons, live preview, ⌘S save, Pin & Archive, and Escape-to-close.

## Files

| File | Description |
|------|-------------|
| `index.html` | Frontend app — main UI (143KB, self-contained) |
| `Code.gs` | Google Apps Script backend — handles Doc sync, formatting, sections |

## Notes
- `Code.gs` was pulled from the repo root (latest version), not `daily-notes-app/Code.gs` (older version)
- Deploy `Code.gs` via Google Apps Script bound to the Daily Notes Google Doc
- `index.html` is served as a web app or sidebar from Apps Script

