#!/usr/bin/env python3
"""Read-only disk report for development leftovers in your home folder.

Measures sizes only (du / docker system df): it never opens file contents and
never deletes anything. Each run:
  1. reads ~/disk-report/sizes.csv (previous runs) to flag what grew,
  2. scans known tool caches + project build folders,
  3. appends this run's sizes to sizes.csv,
  4. writes ~/disk-report/report.html (treemap + cleanup-script builder).
"""
import csv
import datetime
import json
import os
import shlex
import shutil
import subprocess
import sys
from pathlib import Path

HOME = Path.home()
OUT = HOME / "disk-report"
CSV_PATH = OUT / "sizes.csv"
HTML_PATH = OUT / "report.html"
MIN_BYTES = 50 * 1024**2      # ignore anything smaller
GREW_BYTES = 10 * 1024**2     # growth below this is noise
MAX_DEPTH = 8                 # project walk depth below each root
REVIEW_ALWAYS = {"sessions", "models", "docker"}

# Never walked or measured: iCloud, Photos, external drives (not under ~),
# Trash, and folders macOS guards with a permission prompt (TCC).
# ~/Library is only touched at the explicit paths in TARGETS below.
SKIPPED = ["Desktop", "Documents", "Downloads", "Pictures", "Movies", "Music",
           "Public", "Applications", "Library", ".Trash"]

RM = "rm -rf {p}"
# (path under ~, category, group, clean command, what happens if deleted)
TARGETS = [
    (".npm/_cacache", "package cache", "safe", "npm cache clean --force",
     "npm re-downloads packages on the next install."),
    ("Library/pnpm/store", "package cache", "safe", "pnpm store prune",
     "Drops packages no project references; pnpm re-downloads them when needed."),
    (".local/share/pnpm/store", "package cache", "safe", "pnpm store prune",
     "Drops packages no project references; pnpm re-downloads them when needed."),
    ("Library/Caches/Yarn", "package cache", "safe", "yarn cache clean",
     "Yarn re-downloads packages on the next install."),
    (".bun/install/cache", "package cache", "safe", "bun pm cache rm",
     "Bun re-downloads packages on the next install."),
    ("Library/Caches/pip", "package cache", "safe", "pip3 cache purge",
     "pip re-downloads wheels on the next install."),
    (".cache/uv", "package cache", "safe", "uv cache clean",
     "uv re-downloads packages; existing venvs keep working."),
    (".conda/pkgs", "package cache", "safe", "conda clean --all -y",
     "Removes unused package tarballs; existing envs keep working."),
    ("Library/Caches/Homebrew", "package cache", "safe", "brew cleanup --prune=all",
     "Removes downloads and old versions; installed formulae keep working."),
    ("go/pkg/mod", "package cache", "safe", "go clean -modcache",
     "Go re-downloads modules on the next build."),
    ("Library/Caches/go-build", "build cache", "safe", "go clean -cache",
     "Next Go build recompiles from scratch."),
    (".cargo/registry", "package cache", "safe", RM + "  # cargo has no stable registry-clean command",
     "Cargo re-downloads crates on the next build."),
    (".gradle/caches", "build cache", "safe", RM + "  # gradle has no cache-clean command",
     "Gradle re-downloads dependencies; the next build is slow."),
    (".m2/repository", "package cache", "review", RM + "  # maven has no global clean command",
     "Maven re-downloads everything; artifacts you only built locally (mvn install) are lost."),
    ("Library/Caches/CocoaPods", "package cache", "safe", "pod cache clean --all",
     "CocoaPods re-downloads pods on the next pod install."),
    (".cache/pre-commit", "package cache", "safe", "pre-commit clean",
     "pre-commit re-installs hook environments on the next commit."),
    ("Library/Caches/ms-playwright", "browsers", "safe", "npx playwright uninstall --all",
     "Run `npx playwright install` again before running Playwright tests."),
    (".cache/puppeteer", "browsers", "safe", RM + "  # puppeteer has no clean command",
     "Puppeteer re-downloads Chrome on the next install."),
    ("Library/Developer/Xcode/DerivedData", "build cache", "safe", RM + "  # same as Xcode's Clean Build Folder, for all projects",
     "Xcode rebuilds indexes and build products; the next build is slow."),
    ("Library/Developer/Xcode/iOS DeviceSupport", "build cache", "safe", RM + "  # Xcode has no CLI for this",
     "Xcode re-copies debug symbols the next time each device is connected."),
    ("Library/Developer/CoreSimulator/Caches", "build cache", "safe", RM + "  # simctl has no cache-clean command",
     "Simulator caches are rebuilt on the next simulator boot."),
    ("Library/Developer/Xcode/Archives", "build output", "review", RM + "  # Xcode has no CLI for this",
     "Archived builds and their dSYMs are gone; crash reports for those releases can't be symbolicated."),
    ("Library/Developer/CoreSimulator/Devices", "simulators", "review", "xcrun simctl delete unavailable",
     "Deletes only simulators whose runtime is no longer installed; may free less than the size shown."),
    (".android/avd", "emulators", "review", RM + "  # or per device: avdmanager delete avd -n <name>",
     "All Android emulators and their data are deleted."),
    (".ollama/models", "models", "review", "ollama list | awk 'NR>1 {{print $1}}' | xargs -n1 ollama rm",
     "Every Ollama model is removed; `ollama pull` re-downloads them (often several GB each)."),
    (".cache/huggingface", "models", "review", "huggingface-cli delete-cache  # interactive picker",
     "Selected models/datasets must be re-downloaded the next time code loads them."),
    (".lmstudio/models", "models", "review", RM + "  # LM Studio has no CLI delete",
     "All LM Studio models must be re-downloaded."),
    (".claude/projects", "sessions", "review", RM + "  # Claude Code has no clean command (see cleanupPeriodDays)",
     "Claude Code transcripts are gone: `claude --resume` and history stop working for every project."),
    (".codex/sessions", "sessions", "review", RM + "  # codex has no clean command",
     "Codex session history is gone; `codex resume` can't find old sessions."),
    (".gemini/tmp", "sessions", "review", RM + "  # gemini cli has no clean command",
     "Gemini CLI chat checkpoints are gone."),
]


def is_cargo(d):
    return (d.parent / "Cargo.toml").exists()


def is_venv(d):
    return (d / "pyvenv.cfg").exists()


def is_dart(d):
    return (d.parent / "pubspec.yaml").exists()


ALWAYS = lambda d: True
# folder name -> (check, category, group, clean command, what happens if deleted)
ARTIFACTS = {
    "node_modules": (ALWAYS, "dependencies", "safe", RM + "  # npm has no command to remove node_modules",
                     "Run npm/pnpm/yarn install before using the project again."),
    ".next": (ALWAYS, "build output", "safe", RM + "  # next has no clean command",
              "Next.js rebuilds it on the next dev/build."),
    ".nuxt": (ALWAYS, "build output", "safe", "( cd {parent} && npx nuxi cleanup )",
              "Nuxt regenerates it on the next dev/build."),
    ".turbo": (ALWAYS, "build cache", "safe", RM + "  # turbo has no clean command",
               "Turborepo loses its local cache; the next build is a full build."),
    "target": (is_cargo, "build output", "safe", "cargo clean --manifest-path {manifest}",
               "Next cargo build recompiles everything."),
    ".dart_tool": (is_dart, "build output", "safe", "( cd {parent} && flutter clean )",
                   "Run flutter pub get; the next build is slow."),
    ".venv": (is_venv, "virtualenv", "review", RM + "  # venvs have no clean command",
              "Recreate the venv and reinstall packages; anything installed by hand is lost."),
    "venv": (is_venv, "virtualenv", "review", RM + "  # venvs have no clean command",
             "Recreate the venv and reinstall packages; anything installed by hand is lost."),
}


# taskpolicy -b: macOS background QoS, so du yields CPU and disk I/O to everything else.
LOW_PRIORITY = ["taskpolicy", "-b"] if shutil.which("taskpolicy") else []


def progress(msg):
    """One self-overwriting status line on the terminal; silent when piped."""
    if sys.stderr.isatty():
        width = shutil.get_terminal_size().columns - 1
        sys.stderr.write("\r\033[K" + msg[:width])
        sys.stderr.flush()


def du_bytes(path):
    r = subprocess.run(LOW_PRIORITY + ["du", "-sk", str(path)], capture_output=True, text=True)
    try:
        return int(r.stdout.split()[0]) * 1024
    except (IndexError, ValueError):
        return 0


def tilde(path):
    return "~/" + str(Path(path).relative_to(HOME))


def make_item(path, category, group, cmd, effect, size, **fmt):
    if category in REVIEW_ALWAYS:
        group = "review"
    return {"path": tilde(path), "category": category, "group": group, "bytes": size,
            "cmd": cmd.format(p=shlex.quote(str(path)), **fmt), "effect": effect}


def scan_targets():
    items = []
    for n, (rel, cat, group, cmd, effect) in enumerate(TARGETS, 1):
        p = HOME / rel
        progress(f"[1/3] tool caches {n}/{len(TARGETS)}  ~/{rel}")
        if p.is_dir() and not p.is_symlink():
            items.append(make_item(p, cat, group, cmd, effect, du_bytes(p)))
    return items


def scan_projects():
    known = {HOME / t[0] for t in TARGETS}
    roots = [HOME / e.name for e in os.scandir(HOME)
             if e.is_dir(follow_symlinks=False) and not e.name.startswith(".")
             and e.name not in SKIPPED]
    items = []
    walked = 0
    for root in roots:
        base = len(root.parts)
        for dirpath, dirnames, _ in os.walk(root):
            here = Path(dirpath)
            walked += 1
            if walked % 200 == 0:
                progress(f"[2/3] projects: {walked} folders, {len(items)} found  {tilde(here)}")
            keep = []
            for name in dirnames:
                d = here / name
                if d.is_symlink() or d in known:
                    continue
                spec = ARTIFACTS.get(name)
                if spec and spec[0](d):
                    check, cat, group, cmd, effect = spec
                    progress(f"[2/3] projects: {walked} folders, {len(items)} found  measuring {tilde(d)}")
                    items.append(make_item(d, cat, group, cmd, effect, du_bytes(d),
                                           parent=shlex.quote(str(here)),
                                           manifest=shlex.quote(str(here / "Cargo.toml"))))
                elif not name.startswith(".") and len(d.parts) - base < MAX_DEPTH:
                    keep.append(name)
            dirnames[:] = keep
    return items


DOCKER = {
    "Images": ("docker image prune -a -f",
               "Removes images no container uses; they must be pulled or rebuilt again."),
    "Containers": ("docker container prune -f",
                   "Removes stopped containers and anything written inside them."),
    "Local Volumes": ("docker volume prune -a -f",
                      "Deletes volumes not attached to a container; data in them (e.g. databases) is gone for good."),
    "Build Cache": ("docker builder prune -a -f",
                    "The next docker build starts without cache."),
}
UNITS = {"B": 1, "kB": 1e3, "KB": 1e3, "MB": 1e6, "GB": 1e9, "TB": 1e12}


def parse_docker_size(s):
    s = s.split()[0]
    for unit in sorted(UNITS, key=len, reverse=True):
        if s.endswith(unit):
            return int(float(s[: -len(unit)]) * UNITS[unit])
    return 0


def scan_docker():
    progress("[3/3] docker system df")
    try:
        r = subprocess.run(["docker", "system", "df", "--format", "{{json .}}"],
                           capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.TimeoutExpired):
        return []
    items = []
    for line in r.stdout.splitlines() if r.returncode == 0 else []:
        row = json.loads(line)
        if row.get("Type") in DOCKER:
            cmd, effect = DOCKER[row["Type"]]
            items.append({"path": "docker: " + row["Type"].lower() + " (reclaimable)",
                          "category": "docker", "group": "review",
                          "bytes": parse_docker_size(row.get("Reclaimable", "0B")),
                          "cmd": cmd, "effect": effect})
    return items


def read_history():
    """Latest previous size per path, plus the date it was recorded."""
    prev = {}
    if CSV_PATH.exists():
        with CSV_PATH.open(newline="") as f:
            for row in csv.DictReader(f):
                prev[row["path"]] = (int(row["bytes"]), row["date"])
    return prev


def append_history(items, now):
    new = not CSV_PATH.exists()
    with CSV_PATH.open("a", newline="") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["date", "path", "bytes", "group", "category"])
        for it in items:
            w.writerow([now, it["path"], it["bytes"], it["group"], it["category"]])


def fmt(n):
    for unit in ["B", "KB", "MB", "GB"]:
        if abs(n) < 1024:
            return f"{n:.0f} {unit}" if unit == "B" else f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def main():
    os.nice(15)  # lowest-but-one CPU priority; du children inherit it
    OUT.mkdir(exist_ok=True)
    prev = read_history()  # read before scanning, as requested
    now = datetime.datetime.now().isoformat(timespec="seconds")

    items = [i for i in scan_targets() + scan_projects() + scan_docker() if i["bytes"] >= MIN_BYTES]
    progress("")
    items.sort(key=lambda i: i["bytes"], reverse=True)
    for it in items:
        if it["path"] in prev:
            old, when = prev[it["path"]]
            it["prev"], it["prevDate"] = old, when
            it["grew"] = it["bytes"] - old >= GREW_BYTES
        else:
            it["prev"], it["prevDate"], it["grew"] = None, None, False

    append_history(items, now)
    data = {"generated": now, "skipped": SKIPPED, "hadHistory": bool(prev), "items": items}
    html = TEMPLATE.replace("__DATA__", json.dumps(data).replace("</", "<\\/"))
    HTML_PATH.write_text(html)

    for g in ("safe", "review"):
        group = [i for i in items if i["group"] == g]
        print(f"{g}: {len(group)} items, {fmt(sum(i['bytes'] for i in group))}")
    for it in items:
        if it["grew"]:
            print(f"  grew: {it['path']}  {fmt(it['prev'])} -> {fmt(it['bytes'])}")
    print(f"report: {HTML_PATH}\nhistory: {CSV_PATH}")


TEMPLATE = r"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dev disk report</title>
<style>
  :root { --bg:#f6f5f2; --fg:#1d1d1b; --muted:#6b6a65; --line:#dcd9d2;
          --safe:#4f8a6b; --review:#c98a2b; --grew:#c0392b; --card:#fff; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#161614; --fg:#ecebe6; --muted:#9a988f; --line:#33322e; --card:#1f1f1c; } }
  * { box-sizing: border-box; }
  body { margin:0; font:14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
         background:var(--bg); color:var(--fg); }
  main { max-width:1200px; margin:0 auto; padding:28px 20px 60px; }
  h1 { font-size:22px; margin:0 0 4px; } h2 { font-size:16px; margin:28px 0 8px; }
  .muted { color:var(--muted); }
  .totals { display:flex; gap:24px; margin:14px 0; flex-wrap:wrap; }
  .totals b { font-size:20px; display:block; }
  .dot { display:inline-block; width:10px; height:10px; border-radius:2px; margin-right:6px; }
  #map { position:relative; height:480px; border-radius:8px; overflow:hidden; background:var(--line); }
  .grp { position:absolute; }
  .grp > .hd { position:absolute; left:0; right:0; top:0; height:22px; padding:2px 8px;
               font-weight:600; font-size:12px; color:#fff; }
  .tile { position:absolute; border:1px solid var(--bg); color:#fff; padding:4px 6px;
          overflow:hidden; cursor:pointer; font-size:11px; line-height:1.3; }
  .tile:hover { filter:brightness(1.1); }
  .tile.on { box-shadow: inset 0 0 0 3px var(--fg); }
  .tile .s { opacity:.85; }
  table { width:100%; border-collapse:collapse; background:var(--card); border-radius:8px; overflow:hidden; }
  th, td { text-align:left; padding:7px 10px; border-bottom:1px solid var(--line); vertical-align:top; }
  th { font-size:12px; color:var(--muted); font-weight:500; }
  td.size { white-space:nowrap; font-variant-numeric:tabular-nums; }
  td.path { font-family: ui-monospace, Menlo, monospace; font-size:12px; word-break:break-all; min-width:260px; }
  code { font-size:11px; color:var(--muted); }
  .grew { color:var(--grew); font-weight:600; white-space:nowrap; }
  .new { color:var(--muted); font-size:12px; }
  textarea { width:100%; height:260px; font:12px ui-monospace, Menlo, monospace;
             background:var(--card); color:var(--fg); border:1px solid var(--line); border-radius:8px; padding:10px; }
  button { font:inherit; padding:6px 14px; border-radius:6px; border:1px solid var(--line);
           background:var(--card); color:var(--fg); cursor:pointer; margin-right:8px; }
  .note { font-size:12px; color:var(--muted); }
</style></head><body><main>
<h1>Dev disk report</h1>
<div class="muted" id="meta"></div>
<div class="totals" id="totals"></div>
<div id="map"></div>
<p class="note">Tile area = size. Click a tile or tick a row to add it to the cleanup script. Nothing is deleted by this page.</p>
<h2><span class="dot" style="background:var(--safe)"></span>Safe to remove</h2>
<table id="t-safe"></table>
<h2><span class="dot" style="background:var(--review)"></span>Let me review first</h2>
<table id="t-review"></table>
<h2>Cleanup script</h2>
<p class="note">Built from the ticked items. Uses each tool's own clean command; where a tool has none, it falls back to <code>rm -rf</code> on that one path, with a comment saying so. It asks for confirmation before running.</p>
<div style="margin-bottom:8px"><button id="copy">Copy</button><button id="dl">Download cleanup.sh</button><span class="note" id="sel"></span></div>
<textarea id="script" readonly></textarea>
<p class="note" id="skipped"></p>
</main>
<script>
const DATA = __DATA__;
const items = DATA.items.map((d, i) => ({...d, id: i}));
const picked = new Set();
const COLOR = {safe: getVar('--safe'), review: getVar('--review')};
const LABEL = {safe: 'Safe to remove', review: 'Let me review first'};
function getVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function fmt(n) { const u = ['B','KB','MB','GB','TB']; let i = 0;
  while (Math.abs(n) >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return (i ? n.toFixed(1) : n.toFixed(0)) + ' ' + u[i]; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
const sum = a => a.reduce((s, d) => s + d.bytes, 0);
const groups = ['safe', 'review'].map(g => ({g, items: items.filter(d => d.group === g)}))
                                .filter(x => x.items.length);

document.getElementById('meta').textContent =
  `Scanned ${DATA.generated} · ${items.length} items ≥ 50 MB · ` +
  (DATA.hadHistory ? `${items.filter(d => d.grew).length} grew since last run` : 'first run, no history yet');
document.getElementById('totals').innerHTML = groups.map(x =>
  `<div><span class="dot" style="background:${COLOR[x.g]}"></span>${LABEL[x.g]}<b>${fmt(sum(x.items))}</b></div>`).join('');
document.getElementById('skipped').textContent =
  'Not scanned: ~/' + DATA.skipped.join(', ~/') + ' (iCloud, Photos and permission-protected folders), except the explicit ~/Library tool caches listed above. External drives are outside ~.';

// Squarified treemap: returns rects for values laid out inside (x, y, w, h).
function squarify(list, x, y, w, h) {
  const total = list.reduce((s, d) => s + d.v, 0), out = [];
  if (!total) return out;
  let rest = list.map(d => ({d, a: d.v * w * h / total}));
  while (rest.length) {
    const side = Math.min(w, h);
    const worst = r => { const s = r.reduce((a, e) => a + e.a, 0);
      const mx = Math.max(...r.map(e => e.a)), mn = Math.min(...r.map(e => e.a));
      return Math.max(side * side * mx / (s * s), s * s / (side * side * mn)); };
    let row = [rest[0]], i = 1;
    while (i < rest.length && worst([...row, rest[i]]) <= worst(row)) row.push(rest[i++]);
    rest = rest.slice(i);
    const thick = row.reduce((a, e) => a + e.a, 0) / side;
    let off = 0;
    for (const e of row) {
      const len = e.a / thick;
      out.push(w >= h ? {d: e.d, x, y: y + off, w: thick, h: len} : {d: e.d, x: x + off, y, w: len, h: thick});
      off += len;
    }
    if (w >= h) { x += thick; w -= thick; } else { y += thick; h -= thick; }
  }
  return out;
}

function drawMap() {
  const map = document.getElementById('map');
  const W = map.clientWidth, H = map.clientHeight;
  let html = '';
  for (const g of squarify(groups.map(x => ({...x, v: sum(x.items)})), 0, 0, W, H)) {
    html += `<div class="grp" style="left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px">` +
            `<div class="hd" style="background:${COLOR[g.d.g]}">${LABEL[g.d.g]} · ${fmt(g.d.v)}</div>`;
    for (const t of squarify(g.d.items.map(d => ({...d, v: d.bytes})), 0, 22, g.w, g.h - 22)) {
      const d = t.d, big = t.w > 70 && t.h > 30;
      html += `<div class="tile${picked.has(d.id) ? ' on' : ''}" data-id="${d.id}" title="${esc(d.path)} · ${fmt(d.bytes)}"
        style="left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px;background:${COLOR[d.group]}">` +
        (big ? `${esc(d.path.split('/').slice(-2).join('/'))}${d.grew ? ' ▲' : ''}<div class="s">${fmt(d.bytes)}</div>` : '') + `</div>`;
    }
    html += '</div>';
  }
  map.innerHTML = html;
}

function drawTables() {
  for (const g of ['safe', 'review']) {
    const rows = items.filter(d => d.group === g);
    document.getElementById('t-' + g).innerHTML = rows.length ?
      '<tr><th></th><th>Path</th><th>Size</th><th>Change</th><th>If deleted</th></tr>' + rows.map(d => {
        const change = d.prev == null ? '<span class="new">new</span>'
          : d.grew ? `<span class="grew">▲ +${fmt(d.bytes - d.prev)}</span><div class="new">since ${esc(d.prevDate.slice(0, 10))}</div>`
          : '<span class="new">—</span>';
        return `<tr><td><input type="checkbox" data-id="${d.id}"${picked.has(d.id) ? ' checked' : ''}></td>
          <td class="path">${esc(d.path)}<div class="new">${esc(d.category)}</div></td>
          <td class="size">${fmt(d.bytes)}</td><td>${change}</td>
          <td>${esc(d.effect)}<div><code>${esc(d.cmd)}</code></div></td></tr>`;
      }).join('') : '<tr><td class="muted">Nothing here.</td></tr>';
  }
}

function buildScript() {
  const sel = items.filter(d => picked.has(d.id));
  const total = fmt(sum(sel));
  document.getElementById('sel').textContent = sel.length ? `${sel.length} selected · ${total}` : '';
  if (!sel.length) { document.getElementById('script').value = '# Tick items above to build a cleanup script.'; return; }
  const q = s => "'" + s.replace(/'/g, "'\\''") + "'";
  document.getElementById('script').value = [
    '#!/bin/bash', `# Generated by disk-report (${DATA.generated}). Read it before running.`, 'set -u', '',
    `read -r -p ${q(`Run ${sel.length} cleanup commands (~${total})? [y/N] `)} answer`,
    '[[ "$answer" == [yY] ]] || exit 1', '',
    ...sel.flatMap(d => [`echo ${q(`>> ${d.path} (${fmt(d.bytes)})`)}`, d.cmd, ''])
  ].join('\n');
}

function toggle(id) { picked.has(id) ? picked.delete(id) : picked.add(id); render(); }
function render() { drawMap(); drawTables(); buildScript(); }
document.addEventListener('click', e => { const t = e.target.closest('.tile'); if (t) toggle(+t.dataset.id); });
document.addEventListener('change', e => { if (e.target.matches('input[type=checkbox]')) toggle(+e.target.dataset.id); });
document.getElementById('copy').onclick = () => navigator.clipboard.writeText(document.getElementById('script').value);
document.getElementById('dl').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([document.getElementById('script').value], {type: 'text/x-sh'}));
  a.download = 'cleanup.sh'; a.click();
};
window.addEventListener('resize', drawMap);
render();
</script></body></html>
"""

if __name__ == "__main__":
    main()
