#!/usr/bin/env python3
"""Count characters in a clear-write document and check them against its limits.

Usage:
  python3 count_chars.py draft.md --length 3 --intent propose
  python3 count_chars.py draft.md --chars 5000
  python3 count_chars.py draft.md                # counts only, no limit check

What is counted:
  Body   = everything except the TL;DR paragraph and the footer.
  TL;DR  = the paragraph starting with "TL;DR" (bold or not); label excluded.
  Footer = everything after the last line that is exactly "---", if that part
           mentions "characters" (so ordinary horizontal rules are not cut).
  Markdown markers (#, *, _, `, >) are stripped first. Spaces count.

Exit code 1 if the body or the TL;DR is over its limit, 2 on bad arguments.
"""
import argparse
import re
import sys

TEMPLATES = {1: 3000, 3: 9000, 10: 30000}
TLDR_CAP = {1: 0, 3: 300, 10: 500}

BUDGETS = {
    "inform": {
        1: {"conclusion": 300, "why it matters": 600, "explanation": 1800, "key takeaway": 300},
        3: {"conclusion": 500, "why it matters": 1500, "explanation": 6000, "key takeaway": 1000},
        10: {"conclusion": 1500, "why it matters": 4000, "explanation": 22000, "key takeaway": 2500},
    },
    "propose": {
        1: {"conclusion": 300, "why it matters": 600, "risk of not doing it": 300, "rationale": 1500, "next step": 300},
        3: {"conclusion": 500, "why it matters": 1500, "risk of not doing it": 1000, "rationale": 5000, "next step": 1000},
        10: {"conclusion": 1500, "why it matters": 4000, "risk of not doing it": 3000, "rationale": 19000, "next step": 2500},
    },
}
BUDGETS["explain"] = BUDGETS["inform"]

TLDR_RE = re.compile(r"^\s*(\*\*)?TL;DR:?(\*\*)?:?\s*", re.I)


def clean(text):
    text = re.sub(r"^#+\s*", "", text, flags=re.M)
    text = re.sub(r"[*_`>]", "", text)
    return text.strip()


def split_document(doc):
    lines = doc.splitlines()
    footer = ""
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == "---":
            tail = "\n".join(lines[i + 1:])
            if "character" in tail.lower():
                footer, lines = tail, lines[:i]
            break
    paragraphs = re.split(r"\n\s*\n", "\n".join(lines))
    tldr, rest = "", []
    for p in paragraphs:
        if not tldr and TLDR_RE.match(p):
            tldr = TLDR_RE.sub("", p, count=1)
        else:
            rest.append(p)
    return "\n\n".join(rest), tldr, footer


def bucket_for(heading, intent):
    h = heading.strip().lower()
    for name in ("conclusion", "why it matters", "risk of not doing it", "key takeaway", "next step"):
        if h.startswith(name) or (name == "risk of not doing it" and h.startswith("risk")):
            return name
    if h.startswith("takeaway"):
        return "key takeaway"
    return "rationale" if intent == "propose" else "explanation"


def section_counts(body, intent):
    counts, current = {}, "title"
    chunks = {current: []}
    for line in body.splitlines():
        m = re.match(r"^##\s+(.*)", line)
        if m and not line.startswith("###"):
            current = bucket_for(m.group(1), intent)
            chunks.setdefault(current, [])
        chunks[current].append(line)
    for name, part in chunks.items():
        counts[name] = len(clean("\n".join(part)))
    return counts


def fmt(n):
    return f"{n:,}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file")
    ap.add_argument("--length", type=int, choices=[1, 3, 10])
    ap.add_argument("--chars", type=int)
    ap.add_argument("--intent", choices=["inform", "explain", "propose"], default="inform")
    args = ap.parse_args()

    if args.length and args.chars:
        print("Use --length or --chars, not both.")
        return 2

    limit, template = None, None
    if args.length:
        template, limit = args.length, TEMPLATES[args.length]
    elif args.chars:
        if args.chars > 30000:
            print("Limit is 30,000 characters. Split the topic into separate documents.")
            return 2
        limit = args.chars
        template = 1 if limit <= 3000 else 3 if limit <= 9000 else 10

    with open(args.file, encoding="utf-8") as f:
        body, tldr, _ = split_document(f.read())

    body_n = len(clean(body))
    tldr_n = len(clean(tldr))
    failed = False

    if limit is None:
        print(f"Body:  {fmt(body_n)} characters")
        if tldr:
            print(f"TL;DR: {fmt(tldr_n)} characters")
        return 0

    status = "OK" if body_n <= limit else f"OVER by {fmt(body_n - limit)}"
    failed |= body_n > limit
    print(f"Body:  {fmt(body_n)} / {fmt(limit)}  {status}")

    cap = TLDR_CAP[template]
    if cap == 0:
        if tldr:
            print("TL;DR: present, but 1-page documents have no TL;DR. Remove it.")
            failed = True
    elif not tldr:
        print(f"TL;DR: missing (expected 2-3 sentences, max {cap})")
    else:
        t_status = "OK" if tldr_n <= cap else f"OVER by {fmt(tldr_n - cap)}"
        failed |= tldr_n > cap
        print(f"TL;DR: {fmt(tldr_n)} / {fmt(cap)}  {t_status}")

    if template in (3, 10):
        factor = limit / TEMPLATES[template]
        targets = {k: int(v * factor) for k, v in BUDGETS[args.intent][template].items()}
        counts = section_counts(body, args.intent)
        print("\nSections (target, flex ~20%):")
        if counts.get("title"):
            print(f"  {'title':<22}{fmt(counts['title']):>8}")
        for name, target in targets.items():
            n = counts.get(name, 0)
            note = "missing" if n == 0 else ("over target" if n > target * 1.2 else "")
            print(f"  {name:<22}{fmt(n):>8} / {fmt(target):<8}{note}")

    if body_n < limit * 0.6:
        print(f"\nNote: body is under 60% of the limit. Fine if the topic is covered; don't pad.")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
