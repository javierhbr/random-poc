#!/usr/bin/env python3
"""Read-only frontmatter checks; not a full OKF or factual audit.
Code-aware citation stripping adapted from okf-skills (MIT, Marco Boffo).
"""
from __future__ import annotations
import argparse
from datetime import date, datetime
import json
import os
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

try:
    import yaml
except ImportError:
    print("Missing PyYAML; use scripts/requirements.txt in your Python environment.", file=sys.stderr)
    raise SystemExit(2)

MAX_BYTES, MAX_FILES = 2 * 1024 * 1024, 1000
STAMP = re.compile(r"^\d{4}-\d{2}-\d{2}[Tt]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[Zz]|[+-]\d{2}:\d{2})$")
FENCE = re.compile(r"^ {0,3}(\x60{3,}|~{3,})")
SPAN = re.compile(r"(?<!\x60)(\x60+)(?!\x60)((?:(?!\n[ \t]*\n).)+?)(?<!\x60)\1(?!\x60)", re.S)
LINK = re.compile(r"(?<!!)\[[^\]\n]*\]\(([^()\s]+)(?:\s+\"[^\"]*\")?\)")
FOOTNOTE = re.compile(r"\[\^([^\]\s]+)\]")


class UniqueLoader(yaml.SafeLoader):
    """Safe YAML with duplicate detection and dates retained as strings."""
    yaml_implicit_resolvers = {
        key: [(tag, rx) for tag, rx in values if tag != "tag:yaml.org,2002:timestamp"]
        for key, values in yaml.SafeLoader.yaml_implicit_resolvers.items()
    }

    def construct_mapping(self, node, deep=False):
        seen = set()
        for key_node, _ in node.value:
            if key_node.tag == "tag:yaml.org,2002:merge":
                raise yaml.constructor.ConstructorError(None, None, "YAML merge keys are unsupported; use explicit fields", key_node.start_mark)
            key = self.construct_object(key_node, deep=deep)
            if not isinstance(key, str):
                raise yaml.constructor.ConstructorError(None, None, "metadata keys must be strings", key_node.start_mark)
            if key in seen:
                raise yaml.constructor.ConstructorError(None, None, f"duplicate key: {key}", key_node.start_mark)
            seen.add(key)
        return super().construct_mapping(node, deep=deep)


def text_value(value):
    return isinstance(value, str) and bool(value.strip())


def bounded_tree(value, active=None, budget=None):
    active = set() if active is None else active
    budget = [20000] if budget is None else budget
    budget[0] -= 1
    if budget[0] < 0:
        raise ValueError("metadata exceeds 20,000 nodes")
    if isinstance(value, (dict, list)):
        if id(value) in active:
            raise ValueError("recursive YAML aliases are unsupported")
        active.add(id(value))
        for child in (value.values() if isinstance(value, dict) else value):
            bounded_tree(child, active, budget)
        active.remove(id(value))


def strip_code(body):
    kept, fence = [], ""
    for line in body.splitlines():
        match = FENCE.match(line)
        if fence:
            if match and match[1][0] == fence[0] and len(match[1]) >= len(fence) and not line[match.end():].strip():
                fence = ""
            continue
        if match and not (match[1][0] == chr(96) and chr(96) in line[match.end():]):
            fence = match[1]
            continue
        kept.append(line)
    return SPAN.sub("", "\n".join(kept))


def new_report(path, profile):
    return {"file": str(path), "profile": profile, "checks_performed": [],
            "checks_skipped": ["factual truth and approval authority", "full Markdown and anchor resolution",
                               "external URLs and source-resource resolution", "attestation execution"],
            "diagnostics": []}


def diagnostic(report, field, reason, fix, severity="error", category="format", line=None):
    report["diagnostics"].append({"file": report["file"], "line": line, "field": field,
                                 "severity": severity, "category": category,
                                 "reason": reason, "suggested_fix": fix})


def parse(text, report):
    lines = text.lstrip("\ufeff").splitlines(keepends=True)
    report["checks_performed"].append("optional frontmatter delimiters")
    if not lines:
        return None, "", False
    first = lines[0].rstrip("\r\n")
    if first.rstrip() != "---":
        if first.strip() in ("---", "...") or first.startswith("---"):
            diagnostic(report, "$", "malformed opening delimiter", "Use --- alone at the start of the file.", line=1)
        return None, "".join(lines), False
    closing = next((i for i in range(1, len(lines)) if lines[i].rstrip("\r\n").rstrip() == "---"), None)
    if closing is None:
        diagnostic(report, "$", "unterminated frontmatter", "Close the block with --- on its own line.", line=1)
        return None, "", True
    raw, body = "".join(lines[1:closing]), "".join(lines[closing + 1:])
    report["checks_performed"].append("safe YAML, unique string keys, mapping root")
    try:
        meta = yaml.load(raw, Loader=UniqueLoader)
        if not isinstance(meta, dict):
            diagnostic(report, "$", "frontmatter must be a YAML mapping", "Use key: value fields (or {}).", line=2)
            return None, body, True
        bounded_tree(meta)
        return meta, body, True
    except (yaml.YAMLError, ValueError, RecursionError) as exc:
        mark = getattr(exc, "problem_mark", None)
        diagnostic(report, "$", getattr(exc, "problem", None) or str(exc),
                   "Correct the metadata without changing unrelated prose.", line=mark.line + 2 if mark else None)
        return None, body, True


def instant(value):
    if not isinstance(value, str) or not STAMP.fullmatch(value):
        return None
    try:
        return datetime.fromisoformat(value.upper().replace("Z", "+00:00"))
    except ValueError:
        return None


def check_metadata(meta, body, report):
    report["checks_performed"].extend(["concept type", "optional OKF v0.2 metadata shapes", "source ID and code-aware footnote joins"])
    if not text_value(meta.get("type")):
        diagnostic(report, "type", "missing or empty string type", "Supply the concept's non-empty type.")

    def warn(field, reason, fix="Correct the field using actual evidence; preserve unknown fields."):
        diagnostic(report, field, reason, fix, "warning", "policy")

    def stamp(value, field):
        if instant(value) is None:
            warn(field, "expected a real datetime with an explicit UTC offset")

    def actor(value, field):
        if not text_value(value):
            warn(field, "expected a non-empty actor string")
        elif re.match(r"^(?:human|process)(?![A-Za-z0-9_])", value, re.I) and not value.startswith(("human:", "process:")):
            warn(field, "human/process actor prefix has non-canonical spelling",
                 "Confirm the actual actor; use human: or process: only when justified.")

    def event(value, field):
        if not isinstance(value, dict):
            warn(field, "expected a mapping containing by and at")
            return
        actor(value.get("by"), field + ".by")
        stamp(value.get("at"), field + ".at")

    def window(value, field):
        if not isinstance(value, dict):
            warn(field, "expected a from/to mapping")
            return
        for key in ("from", "to"):
            stamp(value.get(key), field + "." + key)
        start, end = instant(value.get("from")), instant(value.get("to"))
        if start and end and start > end:
            warn(field, "usage window starts after it ends")

    if "generated" in meta:
        event(meta["generated"], "generated")
    if "verified" in meta:
        events = [meta["verified"]] if isinstance(meta["verified"], dict) else meta["verified"]
        if not isinstance(events, list):
            warn("verified", "expected an event mapping or list")
        else:
            for i, item in enumerate(events):
                event(item, f"verified[{i}]")
    if "timestamp" in meta:
        warn("timestamp", "legacy metadata; no automatic migration",
             "Preserve recorded provenance; migrate only within an explicit migration request.")
    if "status" in meta and meta["status"] not in ("draft", "stable", "deprecated"):
        warn("status", "unknown OKF lifecycle state")
    if "stale_after" in meta:
        stamp(meta["stale_after"], "stale_after")
    if "usage_window" in meta:
        window(meta["usage_window"], "usage_window")
    if meta.get("type") == "Attested Computation" and not text_value(meta.get("runtime")):
        warn("runtime", "Attested Computation has no runtime", "Supply the declared runtime; do not execute it.")
    ids = set()
    sources = meta.get("sources", [])
    if not isinstance(sources, list):
        warn("sources", "expected a list of source mappings")
        sources = []
    for i, source in enumerate(sources):
        field = f"sources[{i}]"
        if not isinstance(source, dict):
            warn(field, "expected a source mapping")
            continue
        if not text_value(source.get("resource")):
            warn(field + ".resource", "missing non-empty resource string")
        if "id" in source:
            ident = source["id"]
            if not text_value(ident) or re.search(r"[\s\[\]]", ident):
                warn(field + ".id", "expected a non-empty footnote-compatible source ID")
            elif ident in ids:
                warn(field + ".id", "duplicate source ID makes attribution ambiguous")
            else:
                ids.add(ident)
        if "author" in source:
            actor(source["author"], field + ".author")
        if "last_modified" in source:
            stamp(source["last_modified"], field + ".last_modified")
        if "usage_window" in source:
            window(source["usage_window"], field + ".usage_window")
        if "usage_count" in source:
            count = source["usage_count"]
            if isinstance(count, bool) or not isinstance(count, int) or count < 0:
                warn(field + ".usage_count", "expected a non-negative integer")
            if "usage_window" not in source and "usage_window" not in meta:
                warn(field + ".usage_count", "count has no framing usage window")
    for label in sorted(set(FOOTNOTE.findall(strip_code(body))) - ids):
        warn("sources", f"footnote [^{label}] has no matching source ID",
             "Add the actual source with this ID, or correct the reference; do not invent evidence.")


def check_reserved(meta, present, body, path, bundle, report):
    report["checks_performed"].append("OKF v0.2 reserved-file structure")
    if path.name == "index.md":
        if present and path.parent != bundle:
            diagnostic(report, "$", "nested index.md must not have frontmatter", "Keep metadata in concepts; preserve index links.")
        elif isinstance(meta, dict):
            if set(meta) - {"okf_version"}:
                diagnostic(report, "$", "root index metadata may only declare okf_version", "Move configuration outside the OKF bundle.")
            if "okf_version" in meta and str(meta["okf_version"]) != "0.2":
                diagnostic(report, "okf_version", "version differs from checked v0.2 profile",
                           "Review version-specific requirements; no migration was performed.", "warning", "policy")
    else:
        if present:
            diagnostic(report, "$", "log.md must not have frontmatter", "Keep the log as dated Markdown entries.")
        dates = []
        for line in strip_code(body).splitlines():
            if line.startswith("## "):
                value = line[3:].strip()
                try:
                    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
                        raise ValueError()
                    dates.append(date.fromisoformat(value))
                except ValueError:
                    diagnostic(report, "$body", f"invalid log date heading: {value}", "Use a real YYYY-MM-DD as the whole level-two heading.")
        if dates != sorted(dates, reverse=True):
            diagnostic(report, "$body", "log dates are not newest first", "Arrange date groups newest first.")


def check_links(body, path, bundle, root, report):
    if root is None:
        report["checks_skipped"].append("local link existence: no root boundary supplied")
        return
    report["checks_performed"].append("common inline local link existence")
    for raw in LINK.findall(strip_code(body)):
        try:
            parsed = urlsplit(raw.strip("<>"))
        except ValueError:
            diagnostic(report, "$body", f"unparseable link: {raw}", "Review the target.", "warning", "reference")
            continue
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        target = unquote(parsed.path)
        base = bundle or root
        resolved = (base / target.lstrip("/") if target.startswith("/") else path.parent / target).resolve()
        if not resolved.is_relative_to(root):
            report["checks_skipped"].append(f"out-of-scope link: {raw}")
        elif not resolved.exists():
            diagnostic(report, "$body", f"local link target missing: {raw}",
                       "Review the path or pending target and recheck after saving.", "warning", "reference")


def check_schema(meta, schema_path, report):
    if schema_path is None:
        if report["profile"] != "okf":
            report["checks_skipped"].append("artifact schema not configured; YAML syntax only")
        return
    try:
        import jsonschema
    except ImportError:
        raise RuntimeError("jsonschema is required when --schema is supplied")
    try:
        schema = json.loads(schema_path.read_text(encoding="utf-8"))
        def inspect(value):
            if isinstance(value, dict):
                for key, child in value.items():
                    if key in ("$ref", "$dynamicRef", "$recursiveRef") and (not isinstance(child, str) or not child.startswith("#")):
                        raise ValueError("only internal fragment schema references are supported")
                    if key == "$id" and isinstance(child, str) and child and not child.startswith("#"):
                        raise ValueError("schema $id rebasing is unsupported; use a local schema with internal references")
                    inspect(child)
            elif isinstance(value, list):
                for child in value:
                    inspect(child)
        inspect(schema)
        validator = jsonschema.validators.validator_for(schema)
        validator.check_schema(schema)
        report["checks_performed"].append("explicit local JSON Schema for frontmatter")
        for error in validator(schema, format_checker=jsonschema.FormatChecker()).iter_errors(meta if meta is not None else {}):
            field = ".".join(str(part) for part in error.absolute_path) or "$"
            diagnostic(report, field, error.message, "Follow the declared project schema; preserve authority state.", category="schema")
    except Exception as exc:
        diagnostic(report, "$schema", str(exc), "Supply a valid local JSON Schema with internal references only.", category="schema")


def validate_text(text, path, profile="generic", bundle=None, root=None, schema=None):
    report = new_report(path, profile)
    meta, body, present = parse(text, report)
    if profile == "okf":
        if path.name in ("index.md", "log.md"):
            check_reserved(meta, present, body, path, bundle, report)
        elif not present:
            diagnostic(report, "$", "OKF concept has no frontmatter", "Add a YAML mapping with a non-empty type.")
        elif meta is not None:
            check_metadata(meta, body, report)
    check_schema(meta, schema, report)
    check_links(body, path, bundle, root, report)
    return report


def no_symlink(path):
    return not any(part.is_symlink() for part in [path, *path.parents])


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("files", nargs="*", type=Path)
    ap.add_argument("--profile", choices=("generic", "sdd", "okf"))
    ap.add_argument("--bundle", type=Path)
    ap.add_argument("--root", type=Path, help="authorized boundary for files and local links")
    ap.add_argument("--schema", type=Path)
    ap.add_argument("--stdin-path", type=Path, help="logical path for proposed content read from stdin")
    ap.add_argument("--strict", action="store_true", help="make warnings fail the authoring gate")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)
    profile = args.profile or ("okf" if args.bundle else "generic")
    if profile == "okf" and args.bundle is None:
        ap.error("--profile okf requires --bundle")
    if args.bundle and profile != "okf":
        ap.error("--bundle declares OKF scope; check other profiles separately")
    if args.stdin_path and args.files:
        ap.error("--stdin-path cannot be combined with files")
    if not args.files and not args.bundle and not args.stdin_path:
        ap.error("supply files, a bundle, or --stdin-path")
    bundle = args.bundle.absolute() if args.bundle else None
    root = args.root.absolute() if args.root else bundle
    for label, directory in (("bundle", bundle), ("root", root)):
        if directory and (not directory.is_dir() or not no_symlink(directory)):
            ap.error(f"{label} must be an existing directory without symlink ancestors")
    bundle = bundle.resolve() if bundle else None
    root = root.resolve() if root else None
    if bundle and root and not bundle.is_relative_to(root):
        ap.error("bundle must be within --root")
    reports = []
    paths = [args.stdin_path] if args.stdin_path else args.files
    if not paths and bundle:
        paths = []
        def scan_error(exc):
            report = new_report(getattr(exc, "filename", bundle), profile)
            diagnostic(report, "$", str(exc), "Resolve the unreadable scope before claiming the scan passed.", category="input")
            reports.append(report)
        for current, dirs, names in os.walk(bundle, followlinks=False, onerror=scan_error):
            for name in list(dirs):
                candidate = Path(current) / name
                if candidate.is_symlink():
                    report = new_report(candidate, profile)
                    diagnostic(report, "$", "symlink directory not scanned", "Use an explicit, authorized non-symlink scope.")
                    reports.append(report)
                    dirs.remove(name)
            paths.extend(Path(current) / name for name in names if name.endswith(".md"))
            if len(paths) > MAX_FILES:
                ap.error("bundle exceeds 1,000 Markdown files; check smaller explicit file sets")
        paths.sort()
    for path in dict.fromkeys(paths):
        path = path.absolute()
        report = new_report(path, profile)
        try:
            if path.suffix != ".md":
                raise ValueError("only .md files are supported")
            if not no_symlink(path):
                raise ValueError("symlink paths are not read")
            path = path.resolve()
            if root and not path.is_relative_to(root):
                raise ValueError("file is outside the authorized root")
            if bundle and not path.is_relative_to(bundle):
                raise ValueError("OKF file is outside the declared bundle")
            if args.stdin_path:
                data = sys.stdin.buffer.read(MAX_BYTES + 1)
            else:
                with path.open("rb") as stream:
                    data = stream.read(MAX_BYTES + 1)
            if len(data) > MAX_BYTES:
                raise ValueError("file exceeds 2 MiB")
            report = validate_text(data.decode("utf-8"), path, profile, bundle, root, args.schema)
        except RuntimeError as exc:
            print(str(exc), file=sys.stderr)
            return 2
        except (OSError, UnicodeError, ValueError, RecursionError) as exc:
            diagnostic(report, "$", str(exc), "Check the path, scope, file encoding, or size.", category="input")
        reports.append(report)
    if not paths:
        report = new_report(bundle, profile)
        diagnostic(report, "$", "no Markdown files checked", "Select a populated bundle or explicit files.", "warning", "scope")
        reports.append(report)
    diagnostics = [item for report in reports for item in report["diagnostics"]]
    passed = not any(item["severity"] == "error" or args.strict for item in diagnostics)
    result = {"passed": passed, "scope": "requested structural checks only", "files_checked": len(paths), "reports": reports}
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        for report in reports:
            print(f'{report["file"]} [{report["profile"]}]')
            for item in report["diagnostics"]:
                print(f'  {item["severity"]}: {item["field"]}: {item["reason"]} Fix: {item["suggested_fix"]}')
            for skipped in report["checks_skipped"]:
                print(f"  not checked: {skipped}")
        print(f'{"PASS" if passed else "FAIL"}: requested structural checks only')
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
