# 📥 Installing squirrel

Step-by-step guide to install and configure the plugin across different agents.

---

## 📋 Prerequisites

1. **Python 3.9+** (for the package protocol script)
   ```bash
   python3 --version  # must be 3.9 or later
   ```

2. **An Obsidian vault** (or any Markdown folder) with the ADHD system structure. If you do not have one, unzip `vault-tdah-obsidian.zip` first.

3. **A compatible coding agent**: Claude Code, Codex CLI, Cursor, GitHub Copilot, or equivalent.

---

## 🚀 Installing in Claude Code

### Step 1: Copy the plugin

```bash
# Clone or copy the plugin directory
cp -r squirrel ~/.claude/plugins/

# Or symlink it if you want it to stay updated from the repo
ln -s /path/to/repo/squirrel ~/.claude/plugins/squirrel
```

### Step 2: Restart Claude Code

```bash
# Close active sessions
# Open a new session
claude
```

The slash commands `/sq-*` should appear when you type `/`.

### Step 3: Verify installation

Inside Claude Code:

```
/plugin list
```

`squirrel v0.5.0` should appear.

### Step 4: Configure

```
/sq-init
```

It will ask for:
- `vault_path`: absolute path to your vault (example: `/home/user/vault-tdah`)
- `environment_name`: `personal` or `work`
- `default_email`: your email for drafts
- `active_projects`: list of WIP tags (example: `TRABAJO-PROYECTO-A,SIDEPROJECT-FOYER-FAMILY,VISA-FAMILIA`)

This creates `~/.squirrel/config.toml`.

#### Multi-vault schema (v0.6+)

Starting in v0.6, `config.toml` uses an `[[vaults]]` array to support multiple
vaults in the same environment (for example personal + work + client-A). The
default is marked with `default = true` (exactly one):

```toml
machine_environment = "personal"   # before: environment_name
default_email = "you@example.com"

[[vaults]]
name = "personal"
path = "~/vault-tdah"
default = true

[[vaults]]
name = "work"
path = "~/work-vault"
default = false

[projects]
active = ["TRABAJO-PROYECTO-A", "SIDEPROJECT-FOYER-FAMILY"]
```

**Automatic migration (lazy + idempotent)**: if your `config.toml` is still in
the old format (`vault_path = ...` and `environment_name = ...`), squirrel
migrates it to the new schema the first time any command reads it. You will see
a `# Auto-migrated <date>` line at the top of the file — that is the only
observable signal; there is no extra output and no manual command to run.
Running it twice is a no-op.

**Manage vaults from the CLI**: add/list/remove/set default with
`squirrel vaults add NAME PATH`, `squirrel vaults list`,
`squirrel vaults remove NAME`, `squirrel vaults default NAME`. To add a vault
interactively from Claude Code: `/sq-init --add-vault`.

**Target a specific vault from a command**: pass `--vault NAME` to commands
that touch the vault (`squirrel status`, `squirrel deadlines`,
`squirrel recover`, `squirrel dashboard`, and the equivalent `/sq-*`
slash commands). Without the flag, they operate on the default vault.

### Step 5: Test

```
/sq-where-am-i
```

It should show the state of your WIP projects. If you just installed the vault,
it will tell you there is no previous activity.

---

## 🚀 Installing in Codex CLI

Codex handles skills and commands similarly, but with different paths.

### Step 1: Copy skills

```bash
mkdir -p ~/.codex/skills
cp -r squirrel/skills/* ~/.codex/skills/
```

### Step 2: Copy slash commands

```bash
mkdir -p ~/.codex/commands
cp squirrel/commands/*.md ~/.codex/commands/
```

### Step 3: Reference them from AGENTS.md

Add this to the global `~/.codex/AGENTS.md`:

```markdown
# Context Bridge

When the user mentions managing context across sessions or environments, use the
squirrel skills installed at ~/.codex/skills/. The main entry points are:

- /sq-start [PROJECT-TAG] — load project context
- /sq-end — save shutdown notes
- /sq-brief — generate structured status
- /sq-sync-out — export package for another environment
- /sq-sync-in — apply pasted package

Configuration lives at ~/.squirrel/config.toml.
```

### Step 4: Configure

Codex does not have an interactive `/sq-init` command, but you can create the
config manually:

```bash
mkdir -p ~/.squirrel
cat > ~/.squirrel/config.toml << 'EOF'
vault_path = "/home/user/vault-tdah"
environment_name = "personal"
default_email = "your-email@example.com"

[projects]
active = ["TRABAJO-PROYECTO-A", "SIDEPROJECT-FOYER-FAMILY", "VISA-FAMILIA"]

[compliance]
strict = false
allowed_inbound_tags = ["*"]

[encryption]
enabled = false
EOF
```

### Step 5: Test

```bash
codex
> /sq-where-am-i
```

---

## 🚀 Installing for GitHub Copilot

Squirrel integrates with Copilot by placing files on disk. Supported surfaces: VS Code Copilot Chat, JetBrains Copilot, and the Copilot CLI.

### One-command install (user-level — applies to all workspaces)

```bash
cd <squirrel-repo>
./scripts/install-copilot.sh --yes
```

| Component | Destination |
|-----------|-------------|
| Skill agents | `~/.copilot/agents/squirrel-<name>.agent.md` |
| Slash-command prompts | `~/.copilot/prompts/sq-<cmd>.prompt.md` |
| Manifest | `~/.copilot/copilot-instructions.md` (block appended) |
| Hooks | `~/.copilot/hooks/squirrel.json` |

Override the destination with the `COPILOT_HOME` environment variable.

### Workspace-level install (files tracked in Git)

```bash
./scripts/install-copilot.sh --workspace --yes
```

Files land under `.github/` in the current git repository. **Commit them** so teammates pick up the Squirrel integration automatically. The installer prints a reminder.

### Flag reference

| Flag | Effect |
|------|--------|
| `--workspace` | Write to `<repo-root>/.github/` instead of `~/.copilot/` |
| `--link` | Create symlinks (auto-update on `git pull`) |
| `--dry-run` | Preview without writing |
| `--yes` / `-y` | Non-interactive |
| `--no-config` | Skip `~/.squirrel/config.toml` seed |
| `--no-cli` | Skip `squirrel` CLI symlink |
| `--no-reminders` | Skip macOS launchd daemon |
| `--prefix=PATH` | CLI symlink destination (default `~/.local/bin`) |

### After install

1. Restart VS Code (or reload the Copilot extension).
2. Set your vault path: `$EDITOR ~/.squirrel/config.toml`
3. In Copilot Chat: `/sq-where-am-i`

---

## 🚀 Installing in Cursor / VSCode

Cursor uses `.cursor/rules/` to load rules and skills.

### Step 1: Copy skills as rules

```bash
mkdir -p ~/.cursor/rules/squirrel
cp -r squirrel/skills/* ~/.cursor/rules/squirrel/
```

### Step 2: Reference them in Cursor settings

In `Settings → Rules for AI`:

```
Use ~/.cursor/rules/squirrel/ for managing project context, shutdown notes,
and cross-environment transfers. See SKILL.md files in each subdirectory.
```

### Step 3: Commands via VSCode tasks

Cursor does not have native slash commands, but you can create tasks in `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "cb-sync-out",
      "type": "shell",
      "command": "python3 ~/.claude/plugins/squirrel/lib/package_protocol.py generate --vault ${input:vault} --scope ${input:scope}",
      "inputs": [...]
    }
  ]
}
```

---

## 🚀 Standalone installation (no agent)

The Python script works completely on its own:

```bash
# Generate package
python3 squirrel/lib/package_protocol.py generate \
  --vault ~/vault-tdah \
  --scope TRABAJO-PROYECTO-A:research \
  --from-env personal \
  --to-env work \
  --output /tmp/package.md

# Validate
python3 squirrel/lib/package_protocol.py validate --input /tmp/package.md

# Apply
python3 squirrel/lib/package_protocol.py apply \
  --input /tmp/package.md \
  --vault ~/work-vault
```

Useful for automation (cron, scripts) or if you want to use the protocol without an LLM agent.

---

## 🛡️ Manual install from DMG (Gatekeeper blocked)

Use this path when macOS blocks `Install Squirrel` with *"can't be opened because it is from an unidentified developer"*, or when you need to install a dev build that has not been signed yet.

### Why the normal installer fails

macOS attaches a `com.apple.quarantine` flag to every file that arrives via the internet, including all files inside a downloaded DMG. Because `Install Squirrel` is a shell script (not a notarized app bundle), Gatekeeper blocks it before it can run. The installer also runs `codesign --verify --strict --deep` on the two binaries before copying them — this step fails on any unsigned dev build and aborts the install.

---

### Step-by-step manual install

#### 1. Mount the DMG

Double-click the `.dmg` in Finder, or:

```bash
hdiutil attach ~/Downloads/Squirrel.dmg
# macOS prints the mount path — normally /Volumes/Squirrel
DMG=/Volumes/Squirrel   # adjust if different
```

#### 2. Strip the quarantine flag from everything inside the DMG

```bash
xattr -cr "$DMG"
```

This removes `com.apple.quarantine` recursively. Without this step macOS silently kills any binary you copy from the DMG even after `chmod +x`.

#### 3. Copy the binaries

```bash
mkdir -p ~/.local/bin

cp "$DMG/bin/squirrel"         ~/.local/bin/squirrel
cp "$DMG/bin/squirrel-backend" ~/.local/bin/squirrel-backend
chmod +x ~/.local/bin/squirrel ~/.local/bin/squirrel-backend

# Belt-and-suspenders: also strip quarantine from the copies
xattr -d com.apple.quarantine ~/.local/bin/squirrel          2>/dev/null || true
xattr -d com.apple.quarantine ~/.local/bin/squirrel-backend  2>/dev/null || true
```

- `squirrel` — the CLI you type in the terminal
- `squirrel-backend` — the web-UI server daemon (required for `/sq-*` commands that need live vault data)

#### 4. Ensure `~/.local/bin` is on your PATH

```bash
# Check first
echo "$PATH" | tr ':' '\n' | grep -q "$HOME/.local/bin" \
  || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc

source ~/.zshrc   # or open a new terminal tab
which squirrel    # should print ~/.local/bin/squirrel
```

#### 5. Install the agent-pack (Claude Code skills and slash commands)

```bash
mkdir -p ~/.claude/plugins/squirrel
rsync -a --delete "$DMG/agent-pack/" ~/.claude/plugins/squirrel/
```

What lands there:

```
~/.claude/plugins/squirrel/
  skills/        ← AI skill packs (/sq-brief, /sq-capture, …)
  commands/      ← slash command definitions
  lib/           ← Python helper scripts
  hooks/         ← hooks.json (proactive triggers)
  templates/     ← intent.md, dashboard templates
```

#### 6. Seed the config

Skip this step if `~/.squirrel/config.toml` already exists.

```bash
mkdir -p ~/.squirrel
cp "$DMG/resources/squirrel.toml.example" ~/.squirrel/config.toml
```

Edit the file and at minimum set your vault path:

```bash
$EDITOR ~/.squirrel/config.toml
```

Key fields to update:

```toml
default_email = "you@example.com"
machine_environment = "personal"   # or "work"

[[vaults]]
name = "personal"
path = "~/your-vault-folder"       # ← set this
default = true
```

---

### 7. Set up the background daemon (web UI server)

`squirrel-backend` is the web server that runs on `http://127.0.0.1:3939` and backs the `/sq-*` commands that need live vault data. macOS **launchd** manages it — it starts at login and auto-restarts on crash.

> **Do not use `resources/plist.template`** from the DMG for a manual install. That template contains Python-based placeholders (`__PYTHON__`, `__SERVER_PY__`) that do not match the compiled binary. Write the plist directly as shown below.

#### How it works

```
launchd
  └── org.squirrel.web-ui  (~/Library/LaunchAgents/org.squirrel.web-ui.plist)
        └── ~/.local/bin/squirrel-backend --port 3939 --token-file ~/.squirrel/launchd-token
              ├── reads  ~/.squirrel/config.toml
              ├── writes ~/.squirrel/web-ui.stdout.log
              └── writes ~/.squirrel/web-ui.stderr.log
```

The server requires a **64-character hex auth token** in `~/.squirrel/launchd-token` (permissions `0600`, owned by you). The file must exist *before* the plist is registered.

#### Step 7a — Generate the auth token

```bash
TOKEN_FILE="$HOME/.squirrel/launchd-token"
mkdir -p ~/.squirrel

umask 077
openssl rand -hex 32 > "$TOKEN_FILE"   # openssl ships with macOS, no install needed
umask 022
chmod 600 "$TOKEN_FILE"

# Verify
echo "Chars: $(wc -c < "$TOKEN_FILE" | tr -d ' ')"   # must print 65 (64 hex + newline)
ls -la "$TOKEN_FILE"                                   # must show -rw------- and your username
```

#### Step 7b — Write the plist

```bash
BACKEND_BIN="$HOME/.local/bin/squirrel-backend"
TOKEN_FILE="$HOME/.squirrel/launchd-token"
PLIST_PATH="$HOME/Library/LaunchAgents/org.squirrel.web-ui.plist"
mkdir -p "$HOME/Library/LaunchAgents"

cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>org.squirrel.web-ui</string>
  <key>ProgramArguments</key>
  <array>
    <string>$BACKEND_BIN</string>
    <string>--port</string>
    <string>3939</string>
    <string>--token-file</string>
    <string>$TOKEN_FILE</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <dict>
    <key>SuccessfulExit</key>
    <false/>
  </dict>
  <key>StandardOutPath</key>
  <string>$HOME/.squirrel/web-ui.stdout.log</string>
  <key>StandardErrorPath</key>
  <string>$HOME/.squirrel/web-ui.stderr.log</string>
  <key>WorkingDirectory</key>
  <string>$HOME</string>
</dict>
</plist>
EOF

# Sanity-check: no unexpanded variables remain
grep -c '__' "$PLIST_PATH" && echo "ERROR: unexpanded placeholder in plist — check the variables above" || echo "Plist OK"
cat "$PLIST_PATH"
```

#### Step 7c — Register and start the daemon

```bash
PLIST_PATH="$HOME/Library/LaunchAgents/org.squirrel.web-ui.plist"

# Unload any previous version (safe even if not loaded)
launchctl unload "$PLIST_PATH" 2>/dev/null || true

# Load — starts immediately because RunAtLoad = true
launchctl load "$PLIST_PATH"
echo "Daemon loaded."
```

---

### 8. Verify everything works

```bash
# CLI
squirrel --help

# Daemon
curl -s http://127.0.0.1:3939/health
# expected: {"status":"ok"}  or a JSON payload — any 200 means the server is up

# Logs (if something is wrong)
tail -40 ~/.squirrel/web-ui.stderr.log
tail -40 ~/.squirrel/web-ui.stdout.log

# launchd status
launchctl list | grep squirrel
# expected: a line with PID (non-zero) and "org.squirrel.web-ui"
```

Then inside Claude Code:

```
/sq-status
```

---

### Daemon management cheat sheet

| Task | Command |
|------|---------|
| Start daemon | `launchctl load ~/Library/LaunchAgents/org.squirrel.web-ui.plist` |
| Stop daemon | `launchctl unload ~/Library/LaunchAgents/org.squirrel.web-ui.plist` |
| Restart daemon | `launchctl unload … && launchctl load …` |
| Check if running | `launchctl list \| grep squirrel` |
| View stdout log | `tail -f ~/.squirrel/web-ui.stdout.log` |
| View stderr log | `tail -f ~/.squirrel/web-ui.stderr.log` |
| Regenerate token | `bash apps/backend/launchd/install.sh --reinstall` |
| Remove daemon entirely | `launchctl unload ~/Library/LaunchAgents/org.squirrel.web-ui.plist && rm ~/Library/LaunchAgents/org.squirrel.web-ui.plist` |

---

### Potential issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `zsh: killed squirrel` / binary silently crashes | Gatekeeper killed the unsigned binary | `xattr -d com.apple.quarantine ~/.local/bin/squirrel` |
| `command not found: squirrel` after install | `~/.local/bin` not on PATH | Add `export PATH="$HOME/.local/bin:$PATH"` to `~/.zshrc`, then open a new terminal |
| `curl` to port 3939 times out | Daemon not running or plist still has unreplaced placeholders | Check `cat ~/Library/LaunchAgents/org.squirrel.web-ui.plist` for `__PLACEHOLDER__` strings; re-run step 7 |
| `launchctl: service already loaded` | Previous install left the plist registered | `launchctl unload "$PLIST_PATH"` then `launchctl load "$PLIST_PATH"` |
| `token-file must be mode 0600` error in stderr log | Token file has wrong permissions | `chmod 600 ~/.squirrel/launchd-token` |
| `token-file must contain exactly 64 hex chars` | File is empty or truncated | `openssl rand -hex 32 > ~/.squirrel/launchd-token && chmod 600 ~/.squirrel/launchd-token`, then restart daemon |
| `Could not find server.py` in stderr log | `__SERVER_PY__` in plist points to wrong path | Edit the plist: `nano ~/Library/LaunchAgents/org.squirrel.web-ui.plist`, fix the `<string>` after `<string>__SERVER_PY__</string>`, then restart |
| `/sq-*` commands missing in Claude Code | agent-pack not in the right folder | Verify `~/.claude/plugins/squirrel/skills/` exists; re-run step 5 |
| `rsync: No such file or directory` | DMG not mounted | `hdiutil attach ~/Downloads/Squirrel.dmg` |
| Daemon starts then immediately exits (PID shows 0 in `launchctl list`) | Python import error (missing sibling module) | `tail ~/.squirrel/web-ui.stderr.log` — usually `ModuleNotFoundError`; copy all `.py` files from `apps/backend/` to the same folder as `server.py` |

### Uninstalling

```bash
# Stop and remove the daemon
launchctl unload ~/Library/LaunchAgents/org.squirrel.web-ui.plist 2>/dev/null || true
rm -f ~/Library/LaunchAgents/org.squirrel.web-ui.plist

# Remove binaries
rm -f ~/.local/bin/squirrel ~/.local/bin/squirrel-backend

# Remove agent-pack (skills and commands)
rm -rf ~/.claude/plugins/squirrel

# Optionally remove all config, logs, and the auth token:
# rm -rf ~/.squirrel
```

---

## 🔧 Advanced configuration

### Multiple environments (more than 2)

If you have more than two environments (for example personal + work + client A), create one config per environment:

```bash
# Personal environment
mkdir -p ~/.squirrel.personal
cp ~/.squirrel/config.toml ~/.squirrel.personal/

# Client A environment
mkdir -p ~/.squirrel.client-a
# edit config with environment_name = "client-a", different vault_path

# Switch between environments
export CONTEXT_BRIDGE_HOME=~/.squirrel.client-a
```

### Strict mode (corporate compliance)

In `~/.squirrel/config.toml`:

```toml
[compliance]
strict = true
allowed_inbound_tags = ["TRABAJO-*", "OPENSOURCE-*"]
allowed_inbound_environments = ["personal"]
corporate_domains = ["mycompany.com"]
```

This blocks packages that:
- Come from an environment that is not listed
- Contain files with tags outside the allowed set
- Mention emails from corporate domains (to avoid leaks)

### GPG encryption

```toml
[encryption]
enabled = true
gpg_recipient = "your-email@example.com"
```

Prerequisite: have your GPG key generated and `gpg` on your PATH.

Generate a key if you do not already have one:
```bash
gpg --gen-key  # follow the prompts
```

After that, packages generated with `/sq-sync-out` are encrypted automatically.
The other side decrypts with `/sq-sync-in` if it has the private key.

---

## ❓ Troubleshooting

### "`Install Squirrel` is blocked by macOS / codesign error"

macOS quarantines every file from the internet, including DMG contents. The installer also runs `codesign --verify --strict --deep` on the binaries — this fails on unsigned dev builds.

**Quick fix** — strip the quarantine flag before running the installer:

```bash
xattr -cr /Volumes/Squirrel/
"/Volumes/Squirrel/Install Squirrel"
```

If that still fails (e.g. the binaries are unsigned), follow the **Manual install from DMG** section above — it skips the codesign check entirely.

### "Slash commands do not appear in Claude Code"
- Verify the directory is at `~/.claude/plugins/squirrel/`
- Verify `.claude-plugin/plugin.json` exists and is valid JSON
- Restart Claude Code completely (close all sessions)

### "The skill is not invoked automatically"
- The frontmatter `description` must match the context
- Try an explicit slash command invocation first
- Verify the agent loads skills from the correct directory

### "Hash mismatch during sync-in"
- The package was truncated in the clipboard/email
- Verify you copied everything from `<!-- CONTEXT-BRIDGE-PACKAGE` to `END-CONTEXT-BRIDGE-PACKAGE -->`
- If you pasted from email, watch out for line wrapping — some clients insert forced line breaks

### "Compliance scan blocks legitimate content"
- The scan is conservative. If you get a false positive:
  - Option 1: redact the pattern in the original note (best)
  - Option 2: `--force-include` (NOT recommended for repeated use)

### "The vault does not have the expected structure"
- The skills assume `01-Proyectos-Activos/`, `02-Parking-Lot/`, etc.
- If your vault uses a different structure, edit the relevant skills (for example `session-start/SKILL.md` line X)
- Or migrate your vault to the ADHD system (unzip `vault-tdah-obsidian.zip` as a reference)

---

## 🆘 Support

To report issues or suggestions:
- Issues in the plugin repo
- Or write feedback in `99-Resources/squirrel-feedback.md` in your vault

---

## 🔄 Updating

```bash
cd ~/.claude/plugins/squirrel
git pull  # if it is a git repo

# Or overwrite it by copying a new version
```

The settings in `~/.squirrel/` are preserved between updates.
