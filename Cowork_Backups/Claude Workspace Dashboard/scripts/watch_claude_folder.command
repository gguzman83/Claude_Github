#!/bin/bash
# watch_claude_folder.command
# Double-click this file to start watching your Claude folder.
# Any time a file is added, changed, or removed, the dashboard
# is automatically regenerated and the browser picks it up
# within 30 seconds (the page auto-refreshes).
#
# Close this Terminal window to stop the watcher.

CLAUDE_DIR="$HOME/Documents/Claude"
SCRIPT="$CLAUDE_DIR/Scripts/scan_dashboard.py"
PYTHON=$(command -v python3)

echo "======================================"
echo "  Claude Workspace Dashboard Watcher"
echo "======================================"
echo ""
echo "  📁 Watching: $CLAUDE_DIR"
echo "  🔁 Dashboard auto-refreshes every 30s"
echo "  ⌨️  Press Ctrl+C to stop"
echo ""

if [ -z "$PYTHON" ]; then
  echo "❌ python3 not found. Please install Python 3."
  read -p "Press Enter to close..."
  exit 1
fi

if [ ! -f "$SCRIPT" ]; then
  echo "❌ scan_dashboard.py not found at $SCRIPT"
  read -p "Press Enter to close..."
  exit 1
fi

# Run an initial scan on startup
echo "▶ Running initial scan..."
"$PYTHON" "$SCRIPT"
echo ""

# ── Watcher loop (pure Python — no external deps needed) ──────────────────
"$PYTHON" - <<'PYEOF'
import os
import time
import subprocess
import sys
from pathlib import Path

CLAUDE_DIR  = Path.home() / "Documents" / "Claude"
SKILLS_DIR  = Path.home() / ".claude" / "skills"
SCRIPT      = CLAUDE_DIR / "Scripts" / "scan_dashboard.py"
POLL_SECS   = 4     # how often to check for changes
DEBOUNCE    = 2.0   # seconds to wait after last change before running

WATCH_DIRS = [d for d in [CLAUDE_DIR, SKILLS_DIR] if d.exists()]

IGNORE_NAMES = {
    '.DS_Store', '__pycache__', '.git', 'Thumbs.db',
    'Claude_Workspace_Dashboard.html',  # don't re-trigger on our own writes
}
IGNORE_EXTS = {'.pyc', '.swp', '.tmp'}

def should_ignore(path):
    p = Path(path)
    if p.name in IGNORE_NAMES or p.suffix in IGNORE_EXTS:
        return True
    # skip hidden
    for part in p.parts:
        if part.startswith('.') and part not in ('.claude',):
            return True
    return False

def snapshot(watch_dirs):
    mtimes = {}
    for watch_dir in watch_dirs:
        for root, dirs, files in os.walk(watch_dir):
            dirs[:] = [d for d in dirs if not d.startswith('.')
                       or d == '.claude']
            for f in files:
                fp = os.path.join(root, f)
                if not should_ignore(fp):
                    try:
                        mtimes[fp] = os.stat(fp).st_mtime
                    except OSError:
                        pass
    return mtimes

prev = snapshot(WATCH_DIRS)
last_change = None
ran = False

print("👁  Watcher active — monitoring for changes...\n")
sys.stdout.flush()

while True:
    time.sleep(POLL_SECS)
    curr = snapshot(WATCH_DIRS)

    added   = set(curr) - set(prev)
    removed = set(prev) - set(curr)
    changed = {k for k in curr if k in prev and curr[k] != prev[k]}
    all_changes = added | removed | changed

    if all_changes:
        last_change = time.time()
        ran = False
        # Print first few changed files
        sample = list(all_changes)[:3]
        labels = [os.path.basename(p) for p in sample]
        suffix = f' (+{len(all_changes)-3} more)' if len(all_changes) > 3 else ''
        print(f"📁 Change detected: {', '.join(labels)}{suffix}")
        sys.stdout.flush()
        prev = curr

    # Debounce: run scanner only after changes settle
    if last_change and not ran and (time.time() - last_change) >= DEBOUNCE:
        print("🔄 Regenerating dashboard...")
        sys.stdout.flush()
        result = subprocess.run(
            [sys.executable, str(SCRIPT)],
            capture_output=True, text=True
        )
        print(result.stdout.strip())
        if result.returncode != 0:
            print(f"⚠️  Error: {result.stderr.strip()}")
        sys.stdout.flush()
        ran = True
        last_change = None
PYEOF
