# Claude GitHub Push Function
# Add to ~/.zshrc by running:
#   cat ~/Documents/Claude/Scripts/push-to-github.sh >> ~/.zshrc && source ~/.zshrc
#
# Usage: push-to-github
# Optional custom message: push-to-github "my commit message"

push-to-github() {
  source ~/Documents/Claude/Scripts/env.sh
  local REPO_URL="https://${GITHUB_USER}:${GITHUB_PAT}@github.intuit.com/${GITHUB_REPO}.git"
  local MSG="${1:-Github_Autosave: manual push [$(date +%Y-%m-%d)]}"

  cd ~/Documents/Claude/Claude_Github || { echo "❌ Repo folder not found"; return 1; }

  git add -A
  git diff --cached --quiet && echo "✅ Nothing new to commit — already up to date" && return 0

  git commit -m "$MSG"
  git pull --rebase "$REPO_URL" main && git push "$REPO_URL" main \
    && echo "✅ Pushed to github.intuit.com/${GITHUB_REPO}" \
    || echo "❌ Push failed — check your PAT at github.intuit.com/settings/tokens"
}
