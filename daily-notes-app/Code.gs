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

    var FONT = 'Avenir';

    // ── Helper: apply markdown formatting (bold + links) to a Google Doc element ─
    // Handles **bold** and [text](url) — strips markdown, sets plain text,
    // then applies bold/link/color styling at the correct character positions.
    // Returns true if any formatting was found and applied, false if plain text only.
    function applyMarkdownFormatting(item, rawText, font) {
      // Match **bold** and [text](any-url) — URL pattern is permissive ([^)]+)
      // so Slack links, file:// links, and encoded URLs all match correctly.
      var combinedRe = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
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
        } else {
          // [text](url) — only treat as link if URL looks like a real URL
          var url = match[3];
          var isLink = url && (url.indexOf('http') === 0 || url.indexOf('slack') === 0 || url.indexOf('file') === 0 || url.indexOf('mailto') === 0);
          parts.push({ text: match[2], bold: false, url: isLink ? url : null });
          if (!isLink) { hasFormatting = true; } // still strip the markdown even if not a link
        }
        hasFormatting = true;
        lastEnd = match.index + match[0].length;
      }
      if (lastEnd < rawText.length) {
        parts.push({ text: rawText.substring(lastEnd), bold: false, url: null });
      }
      if (!hasFormatting) return false;
      // Set plain text and apply per-segment formatting
      var plainText = parts.map(function(p){ return p.text; }).join('');
      var textEl = item.editAsText();
      textEl.setText(plainText);
      textEl.setFontFamily(font);
      textEl.setBold(false);
      textEl.setItalic(false);
      textEl.setUnderline(false);
      var pos = 0;
      for (var i = 0; i < parts.length; i++) {
        var end = pos + parts[i].text.length - 1;
        if (parts[i].bold) {
          textEl.setBold(pos, end, true);
        }
        if (parts[i].url) {
          textEl.setLinkUrl(pos, end, parts[i].url);
          textEl.setForegroundColor(pos, end, '#1155CC');
          textEl.setUnderline(pos, end, true);
        }
        pos += parts[i].text.length;
      }
      return true;
    }

    // ── Helper: write one section ─────────────────────────────────────────────
    // A blank paragraph before each section breaks the list context so numbering
    // resets to "1." — matching your doc's existing format.
    function writeSection(label, notes) {
      if (!notes || notes.length === 0) return;

      // Filter to only notes not already in the doc
      var newNotes = notes.filter(function(n) { return !alreadyInDoc(n.text); });
      if (newNotes.length === 0) return; // nothing new to add

      // Two blank lines between sections for clear visual separation
      body.appendParagraph('');
      body.appendParagraph('');

      // Section header — only write if not already present
      if (!alreadyInDoc(label)) {
        var header = body.appendListItem(label);
        header.setNestingLevel(0);
        header.setGlyphType(DocumentApp.GlyphType.DIGIT);
        header.setLineSpacing(1.15);   // 1.15 line spacing
        header.setSpacingBefore(12);
        header.setSpacingAfter(10);   // "Add space after list item"
        var headerText = header.editAsText();
        headerText.setFontFamily(FONT);
        headerText.setBold(true);
        headerText.setItalic(false);
        headerText.setUnderline(false);
      }

      // Items — only write notes not already in the doc
      for (var i = 0; i < newNotes.length; i++) {
        var item = body.appendListItem(newNotes[i].text);
        item.setNestingLevel(1);
        item.setGlyphType(DocumentApp.GlyphType.DIGIT);
        if (!applyMarkdownFormatting(item, newNotes[i].text, FONT)) {
          item.editAsText()
            .setFontFamily(FONT)
            .setBold(false)
            .setItalic(false);
        }
        item.setLineSpacing(1.15);     // 1.15 line spacing
        item.setSpacingBefore(6);
        item.setSpacingAfter(10);     // "Add space after list item"
        if (newNotes[i].done) item.editAsText().setStrikethrough(true);

        // Sub-details — one sub-bullet per line, level 2 → "      i. detail"
        if (newNotes[i].detail) {
          var detailLines = newNotes[i].detail.split('\n');
          for (var d = 0; d < detailLines.length; d++) {
            var line = detailLines[d].trim();
            if (!line) continue;
            var sub = body.appendListItem(line);
            sub.setNestingLevel(2);
            sub.setGlyphType(DocumentApp.GlyphType.ROMAN_LOWER);
            if (!applyMarkdownFormatting(sub, line, FONT)) {
              sub.editAsText()
                .setFontFamily(FONT)
                .setBold(false)
                .setItalic(false);
            }
            sub.setLineSpacing(1.15);  // 1.15 line spacing
            sub.setSpacingBefore(3);
            sub.setSpacingAfter(8);   // "Add space after list item"
            if (newNotes[i].done) sub.editAsText().setStrikethrough(true);
          }
        }
      }
    }

    // ── Write each section from the payload ───────────────────────────────────
    var sections = data.sections || [];
    for (var s = 0; s < sections.length; s++) {
      writeSection(sections[s].label, sections[s].notes);
    }

    // ── Notes (live entries) — only add entries not already in the doc ────────
    var live = data.live || [];
    var newLive = live.filter(function(e) {
      var timeStr = Utilities.formatDate(new Date(e.ts), tz, 'h:mm a');
      return !alreadyInDoc(timeStr + '  ' + e.text);
    });
    if (newLive.length > 0) {
      body.appendParagraph('');
      body.appendParagraph('');
      if (!alreadyInDoc('Notes:')) {
        var liveHdr = body.appendListItem('Notes:');
        liveHdr.setNestingLevel(0);
        liveHdr.setGlyphType(DocumentApp.GlyphType.DIGIT);
        liveHdr.setLineSpacing(1.15);   // 1.15 line spacing
        liveHdr.setSpacingBefore(12);
        liveHdr.setSpacingAfter(10);   // "Add space after list item"
        var liveHdrText = liveHdr.editAsText();
        liveHdrText.setFontFamily(FONT);
        liveHdrText.setBold(true);
        liveHdrText.setItalic(false);
        liveHdrText.setUnderline(false);
      }
      for (var i = 0; i < newLive.length; i++) {
        var timeStr = Utilities.formatDate(new Date(newLive[i].ts), tz, 'h:mm a');
        var fullText = timeStr + '  ' + newLive[i].text;
        var item = body.appendListItem(fullText);
        item.setNestingLevel(1);
        item.setGlyphType(DocumentApp.GlyphType.DIGIT);
        if (!applyMarkdownFormatting(item, fullText, FONT)) {
          item.editAsText()
            .setFontFamily(FONT)
            .setBold(false)
            .setItalic(false);
        }
        item.setLineSpacing(1.15);      // 1.15 line spacing
        item.setSpacingBefore(6);
        item.setSpacingAfter(10);      // "Add space after list item"
      }
    }

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

    // ── Assign preItems to FY(firstFYNum + 1) ────────────────────────────────
    // Everything NOT under an explicit FY heading belongs to the NEXT fiscal year
    // (e.g. items above FY25 → FY26; above FY26 → FY27; etc.)
    var currentFYLabel = firstFYNum !== null ? 'FY' + (firstFYNum + 1) : 'FY Current';
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
    const FONT = 'Avenir';
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

    // ── Find insert position: right after the PINNED heading ─────────────────
    var insertAfterIdx = -1;
    n = pinnedBody.getNumChildren();
    for (var i = 0; i < n; i++) {
      var el = pinnedBody.getChild(i);
      if (el.getType() === DocumentApp.ElementType.PARAGRAPH) {
        var txt = el.asParagraph().getText();
        if (txt.indexOf('PINNED') >= 0 &&
           (txt.indexOf('remember') >= 0 || txt.indexOf('completed') >= 0)) {
          insertAfterIdx = i; break;
        }
      }
    }
    var insertAt = insertAfterIdx >= 0 ? insertAfterIdx + 1 : 1;

    // ── Insert detail sub-bullet first (ends up below main after insert) ──────
    if (noteDetail && noteDetail.trim()) {
      var subItem = pinnedBody.insertListItem(insertAt, noteDetail.trim());
      subItem.setNestingLevel(1);
      subItem.setGlyphType(DocumentApp.GlyphType.HOLLOW_SQUARE);
      if (!applyMarkdown(subItem, noteDetail.trim())) {
        subItem.editAsText().setFontFamily(FONT).setBold(false).setItalic(false);
      }
      subItem.setSpacingBefore(2); subItem.setSpacingAfter(2);
    }

    // ── Insert main item — render markdown so **bold** and links display properly ──
    var mainItem = pinnedBody.insertListItem(insertAt, mainText);
    mainItem.setNestingLevel(0);
    mainItem.setGlyphType(DocumentApp.GlyphType.HOLLOW_SQUARE);
    if (!applyMarkdown(mainItem, mainText)) {
      mainItem.editAsText().setFontFamily(FONT).setBold(false).setItalic(false);
    }
    mainItem.setSpacingBefore(4); mainItem.setSpacingAfter(4);

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
