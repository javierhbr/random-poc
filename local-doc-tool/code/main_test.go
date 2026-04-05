package main

import "testing"

func TestParseRepoAddArgs_Basic(t *testing.T) {
	dir, name, skips, err := parseRepoAddArgs([]string{"./specs", "prod", "--skip-directory", ".skills", "--skip-directory=vendor"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if dir != "./specs" {
		t.Fatalf("expected dir ./specs, got %q", dir)
	}
	if name != "prod" {
		t.Fatalf("expected name prod, got %q", name)
	}
	if len(skips) != 2 || skips[0] != ".skills" || skips[1] != "vendor" {
		t.Fatalf("unexpected skips: %v", skips)
	}
}

func TestParseRepoAddArgs_FlagsBeforePositionals(t *testing.T) {
	dir, name, skips, err := parseRepoAddArgs([]string{"--skip-directory", ".skills", "./specs"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if dir != "./specs" || name != "" {
		t.Fatalf("unexpected parsed values: dir=%q name=%q", dir, name)
	}
	if len(skips) != 1 || skips[0] != ".skills" {
		t.Fatalf("unexpected skips: %v", skips)
	}
}

func TestParseRepoAddArgs_RejectsPathForSkipDirectory(t *testing.T) {
	_, _, _, err := parseRepoAddArgs([]string{"./specs", "--skip-directory", "dir/subdir"})
	if err == nil {
		t.Fatalf("expected error for path-like skip-directory")
	}
}

func TestParseRepoEntryLine_BackwardCompatible(t *testing.T) {
	r, ok := parseRepoEntryLine("docs|/tmp/docs")
	if !ok {
		t.Fatalf("expected line to parse")
	}
	if r.Name != "docs" || r.Path != "/tmp/docs" {
		t.Fatalf("unexpected repo entry: %+v", r)
	}
	if len(r.SkipDirectories) != 0 {
		t.Fatalf("expected no skip directories, got %v", r.SkipDirectories)
	}
}

func TestParseAndFormatRepoEntryLine_WithSkipDirectories(t *testing.T) {
	orig := repoEntry{Name: "docs", Path: "/tmp/docs", SkipDirectories: []string{"vendor", ".skills", "vendor"}}
	line := formatRepoEntryLine(orig)
	r, ok := parseRepoEntryLine(line)
	if !ok {
		t.Fatalf("expected formatted line to parse")
	}
	if r.Name != "docs" || r.Path != "/tmp/docs" {
		t.Fatalf("unexpected repo values: %+v", r)
	}
	if len(r.SkipDirectories) != 2 || r.SkipDirectories[0] != ".skills" || r.SkipDirectories[1] != "vendor" {
		t.Fatalf("unexpected skip directories: %v", r.SkipDirectories)
	}
}
