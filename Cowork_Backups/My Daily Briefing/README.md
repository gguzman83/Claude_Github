# My Daily Briefing (Guillermo Briefing) — Backup

**Backed up:** 2026-05-13  
**Source:** /Users/gguzman/Documents/Claude/Claude_Github (local git clone)

## Apps Script Project
**URL:** https://script.google.com/home/projects/1R5nxXSqLnf0HFVqtwjm2qpMuag3UjmfVkSinjWv2vES73g280a2-qZJv/edit

## Files

| File | Description |
|------|-------------|
| `skills/daily-briefing/SKILL.md` | Main Cowork skill — pulls Gmail, GCal, Slack + CLPSE tracker and formats morning briefing |
| `skills/scheduled/guillermo-briefing/SKILL.md` | Scheduled task config — runs briefing every weekday at 8:30 AM |
| `send-daily-briefing/Code.gs` | Google Apps Script backend — sends briefing via Gmail/Sheets |

## How to Restore
1. Copy `skills/daily-briefing/SKILL.md` → `/Documents/Claude/.claude/skills/daily-briefing/SKILL.md`
2. Copy `skills/scheduled/guillermo-briefing/SKILL.md` → `/Documents/Claude/.scheduled/guillermo-briefing/SKILL.md`
3. Redeploy `send-daily-briefing/Code.gs` via the Apps Script project link above
4. Reconnect Gmail, Google Calendar, and Slack MCP connectors in Cowork

## Key Integrations
- Gmail MCP — unread + starred emails
- Google Calendar MCP — today's meetings
- Slack MCP — DMs, @mentions, Later/saved items
- Google Drive MCP — CLPSE Spotlight Tracker (Sheets ID: 1HCgtlfpknaPxS_R72lmSStRO6Om4jJfFZfW7PoIjTbY)
