# GitHub Config

## PAT (Personal Access Token)

**Not stored here** — storing the PAT in a git-tracked file triggers GitHub secret scanning and blocks the push.

The PAT is stored locally only in: `~/.claude-pat` (not tracked by git)

**Scope:** repo  
**Rotate at:** https://github.intuit.com/settings/tokens  
**Last rotated:** May 15, 2026

To update the PAT, run:
```bash
echo "ghp_YOUR_NEW_TOKEN" > ~/Documents/Claude/env.sh
chmod 600 ~/Documents/Claude/env.sh
```

## Repo

```
https://github.intuit.com/gguzman/Claude_Github
```

## Known machine paths

| Machine | Claude folder | Claude_Github path |
|---------|--------------|-------------------|
| Work (MacBook) | ~/Desktop/Claude_Desktop_MTV/ | ~/Desktop/Claude_Desktop_MTV/Claude_Github |
| Home (MacBook) | ~/Claude_MBA/ | ~/Claude_MBA/Claude_Github |
