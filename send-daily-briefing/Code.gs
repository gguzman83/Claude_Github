/**
 * SendDailyBriefing.gs
 * ---------------------------------------------------------------
 * Automatically sends any Gmail draft whose subject contains
 * "Daily Briefing". Designed to run on a time-based trigger
 * every weekday morning at 8:40 AM PT (5 minutes after Cowork
 * creates the draft at 8:35 AM).
 *
 * SETUP INSTRUCTIONS
 * ---------------------------------------------------------------
 * 1. Go to https://script.google.com and click "New project"
 * 2. Delete any existing code, then paste this entire file in
 * 3. Click Save (Ctrl+S), name the project "Send Daily Briefing"
 * 4. Click "Run" -> "sendDailyBriefingDraft" once to grant permissions
 * 5. Set up the automatic trigger:
 *      a. Click the clock icon (Triggers) in the left sidebar
 *      b. Click "+ Add Trigger" (bottom right)
 *      c. Choose function: sendDailyBriefingDraft
 *      d. Event source: Time-driven
 *      e. Type: Week timer -> Every weekday (Mon-Fri)
 *      f. Time of day: 8:40 AM - 9:00 AM
 *      g. Click Save
 * ---------------------------------------------------------------
 */

// Match on the text portion only — avoids emoji encoding issues
var SUBJECT_KEYWORD = "Daily Briefing";

/**
 * Main function — finds and sends the daily briefing draft.
 * Safe to run manually at any time.
 */
function sendDailyBriefingDraft() {
  var drafts = GmailApp.getDrafts();
  var sent = false;

  for (var i = 0; i < drafts.length; i++) {
    var draft = drafts[i];
    var message = draft.getMessage();
    var subject = message.getSubject();

    if (subject.indexOf(SUBJECT_KEYWORD) !== -1) {
      Logger.log("Found briefing draft: " + subject);
      draft.send();
      Logger.log("Sent successfully: " + subject);
      sent = true;
      break;
    }
  }

  if (!sent) {
    Logger.log("No draft found containing: " + SUBJECT_KEYWORD);
    // Uncomment the lines below to receive a warning email if no draft is found:
    // GmailApp.sendEmail(
    //   "guillermo_guzman@intuit.com",
    //   "Daily Briefing draft not found",
    //   "The Send Daily Briefing script ran but could not find a matching draft."
    // );
  }
}

/**
 * Lists all current draft subjects in the execution log.
 * Run this manually to verify the script can see your drafts.
 */
function listDraftSubjects() {
  var drafts = GmailApp.getDrafts();
  if (drafts.length === 0) {
    Logger.log("No drafts found.");
    return;
  }
  for (var i = 0; i < drafts.length; i++) {
    Logger.log(drafts[i].getMessage().getSubject());
  }
}
