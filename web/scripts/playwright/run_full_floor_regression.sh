#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
WEB_DIR="${ROOT_DIR}/web"
OUT_DIR="${ROOT_DIR}/output/playwright"
RUN_CODE_FILE="${SCRIPT_DIR}/full_floor_regression.run-code.js"

SERVER_URL="${SERVER_URL:-http://127.0.0.1:4173/}"
SESSION_NAME="${PLAYWRIGHT_CLI_SESSION:-survive-check}"
RAW_OUT="${OUT_DIR}/regression_latest.raw.txt"
JSON_OUT="${OUT_DIR}/regression_latest.json"
DEV_LOG="${OUT_DIR}/devserver_latest.log"

mkdir -p "${OUT_DIR}"

PWCLI_CMD=()
if [[ -n "${PLAYWRIGHT_CLI_BIN:-}" ]]; then
  PWCLI_CMD=(node "${PLAYWRIGHT_CLI_BIN}")
elif command -v playwright-cli >/dev/null 2>&1; then
  PWCLI_CMD=(playwright-cli)
else
  CACHED_PWCLI="$(find "${HOME}/.npm/_npx" -type f -path "*/node_modules/@playwright/cli/playwright-cli.js" 2>/dev/null | sort | tail -n1 || true)"
  if [[ -n "${CACHED_PWCLI}" ]]; then
    PWCLI_CMD=(node "${CACHED_PWCLI}")
  elif [[ -x "${HOME}/.codex/skills/playwright/scripts/playwright_cli.sh" ]]; then
    PWCLI_CMD=("${HOME}/.codex/skills/playwright/scripts/playwright_cli.sh")
  else
    PWCLI_CMD=(npx --yes --package @playwright/cli playwright-cli)
  fi
fi

echo "Using Playwright CLI: ${PWCLI_CMD[*]}"

DEV_PID=""
cleanup() {
  if [[ -n "${DEV_PID}" ]]; then
    kill "${DEV_PID}" >/dev/null 2>&1 || true
  fi
  "${PWCLI_CMD[@]}" --session "${SESSION_NAME}" close >/dev/null 2>&1 || true
}
trap cleanup EXIT

if ! curl --silent --fail "${SERVER_URL}" >/dev/null 2>&1; then
  echo "Starting web dev server..."
  npm --prefix "${WEB_DIR}" run dev -- --host 127.0.0.1 --port 4173 >"${DEV_LOG}" 2>&1 &
  DEV_PID=$!

  for _ in $(seq 1 160); do
    if curl --silent --fail "${SERVER_URL}" >/dev/null 2>&1; then
      break
    fi
    sleep 0.25
  done

  if ! curl --silent --fail "${SERVER_URL}" >/dev/null 2>&1; then
    echo "Dev server did not become ready. See ${DEV_LOG}" >&2
    exit 1
  fi
else
  echo "Using existing dev server at ${SERVER_URL}"
fi

"${PWCLI_CMD[@]}" --session "${SESSION_NAME}" open "${SERVER_URL}" >/dev/null
"${PWCLI_CMD[@]}" --session "${SESSION_NAME}" run-code "$(cat "${RUN_CODE_FILE}")" | tee "${RAW_OUT}"

awk 'f{if($0 ~ /^### Ran Playwright code/){exit} print} /^### Result/{f=1;next}' "${RAW_OUT}" > "${JSON_OUT}"

node -e "const fs=require('fs');const path='${JSON_OUT}';const data=JSON.parse(fs.readFileSync(path,'utf8'));fs.writeFileSync(path,JSON.stringify(data,null,2)+'\\n');console.log('Saved',path);console.log('Seed:',data.seed);console.log('Checks:',data.passCount,'pass /',data.failCount,'fail');if((data.failCount||0)>0)process.exit(2);"

echo "Artifacts: ${OUT_DIR}"
