# Deploy Daily Notes App — 5-Minute Setup

You'll end up with a bookmarkable URL that works on both your laptops and writes directly to your Daily Tasks Google Doc.

---

## Step 1 — Create the Apps Script project

1. Open **script.google.com** in Chrome (make sure you're signed into your Intuit Google account)
2. Click **+ New project**
3. Name it: `Daily Notes App`

---

## Step 2 — Paste in the backend code

1. You'll see a file called `Code.gs` already open
2. **Select all** the existing code and **delete it**
3. Open the file `Code.gs` from this folder and **copy everything** into the editor
4. Click 💾 **Save** (Cmd+S / Ctrl+S)

---

## Step 3 — Add the HTML file

1. Click **+** next to "Files" in the left sidebar → choose **HTML**
2. Name it exactly: `index` (no .html — Apps Script adds that automatically)
3. **Select all** the placeholder code and **delete it**
4. Open `index.html` from this folder and **copy everything** into the editor
5. Click 💾 **Save**

---

## Step 4 — Deploy as a web app

1. Click **Deploy** (top right) → **New deployment**
2. Click the gear ⚙️ next to "Select type" → choose **Web app**
3. Set these options:
   - **Description**: Daily Notes App
   - **Execute as**: Me (your Google account)
   - **Who has access**: Anyone (within Intuit)  ← or "Anyone" if that's easier
4. Click **Deploy**
5. Click **Authorize access** → follow the Google sign-in prompts
   - You'll see a warning screen — click "Advanced" → "Go to Daily Notes App (unsafe)"
   - This is normal for your own scripts
6. Copy the **Web app URL** — it looks like:
   `https://script.google.com/macros/s/XXXXXXXXXX/exec`

---

## Step 5 — Bookmark it

1. Open the URL in Chrome
2. Bookmark it on both laptops (Cmd+D / Ctrl+D)
3. That's it — your notes sync through your Google account automatically

---

## How the sync to Google Doc works

- **Every new note you add** → automatically appended to your Daily Tasks doc with a timestamp
- **Every item you check off** → immediately logged to your doc as completed  
- **"Sync to Doc" button** → pushes a full formatted summary of today's notes into the doc

---

## Re-deploying after changes

If you ever update the code, click **Deploy → Manage deployments → Edit (pencil icon)** → change version to "New version" → click **Deploy**.

---

## Troubleshooting

- **"Script function not found"**: Make sure the file is named exactly `index` (not `index.html`)
- **Authorization errors**: Re-run the deploy flow and re-authorize
- **Doc not updating**: Make sure the DOC_ID in Code.gs matches your Daily Tasks doc ID
  - The ID is in the URL: `docs.google.com/document/d/[THIS PART]/edit`
  - Current ID in the code: `1PRS_iUx0ma6JGt_hJGtAU-oqIgMHpnuLNbILpq9346k` ✓
