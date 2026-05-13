// ─── Daily Notes App — Google Apps Script Backend ─────────────────────────────
// Guillermo's Daily Notes | Techknow Bar MTV + SF
// Data stored in UserProperties (per Google account, syncs across machines)
// Writes completed/new entries directly to Daily Tasks FY26 Q2-Q4 doc

const DOC_ID = '1PRS_iUx0ma6JGt_hJGtAU-oqIgMHpnuLNbILpq9346k';

// ─── Serve the web app ────────────────────────────────────────────────────────
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Daily Notes — Guillermo')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ─── Load notes (called on app startup) ──────────────────────────────────────
function loadNotes() {
  try {
    const props = PropertiesService.getUserProperties();
    const notes = props.getProperty('notes');
    const live  = props.getProperty('live');
    const date  = props.getProperty('saved_date');
    if (!notes) return null;
    return {
      notes: JSON.parse(notes),
      live:  JSON.parse(live || '[]'),
      date:  date
    };
  } catch (e) {
    Logger.log('loadNotes error: ' + e.message);
    return null;
  }
}

// ─── Save notes (called on every change) ─────────────────────────────────────
function saveNotes(payload) {
  try {
    const props = PropertiesService.getUserProperties();
    props.setProperty('notes',      JSON.stringify(payload.notes));
    props.setProperty('live',       JSON.stringify(payload.live));
    props.setProperty('saved_date', payload.date);
    return { success: true };
  } catch (e) {
    Logger.log('saveNotes error: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ─── Create or find today's tab, nested under the current month's tab ─────────
// targetDateIso — ISO date string from the frontend (today or tomorrow).
// Defaults to now if omitted.
function getOrCreateTodayTab(doc, targetDateIso) {
  var tz   = Session.getScriptTimeZone();
  var date = targetDateIso ? new Date(targetDateIso) : new Date();

  // Three formats to match — full day name, short day name, and day-agnostic.
  // The day-agnostic "MMMM d" fallback handles timezone drift where the browser
  // sends UTC and the weekday shifts by one vs. the script's local timezone.
  var tabFull  = Utilities.formatDate(date, tz, 'EEEE, MMMM d');  // "Thursday, April 23"
  var tabShort = Utilities.formatDate(date, tz, 'EEE, MMMM d');   // "Thu, April 23"
  var monthDay = Utilities.formatDate(date, tz, 'MMMM d');        // "April 23" — day-agnostic

  function matchesDate(t) {
    t = (t||'').trim();
    if (t === tabFull || t === tabShort) return true;
    // Fuzzy: tab contains "April 23" regardless of weekday prefix
    if (t.indexOf(monthDay) >= 0) return true;
    return false;
  }

  function findTab(tabList) {
    for (var t = 0; t < tabList.length; t++) {
      if (matchesDate(tabList[t].getTitle())) return tabList[t].asDocumentTab().getBody();
      var kids = tabList[t].getChildTabs ? tabList[t].getChildTabs() : [];
      for (var c = 0; c < kids.length; c++) {
        if (matchesDate(kids[c].getTitle())) return kids[c].asDocumentTab().getBody();
      }
    }
    return null;
  }

  // ── Check if this date's tab already exists ───────────────────────────────
  var tabs = doc.getTabs();
  var existing = findTab(tabs);
  if (existing) return existing;

  // ── Find the month's parent tab (e.g. "April 2026 Q4", "May 2026 Q1") ────
  var targetMonth = Utilities.formatDate(date, tz, 'MMMM');
  var targetYear  = Utilities.formatDate(date, tz, 'yyyy');
  var parentTabId = null;
  for (var t = 0; t < tabs.length; t++) {
    var title = tabs[t].getTitle();
    if (title.indexOf(targetMonth) >= 0 && title.indexOf(targetYear) >= 0) {
      parentTabId = tabs[t].getId();
      break;
    }
  }

  // ── Create the new tab — don't trust the returned reference, do a fresh lookup ──
  // (getBody() on the freshly-returned tab object can fail; re-fetching is reliable)
  try {
    var props = { title: tabFull };
    if (parentTabId) props.parentTabId = parentTabId;
    doc.addTab(props);
  } catch(e) {
    Logger.log('addTab w/ parent failed: ' + e.message);
    try {
      doc.addTab({ title: tabFull });
    } catch(e2) {
      Logger.log('addTab fallback failed: ' + e2.message);
      return null;
    }
  }

  // Fresh lookup after creation
  var freshTabs = doc.getTabs();
  var created = findTab(freshTabs);
  if (created) return created;

  // IMPORTANT: never fall back to doc.getBody() — that targets PINNED Info tab
  Logger.log('getOrCreateTodayTab: tab created but still not found. tabFull=' + tabFull);
  return null;
}

// ─── Append daily summary to Google Doc ───────────────────────────────────────
// Creates a new dated tab under the current month, then writes content in the
// same numbered outline format as your existing daily notes tabs.
function appendToDoc(payloadJson) {
  try {
    var doc  = DocumentApp.openById(DOC_ID);
    var data = JSON.parse(payloadJson);
    var tz   = Session.getScriptTimeZone();

    // Get or create the chosen date's tab (today or tomorrow)
    var body = getOrCreateTodayTab(doc, data.targetDate);

    // Safety check — if tab lookup/creation failed, bail out rather than
    // accidentally writing to the PINNED Info tab or any other wrong tab.
    if (!body) {
      return { success: false, error: 'Could not find or create a tab for the selected date. Make sure the month tab (e.g. "April 2026 Q4") exists in your doc.' };
    }

    // ── Read existing note texts so we can skip duplicates on re-sync ─────────
    var existingTexts = [];
    try {
      var numChildren = body.getNumChildren();
      for (var ei = 0; ei < numChildren; ei++) {
        var ec = body.getChild(ei);
        if (ec.getType() === DocumentApp.ElementType.LIST_ITEM) {
          var et = ec.asListItem().getText().trim().toLowerCase();
          if (et) existingTexts.push(et);
        }
      }
    } catch(re) { Logger.log('read existing error: ' + re.message); }

    // Strip markdown for clean comparison
    function cleanForCompare(text) {
      return text.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                 .replace(/~~[^~]+~~/g,'').replace(/_([^_]+)_/g,'$1')
                 .trim().toLowerCase();
    }
    function alreadyInDoc(text) {
      var clean = cleanForCompare(text);
      if (!clean || clean.length < 3) return false;
      var prefix = clean.substring(0, 50);
      for (var xi = 0; xi < existingTexts.length; xi++) {
        if (existingTexts[xi].indexOf(prefix) >= 0) return true;
      }
      return false;
    }

    var FONT = 'Avenir Next for Intuit';

    // ── Helper: apply markdown formatting (bold + links + bare URLs) ────────────
    // Handles **bold**, [text](url), and bare https:// URLs.
    // Strips markdown syntax, sets plain text on the element, then applies
    // bold/link/color styling at the correct character positions.
    // Returns true if formatting was applied, false if plain text only.
    function applyMarkdownFormatting(item, rawText, font) {
      // Group 1: **bold**
      // Group 2+3: [text](url) markdown link
      // Group 4: bare https:// URL (not already inside a markdown link)
      var combinedRe = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s)]+)/g;
      var parts = [];
      var lastEnd = 0;
      var match;
      var hasFormatting = false;
      combinedRe.lastIndex = 0;
      while ((match = combinedRe.exec(rawText)) !== null) {
        if (match.index > lastEnd) {
          parts.push({ text: rawText.substring(lastEnd, match.index), bold: false, url: null });
        }
        if (match[1] !== undefined) {
          // **bold**
          parts.push({ text: match[1], bold: true, url: null });
          hasFormatting = true;
        } else if (match[2] !== undefined) {
          // [text](url) markdown link
          var url = match[3];
          var validUrl = url && (url.indexOf('http') === 0 || url.indexOf('slack') === 0
                                 || url.indexOf('file') === 0 || url.indexOf('mailto') === 0);
          parts.push({ text: match[2], bold: false, url: validUrl ? url : null });
          hasFormatting = true;
        } else if (match[4] !== undefined) {
          // bare URL — use the URL as both the display text and the link
          parts.push({ text: match[4], bold: false, url: match[4] });
          hasFormatting = true;
        }
        lastEnd = match.index + match[0].length;
      }
      if (lastEnd < rawText.length) {
        parts.push({ text: rawText.substring(lastEnd), bold: false, url: null });
      }
      if (!hasFormatting) return false;
      var plainText = parts.map(function(p) { return p.text; }).join('');
      var textEl = item.editAsText();
      textEl.setText(plainText);
      textEl.setFontFamily(font);
      textEl.setFontSize(12);
      textEl.setBold(false);
      textEl.setItalic(false);
      textEl.setUnderline(false);
      var pos = 0;
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].text.length === 0) continue;
        var end = pos + parts[i].text.length - 1;
        if (parts[i].bold) {
          textEl.setBold(pos, end, true);
        }
        if (parts[i].url) {
          try {
            textEl.setLinkUrl(pos, end, parts[i].url);
            textEl.setForegroundColor(pos, end, '#1155CC');
            textEl.setUnderline(pos, end, true);
          } catch(linkErr) {
            Logger.log('setLinkUrl failed for url: ' + parts[i].url + ' err: ' + linkErr.message);
          }
        }
        pos += parts[i].text.length;
      }
      return true;
    }

    // ── Helper: write one line as a list item with formatting applied ─────────
    function writeLine(text, nestingLevel, glyphType, spacingBefore, spacingAfter, strikethrough) {
      if (!text || !text.trim()) return null;
      // Strip leading bullet characters that would double up (-, *, •)
      var clean = text.trim().replace(/^[-*•]\s+/, '');
      if (!clean) return null;
      var item = body.appendListItem(clean);
      item.setNestingLevel(nestingLevel);
      item.setGlyphType(glyphType);
      item.setLineSpacing(1.15);
      item.setSpacingBefore(spacingBefore);
      item.setSpacingAfter(spacingAfter);
      if (!applyMarkdownFormatting(item, clean, FONT)) {
        var t = item.editAsText();
        t.setFontFamily(FONT);
        t.setFontSize(12);
        t.setBold(false);
        t.setItalic(false);
      }
      if (strikethrough) item.editAsText().setStrikethrough(true);
      return item;
    }

    // ── Helper: write one section ─────────────────────────────────────────────
    // Section header → bold paragraph (not a list item, so numbering resets to 1)
    // Main note lines → DIGIT numbered bullets at level 0
    // Continuation lines of multi-line notes → DISC bullets at level 1
    // Sub-detail lines → DISC bullets at level 1
    // Empty sections → DISC bullet with "N/A"
    function writeSection(label, notes) {
      var newNotes = (notes || []).filter(function(n) { return !alreadyInDoc(n.text); });

      // Blank paragraph breaks the list context so numbering resets to 1
      var spacer = body.appendParagraph('');
      spacer.setSpacingBefore(0);
      spacer.setSpacingAfter(0);

      // Section header as a bold paragraph — NOT a list item
      if (!alreadyInDoc(label)) {
        var header = body.appendParagraph(label);
        header.setLineSpacing(1.15);
        header.setSpacingBefore(14);
        header.setSpacingAfter(4);
        var ht = header.editAsText();
        ht.setFontFamily(FONT);
        ht.setFontSize(12);
        ht.setBold(true);
        ht.setItalic(false);
        ht.setUnderline(false);
      }

      // If no notes (or all already in doc), write N/A placeholder
      if (newNotes.length === 0) {
        writeLine('N/A', 0, DocumentApp.GlyphType.DISC, 5, 2, false);
        return;
      }

      for (var i = 0; i < newNotes.length; i++) {
        var noteRaw  = newNotes[i].text || '';
        var isDone   = !!newNotes[i].done;
        // Split multi-line text — each line becomes its own doc element
        // so character offsets stay correct and links always apply cleanly.
        var textLines = noteRaw.split('\n')
                               .map(function(l) { return l.trim(); })
                               .filter(Boolean);
        if (textLines.length === 0) continue;

        // First line → numbered bullet (DIGIT, level 0)
        writeLine(textLines[0], 0, DocumentApp.GlyphType.DIGIT, 5, 2, isDone);

        // Additional lines of the same note → bullet (DISC, level 1)
        for (var li = 1; li < textLines.length; li++) {
          writeLine(textLines[li], 1, DocumentApp.GlyphType.DISC, 2, 2, isDone);
        }

        // Sub-detail lines → bullet (DISC, level 1)
        // Google Docs has no ↳ glyph — regular bullet matches the preview intent
        if (newNotes[i].detail) {
          var detailLines = newNotes[i].detail.split('\n');
          for (var d = 0; d < detailLines.length; d++) {
            writeLine(detailLines[d], 1, DocumentApp.GlyphType.DISC, 2, 2, isDone);
          }
        }
      }
    }

    // ── Write each section from the payload ───────────────────────────────────
    var sections = data.sections || [];
    for (var s = 0; s < sections.length; s++) {
      writeSection(sections[s].label, sections[s].notes);
    }

    // Note: live (Keep Watch - Monitoring) entries are now sent as a named section
    // from the frontend and handled by writeSection() above.

    doc.saveAndClose();
    return { success: true };
  } catch (e) {
    Logger.log('appendToDoc error: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ─── Log a single completed item to Google Doc ────────────────────────────────
// Called when a note is checked off in the app
function logCompletionToDoc(noteText, category, timestamp) {
  try {
    const doc  = DocumentApp.openById(DOC_ID);
    const body = doc.getBody();
    const time = Utilities.formatDate(new Date(timestamp), Session.getScriptTimeZone(), 'h:mm a');
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'M/d');

    const catEmoji = { incidents:'🔥', tasks:'✅', projects:'🏗️', meetings:'📅' };
    const line = `${catEmoji[category]||'✅'} [${today} ${time}] COMPLETED: ${noteText}`;

    body.appendParagraph(line);
    doc.saveAndClose();
    return { success: true };
  } catch (e) {
    Logger.log('logCompletion error: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ─── Get PINNED notes from Google Doc ────────────────────────────────────────
// Targets the "PINNED Info" Document Tab specifically, reads all headings
// as sections (FY25, FY26, etc.) and all paragraphs/list items as notes.
function getPinnedNotes() {
  try {
    const doc = DocumentApp.openById(DOC_ID);

    // ── Find the PINNED Info tab ──────────────────────────────────────────────
    let pinnedBody = null;
    try {
      const tabs = doc.getTabs();
      for (var t = 0; t < tabs.length; t++) {
        if (tabs[t].getTitle().toUpperCase().includes('PINNED')) {
          pinnedBody = tabs[t].asDocumentTab().getBody();
          break;
        }
        // Also check child tabs
        var children = tabs[t].getChildTabs ? tabs[t].getChildTabs() : [];
        for (var c = 0; c < children.length; c++) {
          if (children[c].getTitle().toUpperCase().includes('PINNED')) {
            pinnedBody = children[c].asDocumentTab().getBody();
            break;
          }
        }
        if (pinnedBody) break;
      }
    } catch (tabErr) {
      Logger.log('getTabs fallback: ' + tabErr.message);
    }

    // Fallback to main body if tab not found
    if (!pinnedBody) pinnedBody = doc.getBody();

    // ── Parse all content ─────────────────────────────────────────────────────
    // Strategy: only items under an explicit "FY##" heading are FY items.
    // Everything else (no heading, or under a non-FY heading) → "preItems"
    // which get assigned FY(firstFYYear + 1) after the full parse.
    var n          = pinnedBody.getNumChildren();
    var fyItems    = [];   // items confirmed under an FY## heading
    var preItems   = [];   // items NOT yet under an FY## heading
    var section    = '';   // current heading label (may or may not be FY)
    var inFY       = false; // true once we're under an FY## heading
    var firstFYNum = null;  // lowest FY year number seen in the doc

    for (var i = 0; i < n; i++) {
      var child = pinnedBody.getChild(i);
      var type  = child.getType();
      var raw   = '';
      var isHeading = false;
      var isDone    = false;
      var nestLevel = 0;

      if (type === DocumentApp.ElementType.PARAGRAPH) {
        var para    = child.asParagraph();
        raw         = para.getText().trim();
        var heading = para.getHeading();
        isHeading   = heading !== DocumentApp.ParagraphHeading.NORMAL;
        try { isDone = para.editAsText().isStrikethrough(0); } catch(e) {}

      } else if (type === DocumentApp.ElementType.LIST_ITEM) {
        var li    = child.asListItem();
        raw       = li.getText().trim();
        nestLevel = li.getNestingLevel();
        try { isDone = li.editAsText().isStrikethrough(0); } catch(e) {}

      } else {
        continue;
      }

      if (!raw) continue;

      if (isHeading) {
        var headingLabel = raw.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim();
        var fyMatch = headingLabel.match(/FY(\d+)/i);
        if (fyMatch) {
          var fyNum = parseInt(fyMatch[1], 10);
          // Track the LOWEST FY year (first one encountered scanning top-to-bottom)
          if (firstFYNum === null || fyNum < firstFYNum) firstFYNum = fyNum;
          section = 'FY' + fyNum;
          inFY    = true;
        } else {
          // Non-FY heading (e.g. "Resources", "Things to Remember")
          // Items under it still belong to the "pre-FY" bucket
          section = headingLabel;
          inFY    = false;
        }
        continue;
      }

      // ── Extract a date from the note text using multiple patterns ────────────
      var noteDate = '';

      // 1. App-generated: [Archived 4/9 2:30 PM]
      var m1 = raw.match(/\[Archived\s+([^\]]+)\]/i);
      if (m1) { noteDate = m1[1].trim(); }

      // 2. User-written: "Added M/D", "Added M/D/YY", "Added M/D/YYYY"
      if (!noteDate) {
        var m2 = raw.match(/\bAdded\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i);
        if (m2) noteDate = 'Added ' + m2[1];
      }

      // 3. App-generated pinned format: "(Added April 13, 2026)" or legacy "(Pinned ...)"
      if (!noteDate) {
        var m3p = raw.match(/\((?:Added|Pinned)\s+([^)]+)\)/i);
        if (m3p) { noteDate = m3p[1].trim(); }
      }
      // 4. Inline date in parens at end: "(3/31)" or "(3/31/26)"
      if (!noteDate) {
        var m3 = raw.match(/\(\s*(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s*\)\s*$/);
        if (m3) noteDate = m3[1];
      }

      // 4. Trailing date after dash: "— 3/31" or "- 3/31/26"
      if (!noteDate) {
        var m4 = raw.match(/[-–—]\s*(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s*$/);
        if (m4) noteDate = m4[1];
      }

      // Clean up markdown/checkbox artifacts and strip app-generated metadata
      var clean = raw
        .replace(/📌\s*/g, '')
        .replace(/✅\s*/g, '')
        .replace(/\[Archived[^\]]*\]\s*/gi, '')
        .replace(/\s*\((?:Added|Pinned) [^)]+\)/gi, '')
        .replace(/~~/g, '')
        .replace(/\*\*/g, '')
        .replace(/^\s*[-•*]\s*/, '')
        .replace(/\[\s*[xX]\s*\]\s*/, '')
        .replace(/\[\s*\]\s*/, '')
        .trim();

      if (clean.length < 2) continue;

      isDone = isDone
             || raw.indexOf('[x]') >= 0
             || raw.indexOf('[X]') >= 0
             || (raw.indexOf('~~') === 0 && raw.lastIndexOf('~~') > 1);

      var targetList = inFY ? fyItems : preItems;

      // Only LIST_ITEM sub-bullets (nestLevel > 0) become detail lines.
      // Plain paragraphs are always standalone cards — this prevents archived
      // notes (written as paragraphs) from being swallowed as details.
      if (type === DocumentApp.ElementType.LIST_ITEM && nestLevel > 0 && targetList.length > 0) {
        var last = targetList[targetList.length - 1];
        if (!last.detail) last.detail = [];
        last.detail.push(clean);
        continue;
      }

      targetList.push({ text: clean, done: isDone, section: section, date: noteDate, detail: [] });
    }

    // ── Assign preItems to the current Intuit fiscal year ────────────────────
    // Intuit FY runs Aug→Jul: if month >= 7 (Aug-Dec), FY = calYear+1-2000,
    // otherwise FY = calYear-2000. This ensures newly pinned items always land
    // in the correct FY (e.g. April 2026 → FY26) regardless of doc structure.
    var _d = new Date();
    var _fyNum = (_d.getMonth() >= 7)
      ? (_d.getFullYear() + 1 - 2000)
      : (_d.getFullYear() - 2000);
    var currentFYLabel = 'FY' + _fyNum;
    for (var p = 0; p < preItems.length; p++) {
      preItems[p].section = currentFYLabel;
    }

    // Prepend preItems (newest FY) before fyItems
    var allItems = preItems.concat(fyItems);

    return { success: true, items: allItems };
  } catch (e) {
    Logger.log('getPinnedNotes error: ' + e.message);
    return { success: false, error: e.message, items: [] };
  }
}

// ─── Archive a note to the PINNED Info tab in the Google Doc ─────────────────
// Inserts at the top of the PINNED list, renders **bold** and [text](url) properly.
function archiveNoteToDoc(noteText, noteDetail, category, timestamp) {
  try {
    const doc  = DocumentApp.openById(DOC_ID);
    const FONT = 'Avenir Next for Intuit';
    const date = Utilities.formatDate(new Date(timestamp), Session.getScriptTimeZone(), 'MMMM d, yyyy');
    const mainText = noteText + '  (Added ' + date + ')';

    // ── Markdown formatter: strips **bold** and [text](url), applies real formatting ──
    function applyMarkdown(item, rawText) {
      var re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
      var parts = [], lastEnd = 0, match, hasFormat = false;
      re.lastIndex = 0;
      while ((match = re.exec(rawText)) !== null) {
        if (match.index > lastEnd) parts.push({ text: rawText.substring(lastEnd, match.index), bold: false, url: null });
        if (match[1] !== undefined) { parts.push({ text: match[1], bold: true,  url: null });        }
        else                        { parts.push({ text: match[2], bold: false, url: match[3] }); }
        hasFormat = true;
        lastEnd = match.index + match[0].length;
      }
      if (lastEnd < rawText.length) parts.push({ text: rawText.substring(lastEnd), bold: false, url: null });
      if (!hasFormat) return false;
      var plain = parts.map(function(p){ return p.text; }).join('');
      var t = item.editAsText();
      t.setText(plain);
      t.setFontFamily(FONT);
      t.setFontSize(12);
      t.setBold(false); t.setItalic(false); t.setUnderline(false);
      var pos = 0;
      for (var i = 0; i < parts.length; i++) {
        var end = pos + parts[i].text.length - 1;
        if (parts[i].bold) t.setBold(pos, end, true);
        if (parts[i].url) {
          var isValidUrl = parts[i].url.indexOf('http') === 0 || parts[i].url.indexOf('slack') === 0 || parts[i].url.indexOf('file') === 0 || parts[i].url.indexOf('mailto') === 0;
          if (isValidUrl) { t.setLinkUrl(pos, end, parts[i].url); t.setForegroundColor(pos, end, '#1155CC'); t.setUnderline(pos, end, true); }
        }
        pos += parts[i].text.length;
      }
      return true;
    }

    // ── Find the PINNED Info tab ──────────────────────────────────────────────
    var pinnedBody = null;
    try {
      var tabs = doc.getTabs();
      for (var t = 0; t < tabs.length; t++) {
        if (tabs[t].getTitle().toUpperCase().includes('PINNED')) {
          pinnedBody = tabs[t].asDocumentTab().getBody(); break;
        }
        var children = tabs[t].getChildTabs ? tabs[t].getChildTabs() : [];
        for (var c = 0; c < children.length; c++) {
          if (children[c].getTitle().toUpperCase().includes('PINNED')) {
            pinnedBody = children[c].asDocumentTab().getBody(); break;
          }
        }
        if (pinnedBody) break;
      }
    } catch (tabErr) { Logger.log('archiveNoteToDoc getTabs: ' + tabErr.message); }
    if (!pinnedBody) pinnedBody = doc.getBody();

    // ── Duplicate check: don't add if note text already exists in PINNED tab ──
    var cleanNoteText = noteText.replace(/\*\*/g,'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').trim().toLowerCase();
    var notePrefix = cleanNoteText.substring(0, 50);
    var n = pinnedBody.getNumChildren();
    for (var i = 0; i < n; i++) {
      var ec = pinnedBody.getChild(i);
      var et = '';
      if (ec.getType() === DocumentApp.ElementType.LIST_ITEM) et = ec.asListItem().getText().toLowerCase();
      else if (ec.getType() === DocumentApp.ElementType.PARAGRAPH) et = ec.asParagraph().getText().toLowerCase();
      if (et && et.indexOf(notePrefix) >= 0) {
        Logger.log('archiveNoteToDoc: duplicate detected, skipping: ' + noteText.substring(0,40));
        doc.saveAndClose();
        return { success: true, skipped: true };
      }
    }

    // ── Find insert position: right after the current FY heading (e.g. "FY26") ──
    // Intuit FY runs Aug→Jul. We look for a heading matching the current FY label
    // so new notes always land at the TOP of the correct FY section, not buried
    // under an old "PINNED...remember" heading that may live in a previous FY.
    var _now = new Date();
    var _fyNum = (_now.getMonth() >= 7)
      ? (_now.getFullYear() + 1 - 2000)
      : (_now.getFullYear() - 2000);
    var _fyLabel = 'FY' + _fyNum; // e.g. "FY26"

    var insertAfterIdx = -1;
    n = pinnedBody.getNumChildren();
    for (var i = 0; i < n; i++) {
      var el = pinnedBody.getChild(i);
      if (el.getType() === DocumentApp.ElementType.PARAGRAPH) {
        var heading = el.asParagraph().getHeading();
        var txt = el.asParagraph().getText().replace(/\*\*/g,'').trim();
        // Match heading paragraphs that contain the current FY label
        var isFYHeading = heading !== DocumentApp.ParagraphHeading.NORMAL
                       && txt.toUpperCase().indexOf(_fyLabel.toUpperCase()) >= 0;
        // Also accept plain paragraphs that ARE exactly the FY label (some docs use plain text)
        var isPlainFY = txt.toUpperCase() === _fyLabel.toUpperCase();
        if (isFYHeading || isPlainFY) {
          insertAfterIdx = i; break;
        }
      }
    }
    // Fallback: if no FY26 heading found, insert at position 1
    var insertAt = insertAfterIdx >= 0 ? insertAfterIdx + 1 : 1;

    // ── Insert detail sub-bullet first (ends up below main after insert) ──────
    if (noteDetail && noteDetail.trim()) {
      var subItem = pinnedBody.insertListItem(insertAt, noteDetail.trim());
      subItem.setNestingLevel(1);
      subItem.setGlyphType(DocumentApp.GlyphType.HOLLOW_SQUARE);
      subItem.setLineSpacing(1.15);
      subItem.setSpacingBefore(2);
      subItem.setSpacingAfter(2);
      if (!applyMarkdown(subItem, noteDetail.trim())) {
        var subT = subItem.editAsText();
        subT.setFontFamily(FONT);
        subT.setFontSize(12);
        subT.setBold(false);
        subT.setItalic(false);
      }
    }

    // ── Insert main item — render markdown so **bold** and links display properly ──
    var mainItem = pinnedBody.insertListItem(insertAt, mainText);
    mainItem.setNestingLevel(0);
    mainItem.setGlyphType(DocumentApp.GlyphType.HOLLOW_SQUARE);
    mainItem.setLineSpacing(1.15);
    mainItem.setSpacingBefore(4);
    mainItem.setSpacingAfter(4);
    if (!applyMarkdown(mainItem, mainText)) {
      var mainT = mainItem.editAsText();
      mainT.setFontFamily(FONT);
      mainT.setFontSize(12);
      mainT.setBold(false);
      mainT.setItalic(false);
    }

    doc.saveAndClose();
    return { success: true };
  } catch (e) {
    Logger.log('archiveNoteToDoc error: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ─── Log a new note to Google Doc ─────────────────────────────────────────────
// Called when a new note is added in the app
function logNewNoteToDoc(noteText, category, timestamp) {
  try {
    const doc  = DocumentApp.openById(DOC_ID);
    const body = doc.getBody();
    const time = Utilities.formatDate(new Date(timestamp), Session.getScriptTimeZone(), 'h:mm a');
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'M/d');

    const catEmoji = { incidents:'🔥', tasks:'✅', projects:'🏗️', meetings:'📅' };
    const line = `${catEmoji[category]||'📝'} [${today} ${time}] NEW: ${noteText}`;

    body.appendParagraph(line);
    doc.saveAndClose();
    return { success: true };
  } catch (e) {
    Logger.log('logNewNote error: ' + e.message);
    return { success: false, error: e.message };
  }
}
