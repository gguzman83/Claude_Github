# Care Launch CLPSE Tracker — Backup

**Backed up:** 2026-05-13  
**Source:** /Users/gguzman/Documents/Claude/.artifacts + .claude/skills + Claude_Github

## Files

| File | Description |
|------|-------------|
| `index.html` | Live Cowork artifact — CLPSE tracker UI (latest committed version, May 11) |
| `thumbnail.png` | Artifact thumbnail shown in Cowork |
| `versions/` | Full version history (10 snapshots, May 5 build progression) |
| `skills/clpse-thankyou/SKILL.md` | Related skill — reads project scope doc and drafts Slack thank-you for CLPSE |

## How to Restore
1. In Cowork, use `mcp__cowork__create_artifact` to recreate the artifact from `index.html`
2. Install the skill: copy `skills/clpse-thankyou/SKILL.md` → `/Documents/Claude/.claude/skills/clpse-thankyou/SKILL.md`
3. Version history in `versions/` can be used to roll back to any prior build
