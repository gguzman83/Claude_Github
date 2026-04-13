# How to Use the `tech-promo-packet` Skill

A step-by-step guide for IT managers who want to generate a promotion proposal document for a technician using Claude.

---

## What This Skill Does

When triggered, Claude will:
1. Ask you for the tech's info and your raw performance notes
2. Synthesize your notes into 3 clean, evidence-based promotion pillars
3. Generate a branded `.docx` promo packet ready to submit
4. Optionally draft a Slack message to your manager

---

## How to Install It

1. Download the `tech-promo-packet.skill` file from Claude
2. Unzip it into your Claude skills folder:

```bash
mkdir -p ~/Claude_Github/skills/user/tech-promo-packet
unzip -p ~/Downloads/tech-promo-packet.skill tech-promo-packet/SKILL.md > \
  ~/Claude_Github/skills/user/tech-promo-packet/SKILL.md
```

3. Copy to your active Claude skills directory:

```bash
cp -r ~/Claude_Github/skills/user/tech-promo-packet \
  "$HOME/Library/Application Support/Claude/skills/user/"
```

4. Restart Claude — the skill will be available on next load.

---

## How to Trigger It

Just tell Claude naturally. Any of these will work:

- `"Help me write a promo doc for [name]"`
- `"I need to put [name] up for promotion"`
- `"Can you build a promotion packet for my tech?"`
- `"[Name] is ready for Senior — help me make the case"`

---

## What to Have Ready

Claude will ask for these if you don't provide them upfront:

| Field | Example |
|---|---|
| Tech's full name | Gilbert Liborio |
| Current role | Desktop Analyst |
| Target role | Senior Desktop Analyst |
| Your name & title | Guillermo Guzman III, Onsite IT Manager |
| Performance notes | Raw bullets, ticket numbers, project wins, rankings — anything you have |
| Time period *(optional)* | Q1 FY26 – April 2026 |

**Tip:** The more specific your notes, the stronger the pillars. Ticket counts, rankings, project names, and peer impact all make a difference.

---

## What You'll Get

### The .docx Promo Packet includes:
- **Cover banner** — tech name and role transition (e.g., Desktop Analyst → Senior Desktop Analyst)
- **Metrics snapshot** — key numbers surfaced as visual cards
- **3 evidence pillars** — synthesized from your notes, written in manager voice
- **Manager recommendation block** — signed off with your name and title
- **Header/footer** — confidential label, page numbers

### Pillar Framework
Claude structures the 3 bullets around:
1. **Volume & Performance** — throughput, rankings, ticket resolution data
2. **Cross-Functional Ownership** — projects beyond core role, KBs, partnerships
3. **Coaching, Mentorship & Innovation** — peers developed, AI tools built, process improvements

---

## Slack Message Option

After the doc is generated, Claude will offer to draft a Slack DM to your manager. It will:
- Condense everything into 3 tight bullets
- Keep the tone casual but credible (DM-appropriate, not formal)
- Save it as a **draft** — never sends without your review

To trigger it manually: `"Now draft the Slack message to [manager name]"`

---

## Quality Checks Claude Runs Automatically

Before delivering the doc, Claude verifies:
- ✅ Tech name is spelled correctly in all three places (header, banner, recommendation block)
- ✅ All numbers match your input exactly — no rounding up or inflating
- ✅ Rank language is accurate (e.g., "top 3" stays "top 3" — never upgraded to "#1")
- ✅ File is saved and presented for download

---

## Example Prompt

```
Help me write a promo doc for Gilbert Liborio.
He's a Desktop Analyst and I'm recommending him for Senior Desktop Analyst.
I'm Guillermo Guzman III, Onsite IT Manager.

Here are my notes:
- Top 3 L2 Ops technician for 8+ consecutive months
- 141 L2 tickets closed, 96 resolved, 50+ escalations deflected
- 620 incidents + 223 requests in core TKB role
- Led legal hold mobile capturing process with Legal & Forensics
- Pioneered Mobile Testing Lab expansion to ATL
- ~20 KB articles authored (CyberArk, UEM, macOS)
- Coaching Francisco on KCS, mentoring Vincent on mobile lab ops
- Built 5 custom AI tools across Gemini and ChatGPT
- Created Claude work tracker integrated with Google Sheets via Workato MCP
```

---

## Updating the Skill

If you want to modify the skill (e.g., change the doc layout, add a new section, update brand colors):

1. Edit `~/Claude_Github/skills/user/tech-promo-packet/SKILL.md`
2. Push the update:

```bash
cd ~/Claude_Github
git add skills/user/tech-promo-packet/SKILL.md
git commit -m "Update tech-promo-packet skill"
git push
```

3. Copy the updated file to your active Claude skills folder and restart Claude.

---

## File Locations

| File | Path |
|---|---|
| Skill definition | `~/Claude_Github/skills/user/tech-promo-packet/SKILL.md` |
| How-to guide | `~/Claude_Github/skills/user/tech-promo-packet/HOW-TO.md` |
| Active skill (Claude reads this) | `~/Library/Application Support/Claude/skills/user/tech-promo-packet/SKILL.md` |

---

*Created by Guillermo Guzman III — T4i CARE Onsite IT, Intuit*
