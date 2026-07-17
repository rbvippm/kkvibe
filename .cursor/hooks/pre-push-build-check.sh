#!/usr/bin/env bash
# 拦截推送到 origin/main：先跑 npm run build，失败则拒绝 push
set -euo pipefail

input=$(cat)
command=$(printf '%s' "$input" | python3 -c "import sys,json; print(json.load(sys.stdin).get('command',''))" 2>/dev/null || true)

allow() {
  echo '{"permission":"allow"}'
  exit 0
}

deny() {
  python3 -c "import json,sys; print(json.dumps({
    'permission': 'deny',
    'user_message': sys.argv[1],
    'agent_message': sys.argv[1]
  }, ensure_ascii=False))" "$1"
  exit 0
}

# 非 git push 直接放行
if ! printf '%s' "$command" | grep -Eq '(^|[[:space:];|&])git[[:space:]]+([^|&;]*[[:space:]]+)?push([[:space:]]|$)'; then
  allow
fi

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
mentions_main=false
if printf '%s' "$command" | grep -Eq '(^|[[:space:]:/])main([[:space:]:]|$)'; then
  mentions_main=true
fi

# 明确推送到非 main 分支时放行（如 git push -u origin feature/x）
if [[ "$mentions_main" != "true" ]] && printf '%s' "$command" | grep -Eq 'origin[[:space:]]+[A-Za-z0-9._/-]+'; then
  ref=$(printf '%s' "$command" | sed -nE 's/.*origin[[:space:]]+([^[:space:]]+).*/\1/p' | head -1)
  if [[ -n "$ref" && "$ref" != "main" && "$ref" != "HEAD" ]]; then
    allow
  fi
fi

# 当前不在 main，且命令未指向 main → 放行
if [[ "$branch" != "main" && "$mentions_main" != "true" ]]; then
  allow
fi

echo "[pre-push-build-check] 推送 origin/main 前执行 npm run build ..." >&2
if ! npm run build >&2; then
  deny "打包编译失败（npm run build）。请先修复错误并重新 build 通过后，再推送到 origin/main。"
fi

allow
