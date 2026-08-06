#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/home/ovidio-neto/farmacia"
SOURCE_CODEX_HOME="/home/ovidio-neto/.codex"
TMP_CODEX_HOME="${TMPDIR:-/tmp}/codex-home-link"

usage() {
  cat <<'EOF'
Uso:
  scripts/codex-exec-tmp.sh [args do codex exec]

Exemplos:
  scripts/codex-exec-tmp.sh -o .agents/swarm/results/arquiteto.md "Liste os blocos de trabalho"
  scripts/codex-exec-tmp.sh --json -o /tmp/saida.jsonl "echo ok"
EOF
}

link_entry() {
  local source_path="$1"
  local target_path="$2"

  if [[ -e "$source_path" ]]; then
    ln -sfn "$source_path" "$target_path"
  fi
}

ensure_tmp_codex_home() {
  mkdir -p "$TMP_CODEX_HOME"
  link_entry "$SOURCE_CODEX_HOME/auth.json" "$TMP_CODEX_HOME/auth.json"
  link_entry "$SOURCE_CODEX_HOME/config.toml" "$TMP_CODEX_HOME/config.toml"
  link_entry "$SOURCE_CODEX_HOME/plugins" "$TMP_CODEX_HOME/plugins"
  link_entry "$SOURCE_CODEX_HOME/skills" "$TMP_CODEX_HOME/skills"
}

has_exec_arg() {
  local expected="$1"
  shift

  for arg in "$@"; do
    if [[ "$arg" == "$expected" ]]; then
      return 0
    fi
  done

  return 1
}

main() {
  if [[ $# -eq 0 ]]; then
    usage
    exit 1
  fi

  ensure_tmp_codex_home

  if ! has_exec_arg "--ephemeral" "$@"; then
    set -- --ephemeral "$@"
  fi

  if ! has_exec_arg "-C" "$@" && ! has_exec_arg "--cd" "$@"; then
    set -- -C "$PROJECT_ROOT" "$@"
  fi

  exec env CODEX_HOME="$TMP_CODEX_HOME" codex exec "$@"
}

main "$@"
