#!/usr/bin/env python3
"""
scan_dashboard.py
Scans the Claude workspace folder and regenerates the data block inside
Claude_Workspace_Dashboard.html. Run this anytime, or let the watcher
call it automatically.

Usage:
  python3 ~/Documents/Claude/Scripts/scan_dashboard.py
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

# ── Paths ────────────────────────────────────────────────────────────────────
CLAUDE_DIR   = Path.home() / "Documents" / "Claude"
SKILLS_DIR   = Path.home() / ".claude" / "skills"
GITHUB_DIR   = CLAUDE_DIR / "Claude_Github"
DASHBOARD    = CLAUDE_DIR / "Claude_Workspace_Dashboard.html"

# ── Icon / category maps ─────────────────────────────────────────────────────
SKILL_ICONS = {
    'master-save':             '💾',
    'github-autosave':         '🐙',
    'cowork-backup':           '📦',
    'save-master-reference-doc': '📋',
    'consolidate-memory':      '🧠',
    'organize-folder':         '🗂️',
    'daily-briefing':          '☀️',
    'chat-summary':            '📝',
    'schedule':                '⏰',
    'clpse-thankyou':          '🙏',
    'docx':                    '📘',
    'pptx':                    '📊',
    'xlsx':                    '📗',
    'pdf':                     '📕',
    'skill-creator':           '🛠️',
    'setup-cowork':            '🔧',
    'dashboard-sync-docs':     '🔄',
    'promotion-proposal':      '🏆',
    'tech-promo-packet':       '🎖️',
}
SKILL_CATS = {
    'master-save':             'autosave',
    'github-autosave':         'autosave',
    'cowork-backup':           'autosave',
    'save-master-reference-doc': 'autosave',
    'consolidate-memory':      'autosave',
    'organize-folder':         'autosave',
    'daily-briefing':          'daily',
    'chat-summary':            'daily',
    'schedule':                'daily',
    'clpse-thankyou':          'daily',
    'docx':                    'docs-files',
    'pptx':                    'docs-files',
    'xlsx':                    'docs-files',
    'pdf':                     'docs-files',
    'skill-creator':           'setup',
    'setup-cowork':            'setup',
    'dashboard-sync-docs':     'setup',
    'promotion-proposal':      'people',
    'tech-promo-packet':       'people',
}
SKILL_CAT_LABELS = {
    'autosave':   'Autosave & Environment',
    'daily':      'Daily Operations',
    'docs-files': 'Document & File Creation',
    'setup':      'Setup & Development',
    'people':     'People & Promotion',
}
EXT_ICONS = {
    '.gs': '⚙️', '.sh': '🐚', '.py': '🐍', '.command': '🚀',
    '.js': '📜', '.md': '📄', '.docx': '📋', '.html': '🌐', '.pdf': '📕',
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def read_safe(path, max_chars=3000):
    try:
        return Path(path).read_text(encoding='utf-8', errors='ignore')[:max_chars]
    except Exception:
        return ''

def extract_skill_description(skill_dir):
    content = read_safe(Path(skill_dir) / 'SKILL.md')
    if not content:
        return ''
    # YAML frontmatter: description: > / description: | / description: "..."
    m = re.search(
        r'^description:\s*[>|]?\s*\n?\s*(.+?)(?=\n\S|\Z)',
        content, re.MULTILINE | re.DOTALL
    )
    if m:
        raw = m.group(1)
        desc = re.sub(r'\s+', ' ', raw).strip().strip('"\'')
        return desc[:280]
    return ''

def extract_triggers(skill_dir):
    content = read_safe(Path(skill_dir) / 'SKILL.md')
    raw = re.findall(r'"([^"]{5,60})"', content)
    seen = []
    for t in raw:
        # Strip backslashes that cause JSON double-encoding issues
        t = t.replace('\\', '').strip()
        if t not in seen and not t.startswith('http') and '\n' not in t and len(t) >= 4:
            seen.append(t)
        if len(seen) == 4:
            break
    return [f'"{t}"' for t in seen]

def readme_desc(folder):
    readme = Path(folder) / 'README.md'
    content = read_safe(readme)
    if not content:
        return ''
    lines = [l.strip() for l in content.splitlines()
             if l.strip() and not l.startswith('#') and not l.startswith('|')
             and not l.startswith('-') and not l.startswith('*')]
    return lines[0][:220] if lines else ''

# ── Scanners ──────────────────────────────────────────────────────────────────
def scan_skills():
    items = []
    if not SKILLS_DIR.exists():
        print(f'  ⚠️  Skills dir not found: {SKILLS_DIR}')
        return items
    for d in sorted(SKILLS_DIR.iterdir()):
        if not d.is_dir() or d.name.startswith('.'):
            continue
        name = d.name
        desc = extract_skill_description(d) or f'Skill: {name}'
        cat  = SKILL_CATS.get(name, 'setup')
        items.append({
            'id':       name,
            'name':     name,
            'icon':     SKILL_ICONS.get(name, '⚡'),
            'cat':      cat,
            'catLabel': SKILL_CAT_LABELS.get(cat, 'Other'),
            'desc':     desc,
            'triggers': extract_triggers(d),
            'path':     f'~/.claude/skills/{name}/SKILL.md',
        })
    return items

def scan_projects():
    items = []
    bk = CLAUDE_DIR / 'Cowork_Backups'
    if not bk.exists():
        return items
    for d in sorted(bk.iterdir()):
        if not d.is_dir() or d.name.startswith('.'):
            continue
        desc  = readme_desc(d) or f'Cowork project: {d.name}'
        files = [f.name for f in sorted(d.iterdir()) if f.is_file() and not f.name.startswith('.')]
        items.append({
            'id':         re.sub(r'[^a-z0-9]', '-', d.name.lower()),
            'name':       d.name,
            'icon':       '🚀',
            'cat':        'project',
            'desc':       desc,
            'path':       f'Claude/Cowork_Backups/{d.name}/',
            'files':      files[:6],
            'backupPath': f'Claude/Cowork_Backups/{d.name}/',
        })
    return items

def scan_artifacts():
    items = []
    arts = CLAUDE_DIR / 'Artifacts'
    if not arts.exists():
        return items
    for item in sorted(arts.iterdir()):
        if item.name.startswith('.'):
            continue
        if item.is_dir():
            ver_dir  = item / 'versions'
            versions = list(ver_dir.glob('*.html')) if ver_dir.exists() else []
            desc = (f'Cowork artifact — {len(versions)} version{"s" if len(versions) != 1 else ""}'
                    if versions else 'Cowork artifact')
            items.append({
                'id':       item.name,
                'name':     item.name.replace('-', ' ').replace('_', ' ').title(),
                'icon':     '🎨',
                'cat':      'artifact',
                'desc':     desc,
                'path':     f'Claude/Artifacts/{item.name}/index.html',
                'versions': f'{len(versions)} versions' if versions else 'Single file',
            })
        elif item.suffix == '.html':
            items.append({
                'id':       item.stem,
                'name':     item.stem.replace('-', ' ').replace('_', ' ').title(),
                'icon':     '🌐',
                'cat':      'artifact',
                'desc':     'HTML artifact',
                'path':     f'Claude/Artifacts/{item.name}',
                'versions': 'Single file',
            })
    return items

def scan_scripts():
    items = []
    scripts_dir = CLAUDE_DIR / 'Scripts'
    if not scripts_dir.exists():
        return items
    skip = {'scan_dashboard.py', 'watch_claude_folder.command', '.DS_Store'}
    for f in sorted(scripts_dir.iterdir()):
        if not f.is_file() or f.name.startswith('.') or f.name in skip:
            continue
        items.append({
            'id':   f.stem,
            'name': f.name,
            'icon': EXT_ICONS.get(f.suffix, '📄'),
            'cat':  'script',
            'desc': f'Script file ({f.suffix or "no ext"})',
            'path': f'Claude/Scripts/{f.name}',
            'ext':  f.suffix or 'file',
        })
    return items

def scan_docs():
    items = []
    doc_exts = {'.md', '.docx', '.pdf', '.txt'}
    skip_names = {'Claude_Workspace_Dashboard.html', '.DS_Store'}

    # Root-level docs
    for f in sorted(CLAUDE_DIR.iterdir()):
        if not f.is_file() or f.name.startswith('.') or f.name in skip_names:
            continue
        if f.suffix in doc_exts:
            label = ('Master reference document'
                     if 'master_reference' in f.name.lower() or 'master reference' in f.name.lower()
                     else 'Document')
            items.append({
                'id':   f.stem,
                'name': f.stem.replace('_', ' '),
                'icon': EXT_ICONS.get(f.suffix, '📄'),
                'cat':  'doc',
                'desc': label,
                'path': f'Claude/{f.name}',
                'ext':  f.suffix,
            })

    # Docs/ subfolder
    docs_sub = CLAUDE_DIR / 'Docs'
    if docs_sub.exists():
        for f in sorted(docs_sub.iterdir()):
            if f.is_file() and not f.name.startswith('.'):
                items.append({
                    'id':   f.stem,
                    'name': f.stem.replace('_', ' ').replace('-', ' '),
                    'icon': EXT_ICONS.get(f.suffix, '📄'),
                    'cat':  'doc',
                    'desc': 'Documentation guide',
                    'path': f'Claude/Docs/{f.name}',
                    'ext':  f.suffix or 'file',
                })
    return items

def scan_archive():
    items = []
    arch = CLAUDE_DIR / 'Archive'
    if not arch.exists():
        return items
    for f in sorted(arch.iterdir()):
        if f.is_file() and not f.name.startswith('.'):
            items.append({
                'id':   f.stem,
                'name': f.stem.replace('_', ' '),
                'icon': '🗄️',
                'cat':  'archive',
                'desc': 'Archived file',
                'path': f'Claude/Archive/{f.name}',
                'ext':  f.suffix or 'file',
            })
    return items

def scan_scheduled():
    items = []
    sched = CLAUDE_DIR / 'Scheduled'
    if not sched.exists():
        return items
    for d in sorted(sched.iterdir()):
        if not d.is_dir() or d.name.startswith('.'):
            continue
        desc = extract_skill_description(d) or f'Scheduled task: {d.name}'
        items.append({
            'id':      d.name,
            'name':    d.name,
            'icon':    '⏰',
            'cat':     'scheduled',
            'desc':    desc,
            'path':    f'Claude/Scheduled/{d.name}/',
            'cadence': 'Recurring (see SKILL.md)',
        })
    return items

# ── GitHub-location scanners ──────────────────────────────────────────────────
def scan_gh_projects():
    """Cowork_Backups inside Claude_Github."""
    items = []
    bk = GITHUB_DIR / 'Cowork_Backups'
    if not bk.exists():
        return items
    for d in sorted(bk.iterdir()):
        if not d.is_dir() or d.name.startswith('.'):
            continue
        desc  = readme_desc(d) or f'Backed-up project: {d.name}'
        files = [f.name for f in sorted(d.iterdir()) if f.is_file() and not f.name.startswith('.')]
        items.append({
            'id':         re.sub(r'[^a-z0-9]', '-', d.name.lower()),
            'name':       d.name,
            'icon':       '🚀',
            'cat':        'project',
            'desc':       desc,
            'path':       f'Claude_Github/Cowork_Backups/{d.name}/',
            'files':      files[:6],
            'backupPath': f'Claude_Github/Cowork_Backups/{d.name}/',
        })
    return items

def scan_gh_skills():
    """Skills backed up inside Claude_Github/skills/."""
    items = []
    skills_dir = GITHUB_DIR / 'skills'
    if not skills_dir.exists():
        return items
    for d in sorted(skills_dir.iterdir()):
        if not d.is_dir() or d.name.startswith('.'):
            continue
        name = d.name
        desc = extract_skill_description(d) or f'Backed-up skill: {name}'
        cat  = SKILL_CATS.get(name, 'setup')
        items.append({
            'id':       name,
            'name':     name,
            'icon':     SKILL_ICONS.get(name, '⚡'),
            'cat':      cat,
            'catLabel': SKILL_CAT_LABELS.get(cat, 'Other'),
            'desc':     desc,
            'triggers': extract_triggers(d),
            'path':     f'Claude_Github/skills/{name}/SKILL.md',
        })
    return items

def scan_gh_scripts():
    """Scripts inside Claude_Github/scripts/."""
    items = []
    scripts_dir = GITHUB_DIR / 'scripts'
    if not scripts_dir.exists():
        return items
    for f in sorted(scripts_dir.iterdir()):
        if not f.is_file() or f.name.startswith('.'):
            continue
        items.append({
            'id':   f.stem,
            'name': f.name,
            'icon': EXT_ICONS.get(f.suffix, '📄'),
            'cat':  'script',
            'desc': f'Script file ({f.suffix or "no ext"})',
            'path': f'Claude_Github/scripts/{f.name}',
            'ext':  f.suffix or 'file',
        })
    return items

def scan_gh_docs():
    """Docs inside Claude_Github/docs/ (excluding Archived/ subfolder)."""
    items = []
    docs_dir = GITHUB_DIR / 'docs'
    if not docs_dir.exists():
        return items
    doc_exts = {'.md', '.docx', '.pdf', '.txt', '.js', '.html'}
    skip_dirs = {'Archived', 'Archive', 'Master_Reference_doc'}
    for item in sorted(docs_dir.iterdir()):
        if item.name.startswith('.') or item.name in skip_dirs:
            continue
        if item.is_file() and item.suffix in doc_exts:
            label = ('Master reference document'
                     if 'master_reference' in item.name.lower() or 'master reference' in item.name.lower()
                     else 'Document')
            items.append({
                'id':   item.stem,
                'name': item.stem.replace('_', ' ').replace('-', ' '),
                'icon': EXT_ICONS.get(item.suffix, '📄'),
                'cat':  'doc',
                'desc': label,
                'path': f'Claude_Github/docs/{item.name}',
                'ext':  item.suffix,
            })
    return items

def scan_gh_archive():
    """Archived files inside Claude_Github/docs/Archived/ and docs/Master_Reference_doc/."""
    items = []
    arch_paths = [
        GITHUB_DIR / 'docs' / 'Archived',
        GITHUB_DIR / 'docs' / 'Master_Reference_doc',
        GITHUB_DIR / 'docs' / 'Archive',
    ]
    doc_exts = {'.md', '.docx', '.pdf', '.txt', '.html'}
    for arch in arch_paths:
        if not arch.exists():
            continue
        for f in sorted(arch.iterdir()):
            if f.is_file() and not f.name.startswith('.') and f.suffix in doc_exts:
                items.append({
                    'id':   f.stem,
                    'name': f.stem.replace('_', ' '),
                    'icon': '🗄️',
                    'cat':  'archive',
                    'desc': f'Archived in {arch.name}',
                    'path': f'Claude_Github/docs/{arch.name}/{f.name}',
                    'ext':  f.suffix or 'file',
                })
    return items

# ── HTML injection ────────────────────────────────────────────────────────────
def generate_data_block():
    now         = datetime.now().strftime('%b %d, %Y %H:%M')
    skills      = scan_skills()
    projects    = scan_projects()
    arts        = scan_artifacts()
    scripts     = scan_scripts()
    docs        = scan_docs()
    archive     = scan_archive()
    sched       = scan_scheduled()
    gh_projects = scan_gh_projects()
    gh_skills   = scan_gh_skills()
    gh_scripts  = scan_gh_scripts()
    gh_docs     = scan_gh_docs()
    gh_archive  = scan_gh_archive()

    lines = [
        f'const SCANNED_AT  = {json.dumps(now)};',
        f'const SKILLS      = {json.dumps(skills,       ensure_ascii=False, indent=2)};',
        f'const PROJECTS    = {json.dumps(projects,     ensure_ascii=False, indent=2)};',
        f'const ARTIFACTS   = {json.dumps(arts,         ensure_ascii=False, indent=2)};',
        f'const SCRIPTS     = {json.dumps(scripts,      ensure_ascii=False, indent=2)};',
        f'const DOCS        = {json.dumps(docs,         ensure_ascii=False, indent=2)};',
        f'const ARCHIVE     = {json.dumps(archive,      ensure_ascii=False, indent=2)};',
        f'const SCHEDULED   = {json.dumps(sched,        ensure_ascii=False, indent=2)};',
        f'const GH_PROJECTS = {json.dumps(gh_projects,  ensure_ascii=False, indent=2)};',
        f'const GH_SKILLS   = {json.dumps(gh_skills,    ensure_ascii=False, indent=2)};',
        f'const GH_SCRIPTS  = {json.dumps(gh_scripts,   ensure_ascii=False, indent=2)};',
        f'const GH_DOCS     = {json.dumps(gh_docs,      ensure_ascii=False, indent=2)};',
        f'const GH_ARCHIVE  = {json.dumps(gh_archive,   ensure_ascii=False, indent=2)};',
    ]

    print(f'  ✅ Claude: {len(skills)} skills · {len(projects)} projects · {len(arts)} artifacts · '
          f'{len(scripts)} scripts · {len(docs)} docs · {len(archive)} archived · {len(sched)} scheduled')
    print(f'  🐙 GitHub: {len(gh_projects)} projects · {len(gh_skills)} skills · '
          f'{len(gh_scripts)} scripts · {len(gh_docs)} docs · {len(gh_archive)} archived')
    return '\n'.join(lines), now

def update_html():
    if not DASHBOARD.exists():
        print(f'❌ Dashboard not found at {DASHBOARD}')
        return False

    content = DASHBOARD.read_text(encoding='utf-8')
    pattern = r'//__DATA_START__.*?//__DATA_END__'
    if not re.search(pattern, content, re.DOTALL):
        print('❌ Data markers not found in dashboard HTML.')
        return False

    data_block, now = generate_data_block()
    new_content = re.sub(
        pattern,
        f'//__DATA_START__\n{data_block}\n//__DATA_END__',
        content,
        flags=re.DOTALL
    )
    DASHBOARD.write_text(new_content, encoding='utf-8')
    print(f'  📄 Dashboard updated at {now}')
    return True

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print('🔍 Scanning Claude workspace...')
    success = update_html()
    if not success:
        exit(1)
