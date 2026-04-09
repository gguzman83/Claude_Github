// ─── EXEC TECH ASSESSMENT — Apps Script ──────────────────────────────────────
// Paste this entire file into your Apps Script editor (code.gs).
// Redeploy as a Web App after saving.
// ─────────────────────────────────────────────────────────────────────────────

// Recipients — both get notified every time a candidate starts
const NOTIFY_EMAIL = 'guillermo_guzman@intuit.com';
const NOTIFY_CC    = 'john_mastrorilli@intuit.com';

// ─── WEB APP ENTRY POINT ─────────────────────────────────────────────────────
// Serves the assessment. No code injection needed — codes are now
// auto-generated client-side and displayed directly to the candidate.
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('ExecTech Assessment')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ─── RESULTS EMAIL ────────────────────────────────────────────────────────────
// Called from the browser when a candidate completes the assessment.
// Receives a JSON string with all results data and sends a formatted email
// to both Guillermo and John.
function sendResultsEmail(resultsJson) {
  const d = JSON.parse(resultsJson);

  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMM d, yyyy h:mm a z');

  // Grade badge color
  const gradeColor = d.pct >= 88 ? '#16a34a'
    : d.pct >= 75 ? '#2563eb'
    : d.pct >= 50 ? '#d97706'
    : '#dc2626';

  // Per-category rows
  const categoryRows = d.categories.map(c => {
    const catPct = c.max > 0 ? Math.round((c.got / c.max) * 100) : 0;
    const barColor = catPct >= 75 ? '#16a34a' : catPct >= 50 ? '#d97706' : '#dc2626';
    return `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 16px;font-size:13px;color:#374151;">${c.label}</td>
        <td style="padding:10px 16px;font-size:13px;color:#374151;text-align:center;">${c.got}/${c.max}</td>
        <td style="padding:10px 16px;">
          <div style="background:#e5e7eb;border-radius:99px;height:8px;width:100%;min-width:80px;">
            <div style="background:${barColor};border-radius:99px;height:8px;width:${catPct}%;"></div>
          </div>
        </td>
        <td style="padding:10px 16px;font-size:13px;font-weight:700;color:${barColor};text-align:right;">${catPct}%</td>
      </tr>`;
  }).join('');

  // Per-question rows
  const questionRows = d.questions.map(q => {
    const icon = q.isCorrect ? '✅' : '❌';
    const rowBg = q.isCorrect ? '#f0fdf4' : '#fef2f2';
    return `
      <tr style="background:${rowBg};border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-size:12px;color:#6b7280;text-align:center;">${q.num}</td>
        <td style="padding:8px 12px;font-size:12px;color:#374151;">${q.title}</td>
        <td style="padding:8px 12px;font-size:12px;color:#374151;text-align:center;">${q.category}</td>
        <td style="padding:8px 12px;font-size:12px;color:#374151;">${q.selected}</td>
        <td style="padding:8px 12px;font-size:12px;color:#16a34a;font-weight:600;">${q.correct}</td>
        <td style="padding:8px 12px;font-size:13px;text-align:center;">${icon}</td>
      </tr>`;
  }).join('');

  const htmlBody = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      max-width:680px;margin:0 auto;background:#f0f4ff;padding:2rem;border-radius:12px;">

      <!-- Header -->
      <div style="background:#0d1b2a;border-radius:10px;padding:1.5rem 2rem;color:#fff;margin-bottom:1rem;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;
          color:rgba(147,180,255,0.8);margin-bottom:4px;">Intuit · Techknow Bar</div>
        <h2 style="margin:0;font-size:1.3rem;font-weight:800;">Assessment Completed</h2>
      </div>

      <!-- Summary card -->
      <table style="width:100%;border-collapse:collapse;background:#fff;
        border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);margin-bottom:1rem;">
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 16px;font-size:12px;font-weight:700;text-transform:uppercase;
            letter-spacing:1px;color:#64748b;width:140px;">Candidate</td>
          <td style="padding:12px 16px;font-size:15px;font-weight:700;color:#1a1a2e;">${d.candidateName}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 16px;font-size:12px;font-weight:700;text-transform:uppercase;
            letter-spacing:1px;color:#64748b;">Session Code</td>
          <td style="padding:12px 16px;font-size:16px;font-weight:800;color:#236cff;
            letter-spacing:4px;font-family:monospace;">${d.sessionCode}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 16px;font-size:12px;font-weight:700;text-transform:uppercase;
            letter-spacing:1px;color:#64748b;">Score</td>
          <td style="padding:12px 16px;font-size:22px;font-weight:800;color:#1a1a2e;">
            ${d.scoreTotal}/${d.scoreMax}
            <span style="font-size:15px;color:#64748b;margin-left:8px;">(${d.pct}%)</span>
          </td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 16px;font-size:12px;font-weight:700;text-transform:uppercase;
            letter-spacing:1px;color:#64748b;">Grade</td>
          <td style="padding:12px 16px;">
            <span style="background:${gradeColor};color:#fff;padding:4px 12px;
              border-radius:99px;font-size:13px;font-weight:700;">${d.grade}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:12px;font-weight:700;text-transform:uppercase;
            letter-spacing:1px;color:#64748b;">Completed At</td>
          <td style="padding:12px 16px;font-size:14px;color:#1a1a2e;">${timestamp}</td>
        </tr>
      </table>

      <!-- Category breakdown -->
      <div style="background:#fff;border-radius:10px;overflow:hidden;
        box-shadow:0 2px 8px rgba(0,0,0,0.08);margin-bottom:1rem;">
        <div style="padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
          <span style="font-size:12px;font-weight:700;text-transform:uppercase;
            letter-spacing:1px;color:#64748b;">Score by Category</span>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">
              <th style="padding:8px 16px;font-size:11px;font-weight:700;text-transform:uppercase;
                letter-spacing:1px;color:#64748b;text-align:left;">Category</th>
              <th style="padding:8px 16px;font-size:11px;font-weight:700;text-transform:uppercase;
                letter-spacing:1px;color:#64748b;text-align:center;">Points</th>
              <th style="padding:8px 16px;font-size:11px;font-weight:700;text-transform:uppercase;
                letter-spacing:1px;color:#64748b;">Progress</th>
              <th style="padding:8px 16px;font-size:11px;font-weight:700;text-transform:uppercase;
                letter-spacing:1px;color:#64748b;text-align:right;">%</th>
            </tr>
          </thead>
          <tbody>${categoryRows}</tbody>
        </table>
      </div>

      <!-- Question-by-question -->
      <div style="background:#fff;border-radius:10px;overflow:hidden;
        box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <div style="padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
          <span style="font-size:12px;font-weight:700;text-transform:uppercase;
            letter-spacing:1px;color:#64748b;">Question Results</span>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">
              <th style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;
                letter-spacing:1px;color:#64748b;text-align:center;">#</th>
              <th style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;
                letter-spacing:1px;color:#64748b;text-align:left;">Question</th>
              <th style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;
                letter-spacing:1px;color:#64748b;text-align:center;">Category</th>
              <th style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;
                letter-spacing:1px;color:#64748b;text-align:left;">Selected</th>
              <th style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;
                letter-spacing:1px;color:#64748b;text-align:left;">Correct Answer</th>
              <th style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;
                letter-spacing:1px;color:#64748b;text-align:center;">Result</th>
            </tr>
          </thead>
          <tbody>${questionRows}</tbody>
        </table>
      </div>

    </div>`;

  GmailApp.sendEmail(
    NOTIFY_EMAIL,
    'Exec Tech Assessment Completed - ' + d.candidateName,
    '',
    {
      cc: NOTIFY_CC,
      htmlBody: htmlBody
    }
  );
}

// ─── SESSION LOGGER ───────────────────────────────────────────────────────────
// Called automatically from the browser when a candidate enters their code
// and starts the assessment. Sends you an email with their name, session
// code, and timestamp — no manual steps needed on your end.
function logSessionStart(candidateName, sessionCode) {
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMM d, yyyy h:mm a z');

  GmailApp.sendEmail(
    NOTIFY_EMAIL,
    'Exec Tech Assessment Started - ' + candidateName,
    '',
    {
      cc: NOTIFY_CC,
      htmlBody: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          max-width:480px;margin:0 auto;background:#f0f4ff;padding:2rem;border-radius:12px;">
          <div style="background:#0d1b2a;border-radius:10px;padding:1.5rem 2rem;color:#fff;margin-bottom:1rem;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;
              color:rgba(147,180,255,0.8);margin-bottom:4px;">Intuit · Techknow Bar</div>
            <h2 style="margin:0;font-size:1.3rem;font-weight:800;">Assessment Started</h2>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#fff;
            border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:12px 16px;font-size:12px;font-weight:700;text-transform:uppercase;
                letter-spacing:1px;color:#64748b;width:120px;">Candidate</td>
              <td style="padding:12px 16px;font-size:15px;font-weight:700;color:#1a1a2e;">
                ${candidateName}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:12px 16px;font-size:12px;font-weight:700;text-transform:uppercase;
                letter-spacing:1px;color:#64748b;">Session Code</td>
              <td style="padding:12px 16px;font-size:18px;font-weight:800;color:#236cff;
                letter-spacing:4px;font-family:monospace;">${sessionCode}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:12px;font-weight:700;text-transform:uppercase;
                letter-spacing:1px;color:#64748b;">Started At</td>
              <td style="padding:12px 16px;font-size:14px;color:#1a1a2e;">${timestamp}</td>
            </tr>
          </table>
        </div>`
    }
  );
}
