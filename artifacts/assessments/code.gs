// ─── EXEC TECH ASSESSMENT — Apps Script ──────────────────────────────────────
// Paste this entire file into your Apps Script editor (code.gs).
// Redeploy as a Web App after saving.
// ─────────────────────────────────────────────────────────────────────────────

// Your deployment ID — grab it from:
// Deploy → Manage Deployments → copy the Deployment ID
const DEPLOYMENT_ID = 'YOUR_DEPLOYMENT_ID_HERE'; // ← Replace this once

// ─── WEB APP ENTRY POINT ─────────────────────────────────────────────────────
// Reads the ?code= URL parameter and injects it into the HTML before serving.
// The candidate never sees the raw HTML — they just get the rendered page.
function doGet(e) {
  const code = (e && e.parameter && e.parameter.code)
    ? e.parameter.code.toUpperCase()
    : '';

  // Load index.html and inject the candidate's unique code
  const html     = HtmlService.createHtmlOutputFromFile('index').getContent();
  const injected = html.replace('__CANDIDATE_CODE__', code);

  return HtmlService.createHtmlOutput(injected)
    .setTitle('ExecTech Assessment')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ─── CODE GENERATOR ──────────────────────────────────────────────────────────
// Generates a random 6-character code. Avoids O/0/I/1 to prevent confusion.
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─── GENERATE A LINK FOR ONE CANDIDATE ───────────────────────────────────────
// Run this function from the Apps Script editor to generate a candidate link.
// Steps:
//   1. Change candidateName below to the candidate's name
//   2. Click Run → generateLinkForCandidate
//   3. Click View → Logs to see their unique link and code
//   4. Copy the link → send to candidate via email or Slack
//   5. Copy the code → send separately (or keep it for your records)
function generateLinkForCandidate() {
  const candidateName = 'Jane Doe'; // ← Change per candidate before running

  const code = generateCode();
  const link = `https://script.google.com/macros/s/${DEPLOYMENT_ID}/exec?code=${code}`;

  // Log everything for your records
  Logger.log('─────────────────────────────────────────');
  Logger.log(`Candidate : ${candidateName}`);
  Logger.log(`Code      : ${code}`);
  Logger.log(`Link      : ${link}`);
  Logger.log('─────────────────────────────────────────');
  Logger.log('Send the LINK to the candidate.');
  Logger.log('Keep the CODE — they\'ll need to enter it to start.');
}
