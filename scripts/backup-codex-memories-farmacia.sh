#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/home/ovidio-neto/farmacia"
SOURCE_REPO_DIR="$PROJECT_ROOT/.codex/memories"
BACKUP_REPO_DIR="/home/ovidio-neto/memories-farmacia"
BACKUP_BASE_DIR="$BACKUP_REPO_DIR/.codex/memories-backup/farmacia"
SNAPSHOT_DATE="$(date -u +%Y-%m-%d)"
SNAPSHOT_DIR="$BACKUP_BASE_DIR/snapshots/$SNAPSHOT_DATE"
LAST_SYNC_FILE="$BACKUP_BASE_DIR/LAST_SYNC.txt"
CHANGELOG_FILE="$BACKUP_REPO_DIR/.codex/memories-backup/CHANGELOG.md"
TS_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
COMMIT_MESSAGE="memories commited (farmacia $SNAPSHOT_DATE)"
PUSH_ENABLED=true

if [[ "${1:-}" == "--no-push" ]]; then
  PUSH_ENABLED=false
fi

require_git_repo() {
  local repo_dir="$1"

  if ! git -C "$repo_dir" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Diretório não é um repositório Git válido: $repo_dir"
    exit 1
  fi
}

require_file() {
  local file_path="$1"

  if [[ ! -f "$file_path" ]]; then
    echo "Arquivo obrigatório ausente: $file_path"
    exit 1
  fi
}

ensure_directory() {
  local dir_path="$1"
  mkdir -p "$dir_path"
}

copy_snapshot_files() {
  cp "$SOURCE_REPO_DIR/MEMORY.md" "$SNAPSHOT_DIR/MEMORY.md"
  cp "$SOURCE_REPO_DIR/memory_summary.md" "$SNAPSHOT_DIR/memory_summary.md"
  chmod 0644 "$SNAPSHOT_DIR/MEMORY.md" "$SNAPSHOT_DIR/memory_summary.md"
}

update_last_sync() {
  printf '%s\n' "$TS_UTC" > "$LAST_SYNC_FILE"
}

update_changelog() {
  local entry="- Backup farmacia atualizado em $TS_UTC"

  if [[ -f "$CHANGELOG_FILE" ]] && grep -Fqx -- "$entry" "$CHANGELOG_FILE"; then
    return
  fi

  printf '\n%s\n' "$entry" >> "$CHANGELOG_FILE"
}

push_current_branch() {
  local repo_dir="$1"
  local branch

  branch="$(git -C "$repo_dir" branch --show-current)"

  if [[ -z "$branch" ]]; then
    echo "Não foi possível identificar a branch atual em: $repo_dir"
    exit 1
  fi

  if git -C "$repo_dir" rev-parse --abbrev-ref "@{upstream}" >/dev/null 2>&1; then
    git -C "$repo_dir" push
  else
    git -C "$repo_dir" push -u origin "$branch"
  fi
}

commit_if_needed() {
  git -C "$BACKUP_REPO_DIR" add --all .

  if git -C "$BACKUP_REPO_DIR" diff --cached --quiet; then
    return 1
  fi

  git -C "$BACKUP_REPO_DIR" commit -m "$COMMIT_MESSAGE"

  if [[ "$PUSH_ENABLED" == true ]]; then
    push_current_branch "$BACKUP_REPO_DIR"
  fi

  return 0
}

require_git_repo "$SOURCE_REPO_DIR"
require_git_repo "$BACKUP_REPO_DIR"
require_file "$SOURCE_REPO_DIR/MEMORY.md"
require_file "$SOURCE_REPO_DIR/memory_summary.md"
ensure_directory "$SNAPSHOT_DIR"

echo "[$TS_UTC] Publicando backup sanitizado de $SOURCE_REPO_DIR"

copy_snapshot_files
update_last_sync
update_changelog

if commit_if_needed; then
  if [[ "$PUSH_ENABLED" == true ]]; then
    echo "Backup sanitizado de .codex/memories publicado."
  else
    echo "Backup sanitizado de .codex/memories preparado localmente, sem push."
  fi
else
  echo "Nenhuma alteração para publicar no backup sanitizado."
fi
