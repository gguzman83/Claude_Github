# 🤖 Claude_Github — Guillermo's AI Toolkit

> A personal reference library of Claude skills, artifacts, apps, and tools built for Intuit IT operations.
> Maintained by **Guillermo Guzman III** — Onsite IT Manager, T4i CARE, Intuit

---

## 📋 Table of Contents

- [🧠 Skills — User](#-skills--user)
- [⏰ Skills — Scheduled](#-skills--scheduled)
- [📜 Apps Script](#-apps-script)
- [⚙️ Configs](#-configs)
- [🎨 Artifacts](#-artifacts)
- [🔧 How-To Guides](#-how-to-guides)
- [📁 Folder Structure](#-folder-structure)
- [🔄 How to Update This Page](#-how-to-update-this-page)

---

## 🧠 Skills — User

Skills installed into Claude that trigger automatically based on what you ask.

**Install location:** `~/Library/Application Support/Claude/skills/user/`

| Skill | Description | Files |
|---|---|---|
| **tech-promo-packet** | Generates a branded `.docx` promotion proposal for Intuit technicians. Input a tech's name, current/target role, and raw performance notes — outputs a polished Word doc with metrics cards, 3 evidence pillars, and a manager recommendation block. Optionally drafts a Slack DM to your manager. | [SKILL.md](skills/user/tech-promo-packet/SKILL.md) · [HOW-TO](skills/user/tech-promo-packet/HOW-TO_techPromoPacket.md) |
| **daily-briefing** | Pulls from Gmail, Google Calendar, Slack, and Smartsheet CLPSE tracker to generate a personalized morning briefing. Delivers formatted Slack messages and a Gmail draft. | [SKILL.md](skills/user/daily-briefing/SKILL.md) |
| **clpse-thankyou** | Reads a Scope of Project Summary from Google Drive and drafts a high-energy Slack recognition message for the CLPSE or contributors on that project. | [SKILL.md](skills/user/clpse-thankyou/SKILL.md) |
| **snagit-organizer** | Organizes and renames Snagit screenshots and recordings based on content and context. | [SKILL.md](skills/user/snagit-organizer/SKILL.md) |
| **chat-summary** | Generates a clean, structured end-of-session summary from one or more Claude chats. Captures what was worked on, outputs produced, key decisions, next steps, and reference info. Supports inline, .docx, Slack draft, or GitHub log output. | [SKILL.md](skills/user/chat-summary/SKILL.md) |

---

## ⏰ Skills — Scheduled

Skills that run on a schedule via Claude Cowork (e.g., daily briefings posted automatically to Slack).

**Install location:** `~/Library/Application Support/Claude/skills/scheduled/`

| Skill | Description | File |
|---|---|---|
| **daily-briefing-guillermo** | Scheduled version of the daily briefing skill — runs weekdays at 8:30 AM PT and posts directly to Guillermo's Slack DM channel. Pulls from Gmail, Calendar, Slack, Smartsheet CLPSE tracker, and Daily Tasks Google Doc. | [SKILL.md](skills/scheduled/daily-briefing-guillermo/SKILL.md) |

---

## 📜 Apps Script

Google Apps Script files for automating Sheets, Docs, Gmail, and Calendar workflows.

| Script | Description | Files |
|---|---|---|
| **Apps Script Tool** | Google Apps Script with a web app interface. Backend logic in `Code.gs`, web UI in `index.html`. Update this description with what the script actually does. | [Code.gs](apps-script/Code.gs) · [index.html](apps-script/index.html) |

---

## ⚙️ Configs

Configuration files for Claude Cowork scheduled tasks and other automation settings.

| Config | Description | File |
|---|---|---|
| **scheduled-tasks** | Defines the scheduled Cowork tasks — task names, timing, skill references, and delivery targets (e.g., Slack channel IDs). | [scheduled-tasks.md](configs/scheduled-tasks.md) |

---

## 🎨 Artifacts

Standalone React apps, HTML tools, and interactive widgets built inside Claude.

| Artifact | Description | File |
|---|---|---|
| *(add yours here)* | When Claude builds an artifact you want to keep, save the code under `artifacts/` | — |

---

## 🔧 How-To Guides

Step-by-step guides for using skills, tools, and workflows.

| Guide | Description | File |
|---|---|---|
| **tech-promo-packet** | How to trigger the promo packet skill, what info to have ready, example prompt, and how to update the skill. | [HOW-TO](skills/user/tech-promo-packet/HOW-TO_techPromoPacket.md) |

---

## 📁 Folder Structure

```
Claude_Github/
├── README.md                              ← Master index (you are here)
├── configs/
│   └── scheduled-tasks.md                ← Cowork scheduled task configs
├── apps-script/
│   ├── Code.gs                           ← Apps Script backend
│   └── index.html                        ← Apps Script web UI
├── skills/
│   ├── user/
│   │   ├── tech-promo-packet/
│   │   │   ├── SKILL.md
│   │   │   └── HOW-TO_techPromoPacket.md
│   │   ├── daily-briefing/
│   │   │   └── SKILL.md
│   │   ├── clpse-thankyou/
│   │   │   └── SKILL.md
│   │   ├── snagit-organizer/
│   │   └── chat-summary/
│   │       └── SKILL.md
│   └── scheduled/
│       └── daily-briefing-guillermo/
│           └── SKILL.md
└── artifacts/                            ← React apps, HTML tools (add here)
```

---

## 🔄 How to Update This Page

When you add something new, update this README and push:

```bash
cd /Users/gguzman/Desktop/Claude_Desktop_MTV/Claude_Github
git add README.md
git commit -m "Update README — add [name]"
git push
```

Or ask Claude: *"Update my GitHub README to add [name] with this description"* and paste your notes.

---

*Last updated: April 13, 2026 — Guillermo Guzman III, Onsite IT Manager, T4i CARE*
