# Scheduled Tasks

## Active Schedules

| Task | Schedule | Cron | Status |
|------|----------|------|--------|
| daily-briefing-guillermo | Weekdays 8:30 AM PT | `30 8 * * 1-5` | ✅ Active |

---

## daily-briefing-guillermo

**Description:** Weekday morning briefing — Gmail + Calendar + Slack + CLPSE report  
**Output:** Posted to Slack DM (`D2YFUFTSR`) and saved as Gmail draft  
**Skill file:** `skills/scheduled/daily-briefing-guillermo/SKILL.md`  
**Data sources:**
- Gmail (unread last 24h)
- Google Calendar (today's events, America/Los_Angeles)
- Slack (DMs + @mentions for `W8DFFCX24`, last 24h)
- CLPSE Spotlight Tracker.xlsx (workspace folder)

**Output format:** Meetings table → Prioritized To-Do (P1/P2/P3) → CLPSE Report → Team Awareness
