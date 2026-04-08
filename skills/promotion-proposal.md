---
name: promotion-proposal
description: Generate a polished, review-ready promotion proposal document (.docx) for Intuit managers submitting an employee for promotion. Use this skill whenever a manager wants to build, create, draft, or document a promotion case — whether they say "help me write a promo doc," "I need to submit a promotion for [name]," "can you put together a promotion proposal," "my employee is ready for the next level," or any similar phrasing. Also trigger when a manager shares a mid-year review, performance check-in, accomplishment list, or Spotlight award and says anything about a promotion or level change. When in doubt, trigger — it's easier to confirm than to miss a promotion window.
---

# Promotion Proposal Generator

This skill builds a polished .docx promotion proposal ready for manager review and leadership calibration. The output follows Intuit's standard structure and meets the review standards expected by senior leadership.

---

## Step 1: Interview the Manager

Gather the following conversationally. If supporting documents were uploaded (mid-year reviews, check-ins, peer feedback), extract what you can and ask only about what's missing.

**Required fields:**
- Employee full name and Intuit email
- Current title and level (e.g., Service Desk Analyst 2 / SD2)
- Proposed title and level (e.g., Senior Service Desk Analyst 3 / SD3)
- Manager name and email
- Department / team
- Proposed effective date or fiscal quarter
- **Mid-year performance rating** — get the exact language (e.g., "Trajectory Changing", "High Impact", "On Track"). This goes in the exec summary and carries real weight.
- **2–4 key accomplishments** that show the employee already performing at the higher level. For each, ask:
  - What did they do?
  - What was the measurable impact? (hours saved, users supported, deadline met, systems improved — any number is better than none)
  - What higher-level job criterion does it demonstrate?

**Nice to have:**
- Formal recognition (Spotlight awards, peer kudos, leadership shout-outs)
- Specific project names, tools, or systems
- Supporting files to cross-reference

---

## Step 2: Cross-Reference Any Supporting Documents

If the manager uploaded supporting materials, review each one and flag:
- **Quantified metrics** that didn't make it into what they described (hours saved, counts, percentages) — these belong in the justification items
- **Formal rating language** to quote verbatim (e.g., "Trajectory Changing" or "fundamentally changed how X operates")
- **Specific project names or outcomes** the manager may have glossed over
- **Any gaps** between what the document says and what the proposal will claim

---

## Step 3: Structure the Content

Before generating the document, mentally organize the content:

**Executive summary** — one short paragraph: who, what level, when, and the single strongest rationale (usually the mid-year rating + one headline achievement). This is what gets read first and skimmed by anyone above the direct manager.

**Justification items** — 4–6 items, each mapping to a higher-level job criterion. Keep each one to 2–3 sentences. The goal: specific, concrete, and tied to a number or outcome wherever possible. "Led cross-functional automation project" is weak. "Led the ALOM Refresh automation program, saving the team 50+ hours in manual processing time" is strong.

**Compensation & budget** — even a placeholder is better than nothing. Proposals without a cost signal often get sent back at Tommi's level and above. If the manager doesn't have the numbers, include: `[Add before submitting: T-level pay band delta and estimated annualized cost increase. Confirm coverage within existing headcount budget.]`

**Retention risk** — 2–3 sentences framing the promotion as the lower-cost path. What does the business lose if this person isn't promoted? Focus on workstream continuity, knowledge concentration, and the cost of backfill.

**Rubric mapping table** — maps each formal job-level criterion to specific evidence. This is the most important element for calibration committees and HR — it shows the manager did the work.

**Additional context** — Spotlight awards, formal recognitions, or any other signals that add weight.

---

## Step 4: Generate the Document

Use the bundled script at `scripts/build_proposal.js`.

### 4a. Install dependency (if not already installed)
```bash
cd /path/to/this/skill && npm install docx
# Or globally: npm install -g docx
```

### 4b. Build the input JSON

Populate all fields from the interview. Write to a temp file:
```bash
cat > /tmp/proposal_data.json << 'EOF'
{ ... }
EOF
```

See the **JSON schema** section below for the exact structure.

### 4c. Run the script
```bash
node scripts/build_proposal.js /tmp/proposal_data.json /path/to/outputs/[Name]_Promotion_Proposal.docx
```

### 4d. Deliver
Save to the outputs folder and provide a download link to the manager.

---

## JSON Schema

```json
{
  "employee": {
    "name": "Full Name",
    "email": "email@intuit.com",
    "currentTitle": "Service Desk Analyst 2",
    "currentLevel": "T2 / SD2",
    "proposedTitle": "Senior Service Desk Analyst 3",
    "proposedLevel": "T3 / SD3",
    "department": "Care — Global Asset Management",
    "managerName": "Manager Full Name",
    "managerEmail": "manager@intuit.com",
    "effectiveDate": "Q2 FY2026 (Recommend: April 1, 2026)",
    "promotionType": "Merit-based — Performance & Scope Expansion",
    "timeInLevel": "Performing at T3 level throughout FY2026"
  },
  "proposal": {
    "midYearRating": "Trajectory Changing",
    "executiveSummary": "One paragraph leading with the ask, the mid-year rating, and the headline rationale. Keep it to 3 sentences.",
    "justifications": [
      {
        "number": 1,
        "title": "Business Process & Systems Integration",
        "subtitle": "Multi-stream project ownership",
        "criterion": "T3 Criterion: The formal job criterion text goes here.",
        "evidence": "Detailed evidence paragraph. Be specific — name the project, the outcome, the number."
      }
    ],
    "compensationNote": "[Add before submitting: T-level pay band delta and estimated annualized cost increase. Confirm coverage within existing FY2026 headcount budget.]",
    "retentionRisk": "Employee owns active workstreams with no backup owner. At current-level compensation for this scope, retention risk is elevated. Promoting now protects continuity and is the lower-cost path compared to backfill and knowledge transfer.",
    "rubricMapping": [
      {
        "criterion": "Drive improvement in business processes across multiple parallel streams",
        "evidence": "Specific, concrete evidence tied to this criterion."
      }
    ],
    "spotlightAward": "Received a Spotlight Award in Q1 2026, reflecting formal recognition from peers and leadership for performance that meaningfully exceeded role expectations.",
    "additionalContext": ""
  }
}
```

**Notes on the schema:**
- `justifications` array: include 4–6 items, each with its own `number`, `title`, `subtitle`, `criterion`, and `evidence`
- `spotlightAward`: leave as empty string `""` if none
- `additionalContext`: leave as empty string `""` if nothing else to add; use it for anything that doesn't fit elsewhere
- `compensationNote`: replace with actual numbers when the manager has them; the placeholder is fine to ship with

---

## Document Quality Checklist

Before generating, verify:

- [ ] Exec summary leads with the ask — not with background or context
- [ ] Mid-year rating is quoted using exact Intuit language
- [ ] Every justification item has at least one specific number or outcome
- [ ] Project names are spelled correctly and consistently
- [ ] Compensation section is present (even as a placeholder)
- [ ] Retention risk is included
- [ ] Rubric table maps all relevant higher-level criteria
- [ ] Acronyms are defined on first use if the audience extends beyond the direct team (HRBP, Finance, and senior leaders won't know internal IT acronyms)

---

## Notes on Tone

The best promotion proposals read as a clean story: here's who this person is, here's what they've already been doing at the next level, here's why recognizing it now is the right call. Avoid language that sounds like a checklist or compliance exercise. Every sentence should either move the case forward or be cut.
