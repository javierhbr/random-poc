package main

// local-search scan-hooks — install/uninstall automation that keeps a repo's
// index fresh as git activity happens. This file is the SCAFFOLD (story 5.1):
// command skeleton, arg/flag parsing, the CWD guard that reuses `scan`'s target
// resolution, and mechanism selection (flag list or interactive). The actual
// per-mechanism file writing is filled in later:
//
//	TODO(5.2) git-hooks mechanism  (installGitHooks / uninstallGitHooks)
//	TODO(5.3) shell mechanism      (installShellHook / uninstallShellHook)
//	TODO(5.4) trigger behavior     (change-gate, detached dispatch, per-repo lock)

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

// Available automation mechanisms (R-5.1). The two-element universe is fixed;
// 5.2/5.3 flesh out what each one writes.
const (
	mechGitHooks = "git-hooks"
	mechShell    = "shell"
)

// allMechanisms is the offered set, in display/default order.
var allMechanisms = []string{mechGitHooks, mechShell}

// Injectable seams so tests can spy on dispatch without a real prompt or any
// filesystem writes. mechanismPrompt is the thin interactive branch; the two
// *Fn vars point at the per-command dispatchers (which in turn call the stubbed
// per-mechanism functions 5.2/5.3 will implement).
var (
	mechanismPrompt      = promptMechanismSelection
	installScanHooksFn   = installScanHooks
	uninstallScanHooksFn = uninstallScanHooks
)

// cmdScanHooks dispatches `local-search scan-hooks <install|uninstall>`.
//
//	scan-hooks install   [--mechanism git-hooks,shell] [--force]
//	scan-hooks uninstall [--mechanism git-hooks,shell]
//
// It is a thin wrapper (mirroring cmdInstallSkill): parse args, load repos +
// cwd, then hand the pure-ish work to runScanHooks and die() on error.
func cmdScanHooks(args []string) {
	const usage = "Usage: local-search scan-hooks <install|uninstall> [--mechanism git-hooks,shell] [--force]"

	if len(args) == 0 {
		die(usage)
	}
	sub := args[0]
	switch sub {
	case "install", "uninstall":
		// ok
	case "-h", "--help":
		fmt.Println(usage)
		return
	default:
		die(usage)
	}

	mechanismFlag := ""
	force := false
	rest := args[1:]
	for i := 0; i < len(rest); i++ {
		switch rest[i] {
		case "--mechanism", "-m":
			if i+1 >= len(rest) {
				die("scan-hooks: --mechanism requires a value (git-hooks,shell)")
			}
			i++
			mechanismFlag = rest[i]
		case "--force", "-f":
			force = true
		case "-h", "--help":
			fmt.Println(usage)
			return
		default:
			die(usage)
		}
	}

	repos := loadReposOrDie()
	cwd, _ := os.Getwd()
	if err := runScanHooks(sub, mechanismFlag, force, cwd, repos); err != nil {
		die(err.Error())
	}
}

// runScanHooks is the testable seam (cwd + repos + parsed args → error). It
// resolves the target repo BEFORE any selection or mutation, so an invocation
// outside a registered repo installs/removes nothing (R-5.3).
func runScanHooks(sub, mechanismFlag string, force bool, cwd string, repos []repoEntry) error {
	// R-5.3: same CWD guard as `scan` — reuse resolveScanTarget so the error
	// text (and the no-repos-registered / not-inside-a-repo distinction) is
	// identical. Runs first: on failure we return having touched nothing.
	repo, err := resolveHookRepo(cwd, repos)
	if err != nil {
		return err
	}

	mechs, err := resolveMechanisms(mechanismFlag, true)
	if err != nil {
		return err
	}

	switch sub {
	case "install":
		return installScanHooksFn(repo, mechs, force)
	case "uninstall":
		return uninstallScanHooksFn(repo, mechs)
	default:
		return fmt.Errorf("unknown scan-hooks subcommand %q", sub)
	}
}

// resolveHookRepo resolves the single repo enclosing cwd using the SAME
// mechanism `scan` uses (resolveScanTarget with no args → surgical single
// target). It therefore returns scan's exact guard errors: "not inside a
// registered repo…" when cwd is outside any repo (R-5.3), and the "no repos
// added yet" guidance when none are registered (R-1.8).
func resolveHookRepo(cwd string, repos []repoEntry) (repoEntry, error) {
	mode, targets, err := resolveScanTarget(nil, cwd, repos)
	if err != nil {
		return repoEntry{}, err
	}
	if mode != modeSurgical || len(targets) != 1 {
		return repoEntry{}, fmt.Errorf("scan-hooks operates on a single CWD-resolved repo")
	}
	return targets[0], nil
}

// resolveMechanisms turns the --mechanism flag into the concrete list to act on
// (R-5.1). The flag path is pure and fully testable: a comma list, each value
// validated against {git-hooks, shell}, trimmed and de-duplicated, order
// preserved. When the flag is omitted it falls back to the interactive prompt
// (R-5.2) — kept thin behind the mechanismPrompt seam.
func resolveMechanisms(flagValue string, interactive bool) ([]string, error) {
	if strings.TrimSpace(flagValue) != "" {
		var out []string
		seen := map[string]bool{}
		for _, part := range strings.Split(flagValue, ",") {
			m := strings.TrimSpace(part)
			if m == "" {
				continue
			}
			if m != mechGitHooks && m != mechShell {
				return nil, fmt.Errorf("unknown mechanism %q (valid: %s)", m, strings.Join(allMechanisms, ", "))
			}
			if !seen[m] {
				seen[m] = true
				out = append(out, m)
			}
		}
		if len(out) == 0 {
			return nil, fmt.Errorf("--mechanism requires at least one of: %s", strings.Join(allMechanisms, ", "))
		}
		return out, nil
	}

	// No flag: interactive selection (R-5.2), thin branch behind the seam.
	if interactive {
		return mechanismPrompt()
	}
	return nil, fmt.Errorf("no --mechanism specified and no interactive prompt available")
}

// promptMechanismSelection presents the available mechanisms and reads the
// user's choice from stdin, mirroring the existing stdin-confirm pattern in
// cmdReset. Kept deliberately small; 5.1 only needs the selection to work.
func promptMechanismSelection() ([]string, error) {
	fmt.Println("Select scan-hook mechanism(s) to install:")
	fmt.Printf("  1) %-9s — git .git/hooks post-merge/checkout/rewrite\n", mechGitHooks)
	fmt.Printf("  2) %-9s — cd-into-repo trigger\n", mechShell)
	fmt.Print("Enter numbers (e.g. 1,2) or 'all': ")

	reader := bufio.NewReader(os.Stdin)
	answer, _ := reader.ReadString('\n')
	answer = strings.TrimSpace(strings.ToLower(answer))
	if answer == "" {
		return nil, fmt.Errorf("no mechanism selected")
	}
	if answer == "all" {
		return append([]string(nil), allMechanisms...), nil
	}

	var out []string
	seen := map[string]bool{}
	for _, part := range strings.Split(answer, ",") {
		var m string
		switch strings.TrimSpace(part) {
		case "1", mechGitHooks:
			m = mechGitHooks
		case "2", mechShell:
			m = mechShell
		default:
			return nil, fmt.Errorf("invalid selection %q", strings.TrimSpace(part))
		}
		if !seen[m] {
			seen[m] = true
			out = append(out, m)
		}
	}
	if len(out) == 0 {
		return nil, fmt.Errorf("no mechanism selected")
	}
	return out, nil
}

// installScanHooks dispatches to the per-mechanism installers and prints a
// status line for each. The installers themselves are stubs until 5.2/5.3.
func installScanHooks(repo repoEntry, mechs []string, force bool) error {
	for _, m := range mechs {
		switch m {
		case mechGitHooks:
			if err := installGitHooks(repo, force); err != nil {
				return fmt.Errorf("git-hooks: %w", err)
			}
			fmt.Printf("  git-hooks: installed for %s\n", repo.Name)
		case mechShell:
			if err := installShellHook(repo); err != nil {
				return fmt.Errorf("shell: %w", err)
			}
			fmt.Printf("  shell: installed for %s\n", repo.Name)
		default:
			return fmt.Errorf("unknown mechanism %q", m)
		}
	}
	return nil
}

// uninstallScanHooks dispatches to the per-mechanism removers and prints a
// status line for each. Stubs until 5.2/5.3.
func uninstallScanHooks(repo repoEntry, mechs []string) error {
	for _, m := range mechs {
		switch m {
		case mechGitHooks:
			if err := uninstallGitHooks(repo); err != nil {
				return fmt.Errorf("git-hooks: %w", err)
			}
			fmt.Printf("  git-hooks: removed for %s\n", repo.Name)
		case mechShell:
			if err := uninstallShellHook(repo); err != nil {
				return fmt.Errorf("shell: %w", err)
			}
			fmt.Printf("  shell: removed for %s\n", repo.Name)
		default:
			return fmt.Errorf("unknown mechanism %q", m)
		}
	}
	return nil
}

// ── Per-mechanism stubs (filled in by later stories) ────────────────────────

// installGitHooks writes managed post-merge/post-checkout/post-rewrite hooks
// into the repo's .git/hooks (sentinel-delimited managed block; --force replaces
// a stale block).
//
// TODO(5.2): real git-hook install (R-5.4, R-5.4a, R-5.5, R-5.9).
func installGitHooks(repo repoEntry, force bool) error {
	_ = force
	return nil
}

// uninstallGitHooks removes only the managed block from each hook file, deleting
// the file if it becomes empty.
//
// TODO(5.2): real git-hook uninstall (R-5.8).
func uninstallGitHooks(repo repoEntry) error {
	return nil
}

// installShellHook writes ~/.local-search/shell-hook.sh and prints the exact
// `source` line for the user's shell rc (never edits rc files directly).
//
// TODO(5.3): real shell-hook install (R-5.6, R-5.9).
func installShellHook(repo repoEntry) error {
	return nil
}

// uninstallShellHook removes the shell-hook snippet file and prints the line to
// delete from the rc.
//
// TODO(5.3): real shell-hook uninstall (R-5.8).
func uninstallShellHook(repo repoEntry) error {
	return nil
}
