#!/usr/bin/env python3
"""
workspace-organizer sync script
Moves stray files from Claude_Desktop_MTV root into their correct subfolders.

Usage:
  python3 sync.py           # Apply moves
  python3 sync.py --dry-run # Preview only, no changes made
"""

import os
import shutil
import sys
from pathlib import Path

DRY_RUN = "--dry-run" in sys.argv

# Resolve Claude_Desktop_MTV root dynamically
# Script lives at: Claude_Desktop_MTV/skills/workspace-organizer/scripts/sync.py
SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_ROOT = SCRIPT_DIR.parent.parent.parent  # 3 levels up = Claude_Desktop_MTV/

# Top-level dirs in Claude_Desktop_MTV that are already organized — don't move them
PROTECTED_DIRS = {
    "artifacts",
    "configs",
    "context",
    "docs",
    "skills",
    "Claude_Github",
    "Legal Hold",
    "exec-tech-assessment",
    "daily-notes-app",
    "send-daily-briefing",
    ".git",
}

# Files that are fine at root level as-is
OK_AT_ROOT = {
    "README.md",
}

# Routing rules: (matcher_function, destination_subfolder)
# First match wins
ROUTING_RULES = [
    (lambda f: f.suffix == ".skill",                                              "skills"),
    (lambda f: f.suffix in (".gs", ".yaml", ".yml"),                              "configs"),
    (lambda f: f.suffix == ".json" and f.name not in ("package.json",),           "configs"),
    (lambda f: f.suffix in (".html", ".htm"),                                     "artifacts"),
    (lambda f: f.suffix in (".docx", ".pdf", ".pptx", ".xlsx", ".xls"),           "docs"),
    (lambda f: f.suffix.lower() in (".jpg", ".jpeg", ".png", ".gif", ".svg",
                                    ".webp", ".bmp"),                             "docs"),
    (lambda f: f.suffix in (".py", ".sh", ".js", ".ts"),                          "configs"),
]


def get_destination(file_path: Path):
    """Return destination subfolder name, or None to leave at root."""
    if file_path.name in OK_AT_ROOT:
        return None
    for matcher, dest in ROUTING_RULES:
        try:
            if matcher(file_path):
                return dest
        except Exception:
            pass
    return None  # Unknown type — leave it, flag for review


def scan_stray_items(root: Path):
    """Find items at root level that don't belong there."""
    results = []
    for item in sorted(root.iterdir()):
        if item.name.startswith("."):
            continue  # skip hidden system files
        if item.is_dir():
            if item.name not in PROTECTED_DIRS:
                results.append((item, "UNKNOWN_DIR"))
            # known dirs are fine, skip
            continue
        # It's a file
        dest = get_destination(item)
        results.append((item, dest))
    return results


def move_item(src: Path, dest_folder: str, root: Path, dry_run: bool):
    """Move file/dir to destination subfolder, handling name collisions."""
    dest_dir = root / dest_folder
    dest_path = dest_dir / src.name

    # Avoid overwriting existing files
    if dest_path.exists():
        stem = src.stem
        suffix = src.suffix
        i = 1
        while dest_path.exists():
            dest_path = dest_dir / f"{stem}_{i}{suffix}"
            i += 1

    label = "MOVE (dry-run)" if dry_run else "MOVE"
    print(f"  [{label}]  {src.name}  →  {dest_folder}/{dest_path.name}")

    if not dry_run:
        dest_dir.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(dest_path))


def main():
    print(f"\n{'=' * 55}")
    print(f"  Workspace Organizer — {'DRY RUN (no changes)' if DRY_RUN else 'APPLYING CHANGES'}")
    print(f"  Root: {WORKSPACE_ROOT}")
    print(f"{'=' * 55}\n")

    items = scan_stray_items(WORKSPACE_ROOT)

    if not items:
        print("✓ All clean — no stray files found at root level.\n")
        return

    moved_count = 0
    flagged = []
    stayed = []

    for item, dest in items:
        if dest == "UNKNOWN_DIR":
            print(f"  [FLAG]  {item.name}/  — unknown folder, review manually")
            flagged.append(item.name)
        elif dest is None:
            print(f"  [OK]    {item.name}  — stays at root")
            stayed.append(item.name)
        else:
            move_item(item, dest, WORKSPACE_ROOT, DRY_RUN)
            moved_count += 1

    print(f"\n{'─' * 55}")
    print(f"  Summary:")
    print(f"    {moved_count} file(s) {'would be moved' if DRY_RUN else 'moved'}")
    print(f"    {len(stayed)} file(s) left at root (intentional)")
    if flagged:
        print(f"    {len(flagged)} folder(s) flagged for manual review:")
        for f in flagged:
            print(f"      • {f}")

    if DRY_RUN and moved_count > 0:
        print(f"\n  Run without --dry-run to apply these changes.")
    print()


if __name__ == "__main__":
    main()
