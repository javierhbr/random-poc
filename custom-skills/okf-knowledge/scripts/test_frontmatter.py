#!/usr/bin/env python3
"""Meaningful parser and CLI regressions; all fixtures live in a temporary tree."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import check_frontmatter as checker


class FrontmatterTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name).resolve()
        self.bundle = self.root / "knowledge"
        self.bundle.mkdir()

    def tearDown(self):
        self.temp.cleanup()

    def check(self, content, name="topic.md", profile="okf", schema=None):
        return checker.validate_text(content, self.bundle / name, profile, self.bundle, self.root, schema)

    def errors(self, report):
        return [x for x in report["diagnostics"] if x["severity"] == "error"]

    def reasons(self, report):
        return " ".join(x["reason"] for x in report["diagnostics"])

    def cli(self, *args, stdin=None):
        return subprocess.run([sys.executable, "-B", str(Path(checker.__file__)), *map(str, args), "--json"],
                              input=stdin, capture_output=True, text=True)

    def test_generic_without_frontmatter(self):
        report = self.check("# Plain document\n", profile="generic")
        self.assertFalse(self.errors(report))
        self.assertTrue(any("schema not configured" in x for x in report["checks_skipped"]))

    def test_sdd_keeps_accepted_status(self):
        report = self.check("---\nstatus: accepted\ncustom: [a, b]\n---\n", profile="sdd")
        self.assertEqual(report["diagnostics"], [])

    def test_type_alone_does_not_trigger_okf(self):
        report = self.check("---\ntype: Proposal\nstatus: proposed\n---\n", profile="generic")
        self.assertEqual(report["profile"], "generic")
        self.assertEqual(report["diagnostics"], [])

    def test_minimal_unknown_type_and_extensions(self):
        report = self.check("---\ntype: FutureType\nextension: {x: true}\n---\n")
        self.assertEqual(report["diagnostics"], [])

    def test_missing_or_nonstring_type(self):
        for body in ("# topic", "---\n{}\n---", "---\ntype: 7\n---", "---\ntype: ''\n---"):
            with self.subTest(body=body):
                self.assertTrue(self.errors(self.check(body)))

    def test_duplicate_key_and_line(self):
        report = self.check("---\ntype: Explanation\ntype: Other\n---")
        self.assertIn("duplicate key", self.reasons(report))
        self.assertEqual(report["diagnostics"][0]["line"], 3)

    def test_nested_duplicate(self):
        report = self.check("---\ntype: Explanation\nextra: {a: 1, a: 2}\n---")
        self.assertIn("duplicate key", self.reasons(report))

    def test_delimiter_failures(self):
        for body in ("---\ntitle: x", "---oops\nx", " ---\nx\n---", "---\ntitle: x\n..."):
            with self.subTest(body=body):
                self.assertTrue(self.errors(self.check(body, profile="generic")))

    def test_mapping_root(self):
        for body in ("[]", "null", "plain", ""):
            self.assertIn("mapping", self.reasons(self.check("---\n" + body + "\n---")))

    def test_unsafe_yaml(self):
        report = self.check("---\nx: !!python/object/apply:os.system ['echo unsafe']\n---", profile="generic")
        self.assertTrue(self.errors(report))

    def test_bom_crlf(self):
        self.assertFalse(self.errors(self.check("\ufeff---\r\ntype: Explanation\r\n---\r\n# Body\r\n")))

    def test_timestamps(self):
        for stamp in ("2026-02-30T12:00:00Z", "2026-10-21", "2026-10-21T12:00:00", "2026-10-21T25:00:00Z"):
            report = self.check(f"---\ntype: Explanation\ngenerated: {{by: process:test, at: '{stamp}'}}\n---")
            self.assertIn("datetime", self.reasons(report))
        self.assertEqual(self.check("---\ntype: Explanation\ngenerated: {by: process:test, at: 2026-10-21T12:00:00-05:00}\n---")["diagnostics"], [])

    def test_missing_verification_timestamp(self):
        report = self.check("---\ntype: Explanation\nverified: {by: human:tester}\n---")
        self.assertEqual(report["diagnostics"][0]["field"], "verified[0].at")

    def test_single_verifier_mapping(self):
        report = self.check("---\ntype: Explanation\nverified: {by: human:tester, at: 2026-10-21T12:00:00Z}\n---")
        self.assertEqual(report["diagnostics"], [])

    def test_root_and_nested_indexes(self):
        text = '---\nokf_version: "0.2"\n---\n# Map\n'
        self.assertFalse(self.errors(self.check(text, "index.md")))
        self.assertTrue(self.errors(self.check(text, "nested/index.md")))
        self.assertTrue(self.errors(self.check("---\nupkeep: true\n---", "index.md")))

    def test_index_bad_root_no_crash(self):
        self.assertTrue(self.errors(self.check("---\n[one, two]\n---", "index.md")))

    def test_log_dates(self):
        for text in ("## 2026-02-30\n", "## 2026-10-21: update\n",
                     "## 2026-10-20\n## 2026-10-21\n", "---\ntype: Log\n---"):
            self.assertTrue(self.errors(self.check(text, "log.md")))
        self.assertFalse(self.errors(self.check("## 2026-10-21\n* Added a page.\n## 2026-10-20\n", "log.md")))

    def test_source_citations_outside_code(self):
        text = "---\ntype: Explanation\nsources:\n  - {id: actual, resource: 'all queries in project X'}\n---\n"
        self.assertEqual(self.check(text + "Claim.[^actual]\n")["diagnostics"], [])
        self.assertIn("no matching source ID", self.reasons(self.check(text + "Claim.[^missing]")))
        code = chr(96) * 3 + "\n[^ignored]\n" + chr(96) * 3 + "\n" + chr(96) + "[^inline]" + chr(96)
        self.assertEqual(self.check(text + code)["diagnostics"], [])

    def test_duplicate_source_ids(self):
        report = self.check("---\ntype: X\nsources: [{id: a, resource: one}, {id: a, resource: two}]\n---")
        self.assertIn("duplicate source ID", self.reasons(report))

    def test_optional_family_shape(self):
        report = self.check("---\ntype: X\nstatus: [draft]\nsources: 4\nverified: false\ngenerated: []\n---")
        self.assertEqual(len(report["diagnostics"]), 4)
        self.assertFalse(self.errors(report))

    def test_usage_window_order(self):
        report = self.check("---\ntype: X\nusage_window: {from: 2026-10-22T00:00:00Z, to: 2026-10-21T00:00:00Z}\n---")
        self.assertIn("starts after", self.reasons(report))

    def test_recursive_alias(self):
        report = self.check("---\ntype: X\nextra: &a {self: *a}\n---")
        self.assertIn("recursive", self.reasons(report))

    def test_regular_alias(self):
        report = self.check("---\ntype: X\na: &a [one, two]\nb: *a\n---")
        self.assertEqual(report["diagnostics"], [])

    def test_link_boundaries(self):
        report = self.check("---\ntype: X\n---\n[missing](missing.md)\n[out](../../outside.md)\n[web](https://example.com/a)\n")
        self.assertIn("target missing", self.reasons(report))
        self.assertTrue(any("out-of-scope" in x for x in report["checks_skipped"]))

    def test_schema_requires_existing_contract(self):
        schema = self.root / "schema.json"
        schema.write_text(json.dumps({"type": "object", "required": ["status"], "properties": {"status": {"const": "accepted"}}}))
        self.assertFalse(self.errors(self.check("---\nstatus: accepted\n---", profile="sdd", schema=schema)))
        self.assertTrue(self.errors(self.check("# Plain", profile="sdd", schema=schema)))

    def test_schema_internal_reference(self):
        schema = self.root / "schema.json"
        schema.write_text(json.dumps({"type": "object", "properties": {"status": {"$ref": "#/$defs/state"}},
                                     "$defs": {"state": {"const": "accepted"}}}))
        self.assertFalse(self.errors(self.check("---\nstatus: accepted\n---", profile="sdd", schema=schema)))

    def test_external_schema_reference_rejected(self):
        schema = self.root / "schema.json"
        schema.write_text('{"$ref": "https://invalid.example/schema"}')
        self.assertIn("internal fragment", self.reasons(self.check("# Plain", profile="sdd", schema=schema)))

    def test_cli_changed_set_preserves_bytes(self):
        files = [self.bundle / "one.md", self.bundle / "two.md"]
        content = b"---\n# keep comment\ntype: Explanation\ncustom: 'keep quoting'\n---\nBody.\n"
        for path in files:
            path.write_bytes(content)
        result = self.cli(*files, "--bundle", self.bundle, "--strict")
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertEqual(json.loads(result.stdout)["files_checked"], 2)
        for path in files:
            self.assertEqual(path.read_bytes(), content)

    def test_cli_stdin_does_not_write(self):
        target = self.bundle / "new.md"
        result = self.cli("--stdin-path", target, "--bundle", self.bundle, stdin="---\ntype: X\n---")
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertFalse(target.exists())

    def test_cli_strict_warnings(self):
        target = self.bundle / "new.md"
        content = "---\ntype: X\nverified: {by: human:x}\n---"
        normal = self.cli("--stdin-path", target, "--bundle", self.bundle, stdin=content)
        strict = self.cli("--stdin-path", target, "--bundle", self.bundle, "--strict", stdin=content)
        self.assertEqual(normal.returncode, 0)
        self.assertEqual(strict.returncode, 1)

    def test_cli_rejects_symlinks(self):
        outside = self.root / "outside.md"
        outside.write_text("---\ntype: X\n---")
        link = self.bundle / "linked.md"
        link.symlink_to(outside)
        result = self.cli("--bundle", self.bundle)
        self.assertEqual(result.returncode, 1)
        self.assertIn("symlink", result.stdout)

    def test_cli_wrong_scope(self):
        outside = self.root / "outside.md"
        outside.write_text("---\ntype: X\n---")
        result = self.cli(outside, "--bundle", self.bundle)
        self.assertEqual(result.returncode, 1)
        self.assertIn("outside", result.stdout)

    def test_cli_invalid_utf8_continues(self):
        (self.bundle / "bad.md").write_bytes(b"\xff")
        (self.bundle / "good.md").write_text("---\ntype: X\n---")
        result = self.cli("--bundle", self.bundle)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(json.loads(result.stdout)["files_checked"], 2)

    def test_cli_invalid_invocation(self):
        result = self.cli("--profile", "okf", self.bundle / "a.md")
        self.assertEqual(result.returncode, 2)

    def test_cli_empty_bundle_is_explicit(self):
        result = self.cli("--bundle", self.bundle, "--strict")
        self.assertEqual(result.returncode, 1)
        self.assertIn("no Markdown files checked", result.stdout)


if __name__ == "__main__":
    unittest.main(verbosity=2)
