# ExecTech Assessment — Backup

**Backed up:** 2026-05-13  
**Source:** /Users/gguzman/Documents/Claude/Claude_Github (local git clone)

## Files

| File | Description |
|------|-------------|
| `Exec Tech - Technical Assessment.html` | Latest frontend app — self-contained assessment UI with access controls, session codes, email notifications (78K) |
| `Code.gs` | Google Apps Script backend — handles responses, scoring, results email |
| `Exec Tech Assessment - Documentation.docx` | Manager walkthrough + overview doc |

## Notes
- HTML pulled from `artifacts/assessments/` (latest — more recent commits than `exec-tech-assessment/index.html`)
- Session codes are self-generating with email notification to John
- Deploy `Code.gs` via Google Apps Script, serve `index.html` as web app

## How to Restore
1. Deploy `Code.gs` in a new Google Apps Script project
2. Serve `Exec Tech - Technical Assessment.html` as a web app or sidebar
3. Update any hardcoded email addresses / notification recipients as needed
