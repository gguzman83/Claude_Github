const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, ExternalHyperlink
} = require('docx');
const fs = require('fs');

// ─── Color palette ───────────────────────────────────────────────────────────
const TEAL      = "1A7F8E";
const STEEL     = "2E5D7E";
const LIGHT_BG  = "EAF4F6";
const AMBER     = "F59E0B";
const AMBER_BG  = "FFFBEB";
const GREEN_BG  = "F0FDF4";
const GREEN     = "166534";
const RED_BG    = "FEF2F2";
const RED       = "991B1B";
const GRAY_BG   = "F3F4F6";
const GRAY_BD   = "D1D5DB";
const WHITE     = "FFFFFF";
const BLACK     = "1F2937";

// ─── Border helpers ──────────────────────────────────────────────────────────
function cellBorder(color = GRAY_BD) {
  const b = { style: BorderStyle.SINGLE, size: 1, color };
  return { top: b, bottom: b, left: b, right: b };
}
function noBorder() {
  const b = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  return { top: b, bottom: b, left: b, right: b };
}

// ─── Callout box (2-cell table: icon | text) ─────────────────────────────────
function callout(icon, iconColor, bgColor, textLines) {
  const iconCell = new TableCell({
    borders: noBorder(),
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    width: { size: 500, type: WidthType.DXA },
    margins: { top: 100, bottom: 100, left: 120, right: 80 },
    children: [new Paragraph({
      children: [new TextRun({ text: icon, bold: true, color: iconColor, size: 24 })]
    })]
  });
  const textCell = new TableCell({
    borders: noBorder(),
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    width: { size: 8860, type: WidthType.DXA },
    margins: { top: 100, bottom: 100, left: 80, right: 120 },
    children: textLines.map((line, i) => new Paragraph({
      spacing: i === 0 ? { before: 0, after: 60 } : { before: 0, after: 0 },
      children: Array.isArray(line) ? line : [new TextRun({ text: line, size: 20, color: BLACK })]
    }))
  });
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [500, 8860],
    rows: [new TableRow({ children: [iconCell, textCell] })]
  });
}

// ─── Info/tip/warning callouts ───────────────────────────────────────────────
const tip  = (lines) => callout("💡", TEAL,  LIGHT_BG, lines);
const warn = (lines) => callout("⚠️", AMBER, AMBER_BG, lines);
const good = (lines) => callout("✅", GREEN, GREEN_BG, lines);

// ─── Placeholder callout (the new "customize this" boxes) ────────────────────
function placeholder(label, description) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2800, 6560],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: cellBorder(TEAL),
          shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
          width: { size: 2800, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 80 },
          children: [new Paragraph({
            children: [new TextRun({ text: label, bold: true, color: TEAL, size: 20, font: "Courier New" })]
          })]
        }),
        new TableCell({
          borders: cellBorder(GRAY_BD),
          shading: { fill: WHITE, type: ShadingType.CLEAR },
          width: { size: 6560, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: description, size: 20, color: BLACK, italics: true })]
          })]
        })
      ]
    })]
  });
}

// ─── Section heading helper ───────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, color: STEEL, size: 32, font: "Calibri" })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, color: TEAL, size: 26, font: "Calibri" })]
  });
}

// ─── Body paragraph ───────────────────────────────────────────────────────────
function p(runs, spacing = { before: 80, after: 120 }) {
  const children = Array.isArray(runs)
    ? runs
    : [new TextRun({ text: runs, size: 20, color: BLACK })];
  return new Paragraph({ spacing, children });
}

function sp() {
  return new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun("")] });
}

// ─── Bullet ───────────────────────────────────────────────────────────────────
function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, size: 20, color: BLACK, bold })]
  });
}

// ─── 2-col info table ─────────────────────────────────────────────────────────
function infoTable(rows, col1Width = 2800) {
  const col2Width = 9360 - col1Width;
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [col1Width, col2Width],
    rows: rows.map(([left, right], i) => new TableRow({
      children: [
        new TableCell({
          borders: cellBorder(),
          shading: { fill: i % 2 === 0 ? GRAY_BG : WHITE, type: ShadingType.CLEAR },
          width: { size: col1Width, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 80 },
          children: [new Paragraph({ children: [new TextRun({ text: left, bold: true, size: 20, color: BLACK })] })]
        }),
        new TableCell({
          borders: cellBorder(),
          shading: { fill: i % 2 === 0 ? WHITE : GRAY_BG, type: ShadingType.CLEAR },
          width: { size: col2Width, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: Array.isArray(right)
            ? right
            : [new TextRun({ text: right, size: 20, color: BLACK })] })]
        })
      ]
    }))
  });
}

// ─── Code block ───────────────────────────────────────────────────────────────
function codeBlock(lines) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        borders: cellBorder(STEEL),
        shading: { fill: "1E293B", type: ShadingType.CLEAR },
        width: { size: 9360, type: WidthType.DXA },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        children: lines.map(line => new Paragraph({
          spacing: { before: 0, after: 40 },
          children: [new TextRun({ text: line, size: 18, color: "7DD3FC", font: "Courier New" })]
        }))
      })]
    })]
  });
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function divider() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_BG, space: 1 } },
    spacing: { before: 160, after: 160 },
    children: [new TextRun("")]
  });
}

// ─── TITLE PAGE ───────────────────────────────────────────────────────────────
const titlePage = [
  sp(), sp(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 120 },
    children: [new TextRun({ text: "📓", size: 96 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text: "Daily Notes App", bold: true, size: 64, color: STEEL, font: "Calibri" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
    children: [new TextRun({ text: "Build Your Own — Template & Setup Guide", size: 28, color: TEAL, font: "Calibri", italics: true })]
  }),
  new Table({
    width: { size: 6000, type: WidthType.DXA },
    columnWidths: [6000],
    rows: [new TableRow({
      children: [new TableCell({
        borders: noBorder(),
        shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
        width: { size: 6000, type: WidthType.DXA },
        margins: { top: 200, bottom: 200, left: 300, right: 300 },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "[YOUR NAME]", bold: true, size: 24, color: TEAL, font: "Calibri" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "[YOUR ROLE / TEAM]", size: 20, color: BLACK, font: "Calibri" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "[Month Year]", size: 20, color: BLACK, font: "Calibri", italics: true })] }),
        ]
      })]
    })]
  }),
  sp(), sp(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [new TextRun({ text: "Based on the Techknow Bar Daily Notes App  |  Built with Google Apps Script + Claude", size: 18, color: "9CA3AF", italics: true })]
  }),
];

// ─── SECTION 0: Quick Config (the new "make it yours" section) ────────────────
const section0 = [
  divider(),
  h1("0. Quick Configuration — Replace These First"),
  p("Before touching any code, fill in the five values below. They appear throughout Code.gs and the Google Doc structure. Once you've replaced them, the rest of the setup guide applies as-is."),
  sp(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2800, 3000, 3560],
    rows: [
      new TableRow({
        children: [
          new TableCell({ borders: cellBorder(STEEL), shading: { fill: STEEL, type: ShadingType.CLEAR }, width: { size: 2800, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Placeholder", bold: true, size: 20, color: WHITE })] })] }),
          new TableCell({ borders: cellBorder(STEEL), shading: { fill: STEEL, type: ShadingType.CLEAR }, width: { size: 3000, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "What to Replace It With", bold: true, size: 20, color: WHITE })] })] }),
          new TableCell({ borders: cellBorder(STEEL), shading: { fill: STEEL, type: ShadingType.CLEAR }, width: { size: 3560, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Example", bold: true, size: 20, color: WHITE })] })] }),
        ]
      }),
      ...[
        ["[YOUR_DOC_ID]", "Your Google Doc ID (from the URL)", "1PRS_iUx0ma6JGt_hJGtAU..."],
        ["[YOUR_TEAM_NAME]", "Your team or org name", "Platform Engineering"],
        ["[YOUR_PINNED_HEADING]", "Exact text of the PINNED tab anchor heading", "PINNED (Things to Remember)"],
        ["[YOUR_FY_LABEL]", "Your current fiscal year label", "FY26 or FY2026"],
        ["[YOUR_MONTH_TAB]", "Name of the current month parent tab in your doc", "April 2026 Q2"],
      ].map(([ph, what, ex], i) => new TableRow({
        children: [
          new TableCell({ borders: cellBorder(), shading: { fill: i % 2 === 0 ? LIGHT_BG : WHITE, type: ShadingType.CLEAR }, width: { size: 2800, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: ph, bold: true, size: 19, color: TEAL, font: "Courier New" })] })] }),
          new TableCell({ borders: cellBorder(), shading: { fill: i % 2 === 0 ? WHITE : LIGHT_BG, type: ShadingType.CLEAR }, width: { size: 3000, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: what, size: 20, color: BLACK })] })] }),
          new TableCell({ borders: cellBorder(), shading: { fill: GRAY_BG, type: ShadingType.CLEAR }, width: { size: 3560, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: ex, size: 19, color: "6B7280", font: "Courier New", italics: true })] })] }),
        ]
      }))
    ]
  }),
  sp(),
  tip(["In Code.gs, these placeholders appear as constants near the top of the file. Update them once there — no find-and-replace throughout the code needed."]),
];

// ─── SECTION 1: Overview ──────────────────────────────────────────────────────
const section1 = [
  divider(),
  h1("1. Overview"),
  p("The Daily Notes App is a Google Apps Script web app that acts as a structured daily operations dashboard for your team. It replaces ad-hoc note-taking with a synced, organized system that writes directly to a Google Doc — capturing notes, priorities, incidents, and pinned information all in one place."),
  sp(),
  tip(["This app runs entirely inside your Google account — no servers, no hosting fees, no third-party tools. Just Google Apps Script."]),
  sp(),
  h2("What It Does"),
  bullet("Captures daily notes in four categories: Incidents & Escalations, Tasks, Projects, and Meetings"),
  bullet("Provides a Live Notes stream for quick timestamped jots"),
  bullet("Reads and displays Pinned Notes from your Google Doc, organized by Fiscal Year"),
  bullet("Syncs all notes to your Google Doc in a formatted, numbered outline"),
  bullet("Creates a new dated tab (e.g., \"Monday, April 14\") under the current month's parent tab on each sync"),
  bullet("Archives pinned notes to a PINNED Info tab with a full date timestamp"),
  bullet("Stores note data in Google's PropertiesService — notes sync automatically across machines"),
  sp(),
  h2("Who This Is For"),
  p("Anyone who wants a lightweight, structured daily ops log tied directly to a Google Doc. Works best for team leads, operations managers, or anyone running a support queue or project board who wants their notes, incidents, and priorities in one synced place."),
];

// ─── SECTION 2: Tech Stack ────────────────────────────────────────────────────
const section2 = [
  divider(),
  h1("2. Tech Stack"),
  p("The app uses only Google-native technology — no external dependencies, no framework setup."),
  sp(),
  infoTable([
    ["Google Apps Script", "Backend runtime — server-side JavaScript inside Google's cloud. Handles doc reads/writes, data storage, and serves the web app."],
    ["HtmlService", "Serves the frontend HTML/CSS/JS as a web app URL. The entire UI runs in the browser via this service."],
    ["PropertiesService", "Key-value storage tied to your Google account. Stores notes as JSON so they sync across devices automatically."],
    ["DocumentApp", "Google Docs API — reads the PINNED Info tab, writes daily summaries, creates new dated tabs, and archives pinned notes."],
    ["Caja Sandbox", "Apps Script's browser sandbox. All dynamic styling must use inline element.style (CSS class selectors are stripped)."],
  ], 2400),
];

// ─── SECTION 3: File Structure ────────────────────────────────────────────────
const section3 = [
  divider(),
  h1("3. File Structure"),
  p("The app is two files. That's it."),
  sp(),
  codeBlock([
    "apps-script/",
    "  Code.gs       ← Backend: all server-side logic",
    "  index.html    ← Frontend: full UI (HTML + CSS + JS in one file)",
  ]),
  sp(),
  p("Both files live in the Google Apps Script editor at script.google.com. Back them up to GitHub (or any version control) so you can restore or share them easily."),
];

// ─── SECTION 4: Customization Guide ──────────────────────────────────────────
const section4 = [
  divider(),
  h1("4. What to Customize"),
  p("These are the parts of the app most likely to need changes for your team. Everything else can stay as-is."),
  sp(),
  h2("4a. Note Categories"),
  p("The four default categories — Incidents & Escalations, Tasks, Projects, Meetings — are defined in the frontend state object in index.html. To rename or add categories, update this block:"),
  sp(),
  codeBlock([
    "const state = {",
    "  notes: {",
    "    incidents: [],   // ← rename key + update all references",
    "    tasks: [],",
    "    projects: [],",
    "    meetings: []",
    "  },",
    "  live: []",
    "}",
  ]),
  sp(),
  warn(["If you rename a category key, update every place that key is referenced in index.html — especially buildSyncSections(), buildSyncHtml(), buildSyncText(), and the UI rendering logic."]),
  sp(),
  h2("4b. Auto-Categorization Keywords"),
  p("The autoCat() function in index.html routes notes to categories based on keywords. Customize these to match your team's language:"),
  sp(),
  codeBlock([
    "// Current defaults — replace with your team's vocabulary:",
    "incident, outage, down, escalat, p1, p2, sev  → Incidents",
    "meeting, sync, standup, 1:1, call, zoom       → Meetings",
    "project, initiative, launch, rollout, deploy  → Projects",
    "(everything else)                             → Tasks",
  ]),
  sp(),
  h2("4c. Fiscal Year Labels"),
  p("The app uses FY headings inside the PINNED Info tab to organize archived notes. If your org uses a different convention (e.g., FY2026, Q1-2026, or calendar year), update:"),
  bullet("The heading text inside your Google Doc's PINNED Info tab"),
  bullet("The FY parsing logic in getPinnedNotes() in Code.gs — specifically the regex that matches \"FY##\" headings"),
  sp(),
  h2("4d. Google Doc Tab Structure"),
  p("The app expects specific tab names in your Google Doc. You can rename them — just update the matching logic in Code.gs:"),
  sp(),
  infoTable([
    ["PINNED Info tab", "Any name works — update the tab search in getPinnedNotes() and archiveNoteToDoc()"],
    ["Month parent tab", "Must contain the current month + year in the title. Format: \"April 2026\" or \"April 2026 Q4\" both work."],
    ["PINNED anchor heading", "The heading text that marks where archived notes insert. Set to your [YOUR_PINNED_HEADING] value."],
  ], 2600),
  sp(),
  h2("4e. Sync Format"),
  p("The appendToDoc() function in Code.gs defines how notes are written to the Google Doc (numbered outlines, section headers, strikethrough for done items). If your doc uses a different format — e.g., bullet points instead of numbered lists, or different section labels — this is the function to edit."),
];

// ─── SECTION 5: Setup & Deployment ───────────────────────────────────────────
const section5 = [
  divider(),
  h1("5. Setup & Deployment"),
  h2("First-Time Setup"),
  p("Follow these steps in order:"),
  sp(),
  infoTable([
    ["Step 1", "Go to script.google.com and create a new project. Rename it (e.g., \"Daily Notes App\")."],
    ["Step 2", "Replace the default Code.gs contents with the contents of Code.gs from the source."],
    ["Step 3", "Create a new HTML file named \"index\" (File → New → HTML file). Paste the contents of index.html."],
    ["Step 4", "Update the DOC_ID constant at the top of Code.gs with your Google Doc ID."],
    ["Step 5", "Update the PINNED_HEADING constant to match your doc's PINNED anchor text."],
    ["Step 6", "Click Deploy → New deployment → Web app."],
    ["Step 7", "Set \"Execute as: Me\" and \"Who has access: Only myself\" (or your org)."],
    ["Step 8", "Click Deploy and copy the web app URL. Bookmark it — that's your app."],
  ], 1200),
  sp(),
  tip(["The Google Doc ID is the long string in the doc URL between /d/ and /edit. Example: docs.google.com/document/d/[THIS_IS_YOUR_ID]/edit"]),
  sp(),
  h2("Updating After Code Changes"),
  infoTable([
    ["Step 1", "Make changes to Code.gs and/or index.html in the Apps Script editor."],
    ["Step 2", "Click Deploy → Manage deployments."],
    ["Step 3", "Find your deployment, click the pencil icon (Edit)."],
    ["Step 4", "Change version to \"New version\" and click Deploy."],
  ], 1200),
  sp(),
  warn(["Always deploy a new version after changes — the web app URL caches the last deployed version, so edits in the editor won't show until you deploy."]),
  sp(),
  h2("Permissions"),
  p("On first run, Google will ask you to authorize the app. Grant:"),
  bullet("Google Docs — to read/write your Daily Tasks doc"),
  bullet("Script Properties — to store and sync notes across devices"),
];

// ─── SECTION 6: Google Doc Structure ─────────────────────────────────────────
const section6 = [
  divider(),
  h1("6. Google Doc Structure"),
  p("The app is designed to work with a specific Google Doc tab structure. Here's what it expects — and what you can rename:"),
  sp(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2400, 3000, 3960],
    rows: [
      new TableRow({
        children: [
          new TableCell({ borders: cellBorder(STEEL), shading: { fill: STEEL, type: ShadingType.CLEAR }, width: { size: 2400, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Tab / Element", bold: true, size: 20, color: WHITE })] })] }),
          new TableCell({ borders: cellBorder(STEEL), shading: { fill: STEEL, type: ShadingType.CLEAR }, width: { size: 3000, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Purpose", bold: true, size: 20, color: WHITE })] })] }),
          new TableCell({ borders: cellBorder(STEEL), shading: { fill: STEEL, type: ShadingType.CLEAR }, width: { size: 3960, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Can I rename it?", bold: true, size: 20, color: WHITE })] })] }),
        ]
      }),
      ...[
        ["PINNED Info", "Stores archived pinned notes. Must contain a heading matching your PINNED anchor text.", "Yes — update getPinnedNotes() and archiveNoteToDoc() in Code.gs."],
        ["Month parent tab (e.g., April 2026 Q4)", "Parent tab for daily notes. The app creates child tabs (e.g., \"Monday, April 14\") under whichever tab matches the current month + year.", "Yes — just keep month + year in the title. \"April 2026\" and \"April 2026 Q2\" both work."],
        ["FY headings inside PINNED Info", "Heading-level text like \"FY26\" triggers FY categorization for pinned notes.", "Yes — update the FY regex in getPinnedNotes() to match your format."],
      ].map(([tab, purpose, rename], i) => new TableRow({
        children: [
          new TableCell({ borders: cellBorder(), shading: { fill: i % 2 === 0 ? LIGHT_BG : WHITE, type: ShadingType.CLEAR }, width: { size: 2400, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: tab, bold: true, size: 19, color: TEAL })] })] }),
          new TableCell({ borders: cellBorder(), shading: { fill: i % 2 === 0 ? WHITE : LIGHT_BG, type: ShadingType.CLEAR }, width: { size: 3000, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: purpose, size: 20, color: BLACK })] })] }),
          new TableCell({ borders: cellBorder(), shading: { fill: GRAY_BG, type: ShadingType.CLEAR }, width: { size: 3960, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: rename, size: 20, color: BLACK })] })] }),
        ]
      }))
    ]
  }),
];

// ─── SECTION 7: Troubleshooting ───────────────────────────────────────────────
const section7 = [
  divider(),
  h1("7. Troubleshooting"),
  infoTable([
    ["Sync says 'success' but nothing in doc", "Check that DOC_ID in Code.gs matches your doc's actual ID. Copy it fresh from the URL."],
    ["Pinned Notes shows empty or ghost FY buttons", "The FY heading exists but has no items under it. Add at least one item, or the empty section is filtered out."],
    ["Timestamps not showing on pinned cards", "The date must be in a supported format: (Added April 13, 2026), — 3/31, or Added 3/31/26. Notes pinned via the app always include timestamps automatically."],
    ["Today's tab created at wrong level", "The app couldn't find a parent tab matching the current month + year. Make sure a tab like \"April 2026\" or \"April 2026 Q4\" exists at the top level."],
    ["'Using local data — server sync unavailable'", "Apps Script server call failed. Re-deploy a new version: Deploy → Manage deployments → Edit → New version."],
    ["Styling looks wrong after adding new UI elements", "Dynamic HTML must use element.style inline styles, not CSS classes. Apps Script's Caja sandbox strips class selectors from dynamically injected HTML."],
  ], 3200),
];

// ─── SECTION 8: Quick Reference ───────────────────────────────────────────────
const section8 = [
  divider(),
  h1("8. Quick Reference"),
  infoTable([
    ["Apps Script Project URL", "script.google.com → your project name"],
    ["GitHub Backup (template source)", "github.com/gguzman83/Claude_Github/apps-script"],
    ["Your Google Doc ID", "[YOUR_DOC_ID]"],
    ["Your Google Doc Name", "[YOUR DOC NAME]"],
    ["PINNED tab anchor text", "[YOUR_PINNED_HEADING]"],
    ["Timestamp format (archived)", "MMMM d, yyyy  e.g. April 13, 2026"],
    ["PropertiesService key", "dailyNotesData (default — change in saveNotes/loadNotes if needed)"],
  ], 2800),
  sp(), sp(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [new TextRun({ text: "Template adapted from the Techknow Bar Daily Notes App  |  Built with Google Apps Script + Claude  |  April 2026", size: 18, color: "9CA3AF", italics: true })]
  }),
];

// ─── BUILD DOCUMENT ────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Calibri", size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Calibri", color: STEEL },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Calibri", color: TEAL },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      ...titlePage,
      ...section0,
      ...section1,
      ...section2,
      ...section3,
      ...section4,
      ...section5,
      ...section6,
      ...section7,
      ...section8,
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/mnt/user-data/outputs/Daily_Notes_App_Template_Guide.docx', buffer);
  console.log('Done.');
});
