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
  var tz      = Session.getScriptTimeZone();
  var date    = targetDateIso ? new Date(targetDateIso) : new Date();
  // "Tuesday, April 14" — matches the format shown in the doc sidebar
  var tabTitle  = Utilities.formatDate(date, tz, 'EEEE, MMMM d');
  var tabShort  = Utilities.formatDate(date, tz, 'EEE, MMMM d');

  function matchesDate(t) { t=(t||'').trim(); return t===tabTitle||t===tabShort; }

  // ── Check if this date's tab already exists ───────────────────────────────
  var tabs = doc.getTabs();
  for (var t = 0; t < tabs.length; t++) {
    if (matchesDate(tabs[t].getTitle())) return tabs[t].asDocumentTab().getBody();
    var kids = tabs[t].getChildTabs ? tabs[t].getChildTabs() : [];
    for (var c = 0; c < kids.length; c++) {
      if (matchesDate(kids[c].getTitle())) return kids[c].asDocumentTab().getBody();
    }
  }

  // ── Find the month's parent tab (e.g. "April 2026 Q4") ───────────────────
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

  // ── Create the new tab ────────────────────────────────────────────────────
  try {
    var props = { title: tabTitle };
    if (parentTabId) props.parentTabId = parentTabId;
    var newTab = doc.addTab(props);
    return newTab.asDocumentTab().getBody();
  } catch(e) {
    Logger.log('addTab w/ parent failed: ' + e.message);
    try {
      var newTab = doc.addTab({ title: tabTitle });
      return newTab.asDocumentTab().getBody();
    } catch(e2) {
      Logger.log('addTab fallback failed: ' + e2.message);
    }
  }

  return doc.getBody();
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

    var FONT = 'Avenir';

    // ── Page title — bold, italic, underline, Avenir ──────────────────────────
    var titleP = body.appendParagraph('Priorities - Must Complete/Notes');
    titleP.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    titleP.editAsText()
      .setFontFamily(FONT)
      .setBold(true)
      .setItalic(true)
      .setUnderline(true);

    // ── Helper: write one section ─────────────────────────────────────────────
    // A blank paragraph before each section breaks the list context so numbering
    // resets to "1." — matching your doc's existing format.
    function writeSection(label, notes) {
      if (!notes || notes.length === 0) return;

      body.appendParagraph('');

      // Section header — bold + italic + Avenir, level 0 → "1. Label"
      var header = body.appendListItem(label);
      header.setNestingLevel(0);
      header.setGlyphType(DocumentApp.GlyphType.DIGIT);
      header.editAsText()
        .setFontFamily(FONT)
        .setBold(true)
        .setItalic(true);

      // Items — Avenir only, no bold/italic, level 1 → "   1. item"
      for (var i = 0; i < notes.length; i++) {
        var item = body.appendListItem(notes[i].text);
        item.setNestingLevel(1);
        item.setGlyphType(DocumentApp.GlyphType.DIGIT);
        item.editAsText()
          .setFontFamily(FONT)
          .setBold(false)
          .setItalic(false);
        if (notes[i].done) item.editAsText().setStrikethrough(true);

        // Sub-detail — Avenir only, level 2 → "      i. detail"
        if (notes[i].detail) {
          var sub = body.appendListItem(notes[i].detail);
          sub.setNestingLevel(2);
          sub.setGlyphType(DocumentApp.GlyphType.ROMAN_LOWER);
          sub.editAsText()
            .setFontFamily(FONT)
            .setBold(false)
            .setItalic(false);
          if (notes[i].done) sub.editAsText().setStrikethrough(true);
        }
      }
    }

    // ── Write each section from the payload ───────────────────────────────────
    var sections = data.sections || [];
    for (var s = 0; s < sections.length; s++) {
      writeSection(sections[s].label, sections[s].notes);
    }

    // ── Notes (live entries) — bold + italic header, Avenir items ────────────
    var live = data.live || [];
    if (live.length > 0) {
      body.appendParagraph('');
      var liveHdr = body.appendListItem('Notes:');
      liveHdr.setNestingLevel(0);
      liveHdr.setGlyphType(DocumentApp.GlyphType.DIGIT);
      liveHdr.editAsText()
        .setFontFamily(FONT)
        .setBold(true)
        .setItalic(true);
      for (var i = 0; i < live.length; i++) {
        var timeStr = Utilities.formatDate(new Date(live[i].ts), tz, 'h:mm a');
        var item = body.appendListItem(timeStr + '  ' + live[i].text);
        item.setNestingLevel(1);
        item.setGlyphType(DocumentApp.GlyphType.DIGIT);
        item.editAsText()
          .setFontFamily(FONT)
          .setBold(false)
          .setItalic(false);
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
// Writes a properly formatted checkbox list item matching the PINNED tab's style:
//   - [ ] Note text  (Pinned M/d/YY)
//         - [ ] detail text
function archiveNoteToDoc(noteText, noteDetail, category, timestamp) {
  try {
    const doc  = DocumentApp.openById(DOC_ID);
    const date = Utilities.formatDate(new Date(timestamp), Session.getScriptTimeZone(), 'MMMM d, yyyy');
    const mainText = noteText + '  (Added ' + date + ')';

    // Target the PINNED Info tab
    var pinnedBody = null;
    try {
      var tabs = doc.getTabs();
      for (var t = 0; t < tabs.length; t++) {
        if (tabs[t].getTitle().toUpperCase().includes('PINNED')) {
          pinnedBody = tabs[t].asDocumentTab().getBody();
          break;
        }
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
      Logger.log('archiveNoteToDoc getTabs fallback: ' + tabErr.message);
    }

    if (!pinnedBody) pinnedBody = doc.getBody();

    // ── Find the "PINNED (Thing to remember/completed)" heading ───────────────
    // New items go RIGHT AFTER this heading, so they appear at the top of the list.
    var insertAfterIdx = -1;
    var n = pinnedBody.getNumChildren();
    for (var i = 0; i < n; i++) {
      var el = pinnedBody.getChild(i);
      if (el.getType() === DocumentApp.ElementType.PARAGRAPH) {
        var txt = el.asParagraph().getText();
        if (txt.indexOf('PINNED') >= 0 &&
           (txt.indexOf('remember') >= 0 || txt.indexOf('completed') >= 0)) {
          insertAfterIdx = i;
          break;
        }
      }
    }

    // Insert position: right after the heading (or position 1 as fallback)
    var insertAt = insertAfterIdx >= 0 ? insertAfterIdx + 1 : 1;

    // Insert detail first (higher index), then main — so main ends up on top
    if (noteDetail) {
      var subItem = pinnedBody.insertListItem(insertAt, noteDetail);
      subItem.setNestingLevel(1);
      subItem.setGlyphType(DocumentApp.GlyphType.HOLLOW_SQUARE);
    }

    var mainItem = pinnedBody.insertListItem(insertAt, mainText);
    mainItem.setNestingLevel(0);
    mainItem.setGlyphType(DocumentApp.GlyphType.HOLLOW_SQUARE);

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
