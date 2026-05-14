# GitHub Config

## PAT (Personal Access Token)

**Not stored here** — storing the PAT in a git-tracked file triggers GitHub secret scanning and blocks the push.

The PAT is stored locally only in: `~/.claude-pat` (not tracked by git)

**Scope:** repo  
**Rotate at:** https://github.com/settings/tokens  
**Last rotated:** May 14, 2026

To update the PAT, run:
```bash
echo "ghp_YOUR_NEW_TOKEN" > ~/.claude-pat
chmod 600 ~/.claude-pat
```

## Repo

```
https://github.com/gguzman83/Claude_Github
```

## Known machine paths

| Machine | Claude folder | Claude_Github path |
|---------|--------------|-------------------|
| Work (MacBook) | ~/Desktop/Claude_Desktop_MTV/ | ~/Desktop/Claude_Desktop_MTV/Claude_Github |
| Home (MacBook) | ~/Claude_MBA/ | ~/Claude_MBA/Claude_Github |
