// ─── EXEC TECH ASSESSMENT — Apps Script ──────────────────────────────────────
// Paste this entire file into your Apps Script editor (code.gs).
// Redeploy as a Web App after saving.
// ─────────────────────────────────────────────────────────────────────────────

// Your email — receives a notification every time a candidate starts
const NOTIFY_EMAIL = 'guillermo_guzman@intuit.com';

// ─── WEB APP ENTRY POINT ─────────────────────────────────────────────────────
// Serves the assessment. No code injection needed — codes are now
// auto-generated client-side and displayed directly to the candidate.
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('ExecTech Assessment')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ─── SESSION LOGGER ───────────────────────────────────────────────────────────
// Called automatically from the browser when a candidate enters their code
// and starts the assessment. Sends you an email with their name, session
// code, and timestamp — no manual steps needed on your end.
function logSessionStart(candidateName, sessionCode) {
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMM d, yyyy h:mm a z');

  GmailApp.sendEmail(
    NOTIFY_EMAIL,
    '🔔 Assessment Started — ' + candidateName,
    '',
    {
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
