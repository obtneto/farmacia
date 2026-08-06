#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/home/ovidio-neto/farmacia"
MEMORIES_REPO_DIR="$PROJECT_ROOT/memories"
MEMORIES_SUMMARY_FILE="$MEMORIES_REPO_DIR/context-summary.md"
MEMORIES_ARCHIVE_FILE="$MEMORIES_REPO_DIR/context-archive.md"
COMPACT_PROMPT_FILE="$PROJECT_ROOT/docs/prompt =comapct.txt"
MEMORIES_COMMIT_MESSAGE="Atualiza resumo de contexto do projeto farmacia"
TS_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

require_git_repo() {
  local repo_dir="$1"

  if ! git -C "$repo_dir" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Diretório não é um repositório Git válido: $repo_dir"
    exit 1
  fi
}

require_clean_file() {
  if [[ ! -f "$MEMORIES_SUMMARY_FILE" ]]; then
    echo "Arquivo obrigatório ausente: $MEMORIES_SUMMARY_FILE"
    exit 1
  fi

  if [[ ! -s "$MEMORIES_SUMMARY_FILE" ]]; then
    echo "Arquivo obrigatório vazio: $MEMORIES_SUMMARY_FILE"
    exit 1
  fi

  if [[ ! -f "$MEMORIES_ARCHIVE_FILE" ]]; then
    echo "Arquivo obrigatório ausente: $MEMORIES_ARCHIVE_FILE"
    exit 1
  fi
}

normalize_markdown() {
  local tmp_file
  tmp_file="$(mktemp)"

  awk '
    {
      sub(/[ \t]+$/, "")
      if ($0 == "") {
        blank_count++
        if (blank_count <= 1) {
          print
        }
      } else {
        blank_count=0
        print
      }
    }
  ' "$MEMORIES_SUMMARY_FILE" > "$tmp_file"

  mv "$tmp_file" "$MEMORIES_SUMMARY_FILE"
}

show_compact_prompt() {
  if [[ -f "$COMPACT_PROMPT_FILE" ]]; then
    echo
    echo "Instrução de compactação:"
    cat "$COMPACT_PROMPT_FILE"
    echo
  fi
}

prepare_backup() {
  local backup_file
  backup_file="/tmp/context-summary.$(date -u +%Y%m%dT%H%M%SZ).bak.md"
  cp "$MEMORIES_SUMMARY_FILE" "$backup_file"
  echo "Backup temporário criado em $backup_file"
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
  git -C "$MEMORIES_REPO_DIR" add --all .

  if git -C "$MEMORIES_REPO_DIR" diff --cached --quiet; then
    return 1
  fi

  git -C "$MEMORIES_REPO_DIR" commit -m "$MEMORIES_COMMIT_MESSAGE"
  push_current_branch "$MEMORIES_REPO_DIR"
  return 0
}

run_compaction_flow() {
  prepare_backup
  show_compact_prompt
  echo "Usando o conteúdo atual de $MEMORIES_SUMMARY_FILE e $MEMORIES_ARCHIVE_FILE para publicação."

  normalize_markdown
}

require_git_repo "$MEMORIES_REPO_DIR"
require_clean_file

echo "[$TS_UTC] Validando repositório de memórias em $MEMORIES_REPO_DIR"

run_compaction_flow

if commit_if_needed; then
  echo "Resumo de contexto compactado e publicado no repositório de memórias."
else
  echo "Nenhuma alteração para publicar em memories/."
fi

echo "Fluxo de atualização de memories concluído em $TS_UTC"
