package main

import (
	"strings"
	"testing"
)

// R-5.1: --mechanism comma list parses to exactly the listed mechanisms;
// unknown values error; single values parse to just that one.
func TestResolveMechanisms(t *testing.T) {
	tests := []struct {
		name    string
		flag    string
		want    []string
		wantErr string // substring; "" means expect no error
	}{
		{name: "both mechanisms", flag: "git-hooks,shell", want: []string{mechGitHooks, mechShell}},
		{name: "single git-hooks", flag: "git-hooks", want: []string{mechGitHooks}},
		{name: "single shell", flag: "shell", want: []string{mechShell}},
		{name: "whitespace tolerated", flag: " git-hooks , shell ", want: []string{mechGitHooks, mechShell}},
		{name: "duplicates collapsed", flag: "git-hooks,git-hooks", want: []string{mechGitHooks}},
		{name: "unknown value errors", flag: "bogus", wantErr: "unknown mechanism"},
		{name: "one unknown in list errors", flag: "git-hooks,bogus", wantErr: "unknown mechanism"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// interactive=false so the flag path is exercised purely (no prompt).
			got, err := resolveMechanisms(tt.flag, false)

			if tt.wantErr != "" {
				if err == nil {
					t.Fatalf("expected error containing %q, got nil", tt.wantErr)
				}
				if !strings.Contains(err.Error(), tt.wantErr) {
					t.Fatalf("error %q does not contain %q", err.Error(), tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if len(got) != len(tt.want) {
				t.Fatalf("got %v, want %v", got, tt.want)
			}
			for i := range got {
				if got[i] != tt.want[i] {
					t.Fatalf("got %v, want %v", got, tt.want)
				}
			}
		})
	}
}

// resolveMechanisms with no flag delegates to the interactive prompt seam.
func TestResolveMechanisms_InteractiveSeam(t *testing.T) {
	orig := mechanismPrompt
	defer func() { mechanismPrompt = orig }()

	called := false
	mechanismPrompt = func() ([]string, error) {
		called = true
		return []string{mechShell}, nil
	}

	got, err := resolveMechanisms("", true)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !called {
		t.Fatal("expected interactive prompt seam to be invoked when --mechanism omitted")
	}
	if len(got) != 1 || got[0] != mechShell {
		t.Fatalf("got %v, want [shell]", got)
	}
}

// R-5.3: install/uninstall invoked outside any registered repo returns the same
// guard error as `scan` AND performs no install (dispatch seam never reached).
func TestRunScanHooks_OutsideRepoInstallsNothing(t *testing.T) {
	origInstall := installScanHooksFn
	origUninstall := uninstallScanHooksFn
	origPrompt := mechanismPrompt
	defer func() {
		installScanHooksFn = origInstall
		uninstallScanHooksFn = origUninstall
		mechanismPrompt = origPrompt
	}()

	installReached := false
	uninstallReached := false
	promptReached := false
	installScanHooksFn = func(repoEntry, []string, bool) error { installReached = true; return nil }
	uninstallScanHooksFn = func(repoEntry, []string) error { uninstallReached = true; return nil }
	mechanismPrompt = func() ([]string, error) { promptReached = true; return []string{mechShell}, nil }

	// A registered repo somewhere else; cwd is outside it.
	repos := []repoEntry{{Name: "docs", Path: "/Users/me/docs"}}
	cwd := "/tmp/nowhere-outside-any-repo"

	for _, sub := range []string{"install", "uninstall"} {
		// Explicit --mechanism shell, matching the acceptance scenario.
		err := runScanHooks(sub, "shell", false, cwd, repos)
		if err == nil {
			t.Fatalf("%s: expected an error outside any registered repo, got nil", sub)
		}
		if !strings.Contains(err.Error(), "not inside a registered repo") {
			t.Fatalf("%s: error %q is not scan's not-inside-a-repo guard", sub, err.Error())
		}
	}

	if installReached || uninstallReached {
		t.Fatalf("dispatch reached outside a repo (install=%v uninstall=%v); nothing must be installed/removed", installReached, uninstallReached)
	}
	if promptReached {
		t.Fatal("mechanism prompt reached outside a repo; the CWD guard must fire first")
	}
}

// R-5.3 companion: with no repos registered at all, the guard returns the same
// "no repos added yet" guidance as scan and installs nothing.
func TestRunScanHooks_NoReposRegistered(t *testing.T) {
	err := runScanHooks("install", "shell", false, "/tmp/anywhere", nil)
	if err == nil {
		t.Fatal("expected an error with no repos registered, got nil")
	}
	if !strings.Contains(strings.ToLower(err.Error()), "no repos added yet") {
		t.Fatalf("error %q is not the no-repos guidance", err.Error())
	}
}

// Inside a registered repo with --mechanism omitted, runScanHooks resolves the
// repo, invokes the interactive selection seam, and dispatches install for the
// selected mechanisms (R-5.2 seam wiring).
func TestRunScanHooks_InsideRepoUsesPromptSeam(t *testing.T) {
	origInstall := installScanHooksFn
	origPrompt := mechanismPrompt
	defer func() {
		installScanHooksFn = origInstall
		mechanismPrompt = origPrompt
	}()

	promptCalled := false
	mechanismPrompt = func() ([]string, error) { promptCalled = true; return []string{mechShell}, nil }

	var gotMechs []string
	var gotRepo repoEntry
	installScanHooksFn = func(r repoEntry, mechs []string, _ bool) error {
		gotRepo = r
		gotMechs = mechs
		return nil
	}

	// cwd == repo path so NearestRepoForCWD matches (uses filepath.Abs; a real
	// temp dir keeps the comparison honest).
	dir := t.TempDir()
	repos := []repoEntry{{Name: "docs", Path: dir}}

	if err := runScanHooks("install", "", false, dir, repos); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !promptCalled {
		t.Fatal("expected interactive prompt seam to be invoked when --mechanism omitted")
	}
	if gotRepo.Name != "docs" {
		t.Fatalf("dispatched for repo %q, want docs", gotRepo.Name)
	}
	if len(gotMechs) != 1 || gotMechs[0] != mechShell {
		t.Fatalf("dispatched mechanisms %v, want [shell]", gotMechs)
	}
}
