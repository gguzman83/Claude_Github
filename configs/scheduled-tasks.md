# Scheduled Tasks

## Active Schedules

| Task | Schedule | Cron | Status |
|------|----------|------|--------|
| daily-briefing-guillermo | Weekdays 8:30 AM PT | `30 8 * * 1-5` | ✅ Active |

---

## daily-briefing-guillermo

**Description:** Weekday morning briefing — Gmail + Calendar + Slack + Daily Tasks Doc + Smartsheet CLPSE  
**Output:** Posted to Slack DM (`D2YFUFTSR`) and saved as Gmail draft  
**Skill file:** `skills/scheduled/daily-briefing-guillermo/SKILL.md`  
**Data sources:**
- Gmail (unread last 24h)
- Google Calendar (today's events, America/Los_Angeles)
- Slack (DMs + @mentions for `W8DFFCX24`, last 24h)
- Daily Tasks Google Doc (today's tab, bolded non-struck items)
- Smartsheet — Care Launch Requests (live CLPSE project status)

**Output format:** Meetings → Prioritized To-Do (P1/P2/P3) → Day to Day Priority → CLPSE Project Status → Team Awareness

**Formatting note:** Slack tool uses standard markdown — use `**double asterisks**` for bold (not single `*`)
