#!/usr/bin/env python3
"""Wrap mobile Vue template Chinese text nodes / attrs with $t()."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path("/Users/mac/Desktop/ai/kkvibe")
FILES = (
    list((ROOT / "src/views/mobile").rglob("*.vue"))
    + list((ROOT / "src/components/mobile").rglob("*.vue"))
    + [ROOT / "src/layouts/MobileAppLayout.vue", ROOT / "src/views/AgentView.vue"]
)

ATTRS = ("placeholder", "aria-label", "alt", "title")
TEXT_RE = re.compile(r">(\s*[^<>{}]*[\u4e00-\u9fff][^<>{}]*?)\s*<")
INTERP_LABEL_RE = re.compile(
    r"\{\{\s*((?:\$t\()?)([a-zA-Z_][\w.]*\.(?:label|title|nativeName|name))\s*\)?\s*\}\}"
)


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def wrap_text_node(m: re.Match[str]) -> str:
    raw = m.group(1)
    inner = re.sub(r"\s+", " ", raw).strip()
    if not inner or "$t(" in inner or inner.startswith("{{"):
        return m.group(0)
    # keep surrounding whitespace style as single space if original had newlines? use trimmed
    return f">{{{{ $t('{esc(inner)}') }}}}<"


def wrap_attr(src: str) -> str:
    for attr in ATTRS:
        src = re.sub(
            rf'(?<!:){attr}="([^"]*[\u4e00-\u9fff][^"]*)"',
            lambda m: f':{attr}="$t(\'{esc(m.group(1))}\')"',
            src,
        )
        src = re.sub(
            rf"(?<!:){attr}='([^']*[\u4e00-\u9fff][^']*)'",
            lambda m: f":{attr}=\"$t('{esc(m.group(1))}')\"",
            src,
        )
    return src


def wrap_interp_labels(src: str) -> str:
    def repl(m: re.Match[str]) -> str:
        already, expr = m.group(1), m.group(2)
        if already:
            return m.group(0)
        if expr.startswith("$t"):
            return m.group(0)
        return "{{ $t(" + expr + ") }}"

    return INTERP_LABEL_RE.sub(repl, src)


keys: set[str] = set()
KEY_RE = re.compile(r"\$t\(\s*'((?:\\'|[^'])*)'")


def collect(src: str) -> None:
    for m in KEY_RE.findall(src):
        keys.add(m.replace("\\'", "'"))


changed = 0
for path in FILES:
    text = path.read_text()
    parts = re.split(r"(<template>.*?</template>)", text, maxsplit=1, flags=re.S)
    if len(parts) < 3:
        continue
    tpl = parts[1]
    new_tpl = wrap_attr(tpl)
    new_tpl = TEXT_RE.sub(wrap_text_node, new_tpl)
    new_tpl = wrap_interp_labels(new_tpl)
    if new_tpl != tpl:
        parts[1] = new_tpl
        path.write_text("".join(parts))
        changed += 1
    collect(new_tpl)

out = ROOT / "src/i18n/keys.json"
out.write_text(json.dumps(sorted(keys), ensure_ascii=False, indent=2) + "\n")
print(f"updated {changed} files, keys {len(keys)} -> {out}")
