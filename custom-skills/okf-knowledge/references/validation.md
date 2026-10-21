# Frontmatter checking

This skill includes `scripts/check_frontmatter.py`, a read-only checker. Requires Python 3.11+, PyYAML 6.x, and jsonschema 4.x (only needed when a project schema is supplied). Dependencies are listed in `scripts/requirements.txt`; use an existing environment or install through the user's normal dependency workflow. Never report success when dependencies are unavailable.

In the examples, `<skill>` means this skill's directory. Paths are relative to the current working directory.

```sh
# One ordinary document; its own metadata vocabulary is preserved.
python3 <skill>/scripts/check_frontmatter.py proposal.md --json

# Explicit changed SDD files, with a schema already chosen by the project.
python3 <skill>/scripts/check_frontmatter.py docs/prd.md docs/platform.md --profile sdd --schema schemas/spec.json --json

# All Markdown in a declared OKF bundle; repository boundary for link checks.
python3 <skill>/scripts/check_frontmatter.py --bundle docs/knowledge --root . --json

# Only two affected OKF files.
python3 <skill>/scripts/check_frontmatter.py docs/knowledge/index.md docs/knowledge/payment.md --bundle docs/knowledge --root . --strict --json

# Proposed text on stdin; the logical target need not exist yet.
python3 <skill>/scripts/check_frontmatter.py --stdin-path docs/knowledge/payment.md --bundle docs/knowledge --root . --strict --json
```

Pass proposed content using the host's stdin support or a safely prepared temporary file; never interpolate untrusted document text into shell code. Before a multi-file update, a new link may target another pending file: account for it during preflight and recheck all saved targets before completion.

## Profile rules

- Default without `--bundle`: generic. Existing optional YAML is checked; no frontmatter is also valid. No artifact schema is assumed.
- `--profile sdd`: same syntax behavior plus an explicit `--schema`, when provided. `status: accepted` and source-specific fields are preserved.
- `--bundle`: establishes OKF scope and defaults to OKF profile. Every non-reserved Markdown file in that scope is a concept. Single files and explicit changed-file lists are supported; omitting files scans the bundle.
- `--profile okf` requires `--bundle` to identify root versus nested reserved files. Scope is never inferred from a `type` key.
- `--schema`: explicit local JSON Schema for frontmatter. If frontmatter is absent, the schema sees an empty object, so its required fields can enforce presence. Only internal fragment references are supported; remote references are rejected without network access. Schema validation never validates the Markdown body.

Group mixed changed sets by profile and schema. Do not supply canonical source docs to the OKF profile.

## Diagnostics and limits

JSON reports `passed`, profiles, performed/skipped checks, and diagnostics containing file, line when known, field, severity, category, reason, and suggested fix. Exit 0 means the requested checks passed; 1 means errors (or warnings under `--strict`); 2 means invalid invocation or unavailable dependencies. A report never claims full OKF conformance or factual truth.

Errors: malformed/unterminated delimiters, invalid YAML, duplicate keys, non-mapping root, missing concept type, reserved-file structure, invalid supplied schema, or I/O/scope failures. Optional OKF family shape/timestamp problems and broken citations/links are warnings; `--strict` makes these fail the authoring gate without redefining OKF conformance. Missing optional families and unknown type/extension keys are accepted.

The checker targets the inspected OKF v0.2 profile. Other declared versions get an explicit warning and best-effort checks, not an implicit migration. It checks real calendar timestamps with explicit offsets (ordinary RFC 3339 form; leap-second timestamps are not supported). It preserves date-like YAML scalars as strings; other scalar resolution follows PyYAML SafeLoader.

Checks include source ID uniqueness, footnote-to-source IDs outside code, common inline local Markdown links, source metadata shapes, and reserved date ordering. Missing external references and complex Markdown constructs require agent review. It does not resolve Markdown anchors, reference-style links, every inline syntax variant, source population descriptors, external URLs, or attestations. Factual correctness and actual human review always require evidence.

No links are opened over the network. For local link existence checks, supply `--root` as the authorized repository; otherwise the bundle is the boundary. External paths are reported as skipped. Source resources are checked structurally, not blindly treated as local paths. Symlink inputs and symlink scan entries are rejected. Bundle scans are bounded to 1,000 Markdown files and files to 2 MiB; split larger scopes explicitly.

The helper never formats, repairs, migrates, or writes. The agent can fix deterministic defects in authorized content using minimal textual edits, preserving comments, key order, quoting, unknown fields, and prose. Never dump all YAML back through a serializer just to normalize it.

## Reuse and provenance

The design follows the local proposal `2026-10-21-unified-okf-experience-proposal.md`. It reuses the scoped concept/reserved-file checks and code-aware citation pattern from Marco Boffo's MIT-licensed `okf-skills/skills/validate/scripts/okf_validate.py` at commit `49f8fb4987989b7a443ce278c6aa68ba0493b51f2`; its license is retained in `licenses/okf-skills-MIT.txt`. The validator is redesigned for strict YAML diagnostics, individual files, proposed text, and separate SDD profiles.

Behavioral patterns from `open-knowledge-skills` at `2d9fbc89d4e8f6953894c8f71e9edc109d2228d1` inform coverage-before-capture, source-based refresh, incremental persistence, and conflict reporting. No external runtime is bundled or required. The skill is self-contained and does not import either original repository at runtime.

YAML merge keys, non-string metadata keys, recursive aliases, and alias expansion beyond 20,000 nodes are unsupported and explicitly diagnosed. Ordinary non-recursive aliases are accepted. These are checker limits, not claims that such YAML is universally invalid.
