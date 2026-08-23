# -*- coding: utf-8 -*-
"""Health-check multilingual sheet dumps."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from opencc import OpenCC

cc = OpenCC("s2t")

VI_RE = re.compile(
    r"[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ"
    r"ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]"
)
TH_RE = re.compile(r"[\u0E00-\u0E7F]")
CJK_RE = re.compile(r"[\u4e00-\u9fff]")
LATIN_RE = re.compile(r"[A-Za-z]")
VAR_RE = re.compile(r"(%\d*\$?[sd]|\{[^}]+\}|\\n|%@)")
ERR_MARKERS = ("#REF!", "#N/A", "#ERROR!", "#VALUE!", "#NAME?", "GOOGLETRANSLATE", "正在加载翻译")


def has_vi(s: str) -> bool:
    return bool(VI_RE.search(s or ""))


def has_th(s: str) -> bool:
    return bool(TH_RE.search(s or ""))


def has_cjk(s: str) -> bool:
    return bool(CJK_RE.search(s or ""))


def mostly_latin(s: str) -> bool:
    s = s or ""
    if has_th(s) or has_vi(s):
        return False
    letters = LATIN_RE.findall(s)
    cjk = CJK_RE.findall(s)
    return len(letters) > 0 and len(letters) >= len(cjk)


def count_vars(s: str):
    return sorted(VAR_RE.findall(s or ""))


def analyze_rows(rows, start_row: int, skip_header: bool = True):
    empty = []
    swap_de = []
    bad_b = []
    bad_c = []
    bad_d = []
    bad_e_vi = []
    e_needs_trad = []
    e_has_simp = []
    formula_like = []
    var_mismatch = []
    all_zh = []
    total = 0

    for i, r in enumerate(rows):
        rownum = start_row + i
        if skip_header and start_row == 1 and i == 0:
            continue
        r = list(r) + [""] * (5 - len(r))
        a, b, c, d, e = [(x.strip() if isinstance(x, str) else "") for x in r[:5]]
        if not a:
            continue
        total += 1

        miss = []
        for val, name in [(b, "B"), (c, "C"), (d, "D"), (e, "E")]:
            if val == "" or any(m in val for m in ERR_MARKERS[:5]):
                miss.append(name)
            if val.startswith("=") or "GOOGLETRANSLATE" in val.upper() or any(
                m in val for m in ERR_MARKERS
            ):
                formula_like.append((rownum, name, val[:80]))
        if miss:
            empty.append((rownum, a[:60], miss))

        # D/E swap: D Chinese, E Vietnamese
        if d and e and has_cjk(d) and not has_vi(d) and has_vi(e) and not has_cjk(e):
            swap_de.append((rownum, a[:50], d[:40], e[:40]))

        # B wrong language
        if b and (has_th(b) or has_vi(b)):
            bad_b.append((rownum, a[:40], b[:50]))
        elif b and has_cjk(b) and not mostly_latin(b) and not re.search(r"[A-Za-z]{2,}", b):
            bad_b.append((rownum, a[:40], b[:50]))

        # C should be Thai
        if c and ((has_vi(c) and not has_th(c)) or (has_cjk(c) and not has_th(c))):
            bad_c.append((rownum, a[:40], c[:50]))

        # D should be Vietnamese (if has CJK and no VI marks, suspicious when long)
        if d and has_cjk(d) and not has_vi(d) and not has_th(d) and len(CJK_RE.findall(d)) >= 2:
            # allow pure digits/symbols mixed - flag Chinese in D
            bad_d.append((rownum, a[:40], d[:50]))

        # E is Vietnamese
        if e and has_vi(e) and not has_cjk(e):
            bad_e_vi.append((rownum, a[:40], e[:50]))

        # E equals A but needs traditional conversion
        if e and a and e == a and has_cjk(a):
            t = cc.convert(a)
            if t != a:
                e_needs_trad.append((rownum, a, t))

        # E differs from A but still contains simplified forms
        if e and has_cjk(e):
            te = cc.convert(e)
            if te != e:
                e_has_simp.append((rownum, a[:40], e[:40], te[:40]))

        av = count_vars(a)
        if av:
            bv, cv, dv, ev = map(count_vars, [b, c, d, e])
            if av != bv or av != cv or av != dv or av != ev:
                var_mismatch.append((rownum, a[:40], av, bv, cv, dv, ev))

        if b and c and d and e and b == c == d == e and has_cjk(b):
            all_zh.append((rownum, a[:40]))

    return {
        "total": total,
        "empty": empty,
        "swap_de": swap_de,
        "bad_b": bad_b,
        "bad_c": bad_c,
        "bad_d": bad_d,
        "bad_e_vi": bad_e_vi,
        "e_needs_trad": e_needs_trad,
        "e_has_simp": e_has_simp,
        "formula_like": formula_like,
        "var_mismatch": var_mismatch,
        "all_zh": all_zh,
    }


def print_report(name, res, limit=40):
    print(f"\n===== {name} =====")
    print("rows", res["total"])
    for key in [
        "empty",
        "swap_de",
        "bad_b",
        "bad_c",
        "bad_d",
        "bad_e_vi",
        "e_needs_trad",
        "e_has_simp",
        "formula_like",
        "var_mismatch",
        "all_zh",
    ]:
        items = res[key]
        print(f"{key}: {len(items)}")
        for x in items[:limit]:
            print(" ", x)


def main():
    files = [
        (
            "/Users/mac/.cursor/projects/Users-mac-Desktop-ai-kkvibe/agent-tools/415ce7c9-0f05-4bdb-a7ce-f7ed87a04ca5.txt",
            1,
        ),
        (
            "/Users/mac/.cursor/projects/Users-mac-Desktop-ai-kkvibe/agent-tools/9802005f-3be1-41d5-9dce-5814337805ed.txt",
            801,
        ),
        (
            "/Users/mac/.cursor/projects/Users-mac-Desktop-ai-kkvibe/agent-tools/093cb07d-4a7c-4d14-9cb8-e772f215ec2e.txt",
            1601,
        ),
    ]
    merged = None
    for path, start in files:
        data = json.load(open(path))
        rows = data["valueRanges"][0]["values"]
        res = analyze_rows(rows, start, skip_header=(start == 1))
        if merged is None:
            merged = res
        else:
            for k, v in res.items():
                if k == "total":
                    merged[k] += v
                else:
                    merged[k].extend(v)
    print_report("k2-app", merged)

    # Write fix list for traditional
    out = Path("/Users/mac/Desktop/ai/kkvibe/.tmp/k2app_trad_fixes.json")
    payload = {
        "e_needs_trad": [
            {"row": r, "zh": a, "trad": t} for r, a, t in merged["e_needs_trad"]
        ],
        "e_has_simp": [
            {"row": r, "zh": a, "cur": e, "trad": t}
            for r, a, e, t in merged["e_has_simp"]
        ],
        "empty": [{"row": r, "zh": a, "miss": m} for r, a, m in merged["empty"]],
        "swap_de": [
            {"row": r, "zh": a, "d": d, "e": e} for r, a, d, e in merged["swap_de"]
        ],
        "bad_b": [{"row": r, "zh": a, "b": b} for r, a, b in merged["bad_b"]],
        "bad_c": [{"row": r, "zh": a, "c": c} for r, a, c in merged["bad_c"]],
        "bad_d": [{"row": r, "zh": a, "d": d} for r, a, d in merged["bad_d"]],
        "var_mismatch": [
            {"row": r, "zh": a, "a": av, "b": bv, "c": cv, "d": dv, "e": ev}
            for r, a, av, bv, cv, dv, ev in merged["var_mismatch"]
        ],
    }
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print("wrote", out)


if __name__ == "__main__":
    main()
