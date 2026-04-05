// local-search — multi-repo spec registry with full-text search.
// Single Go binary replacement for the bash local-search.sh script.
package main

import (
	"bufio"
	"database/sql"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	localdb "local-search/db"
	"local-search/extract"
	"local-search/git"
)

// ── Config ────────────────────────────────────────────────────────────────────

const Version = "0.1.0"

var (
	appDir    = filepath.Join(homeDir(), ".local-search")
	reposFile = filepath.Join(appDir, "repos")
	dbFile    = filepath.Join(appDir, "specs.db")
)

func homeDir() string {
	if h, err := os.UserHomeDir(); err == nil {
		return h
	}
	return "."
}

// ── Entry point ───────────────────────────────────────────────────────────────

func main() {
	if len(os.Args) < 2 {
		cmdHelp()
		return
	}

	cmd := os.Args[1]
	args := os.Args[2:]

	switch cmd {
	case "repo", "repos":
		cmdRepo(args)
	case "scan", "rebuild", "index":
		target := "all"
		if len(args) > 0 {
			target = args[0]
		}
		cmdScan(target)
	case "search", "s", "find", "f":
		cmdSearch(args)
	case "read", "r", "get", "show":
		cmdRead(args)
	case "list", "ls":
		cmdList(args)
	case "projects", "p":
		cmdProjects()
	case "related", "rel":
		cmdRelated(args)
	case "recent":
		cmdRecent(args)
	case "tags", "t":
		cmdTags(args)
	case "stats":
		cmdStats()
	case "db":
		fmt.Println(dbFile)
	case "inspect", "dump", "debug":
		cmdInspect()
	case "json", "j":
		cmdJSON(args)
	case "reset":
		cmdReset()
	case "-v", "--version":
		fmt.Println("local-search version " + Version)
		return
	case "help", "--help", "-h":
		cmdHelp()
	default:
		fmt.Fprintf(os.Stderr, "Unknown command: %s\n", cmd)
		cmdHelp()
		os.Exit(1)
	}
}

// ── Repo management ───────────────────────────────────────────────────────────

func cmdRepo(args []string) {
	if len(args) == 0 {
		fmt.Fprintln(os.Stderr, "Usage: local-search repo <add|remove|list>")
		os.Exit(1)
	}
	sub := args[0]
	rest := args[1:]
	switch sub {
	case "add":
		repoAdd(rest)
	case "remove", "rm":
		repoRemove(rest)
	case "list", "ls":
		repoList()
	default:
		fmt.Fprintf(os.Stderr, "Usage: local-search repo <add|remove|list>\n")
		os.Exit(1)
	}
}

func repoAdd(args []string) {
	dirArg, nameArg, skipDirs, err := parseRepoAddArgs(args)
	if err != nil {
		die(err.Error())
	}

	dir, err := filepath.Abs(dirArg)
	if err != nil {
		die("Cannot resolve path: " + dirArg)
	}
	if _, err := os.Stat(dir); err != nil {
		die("Directory not found: " + dir)
	}

	name := filepath.Base(dir)
	if nameArg != "" {
		name = nameArg
	}

	if err := os.MkdirAll(appDir, 0755); err != nil {
		die(err.Error())
	}

	// Check duplicate
	if repos := loadRepos(); repoExists(repos, name, dir) {
		die(fmt.Sprintf("Repo %q already registered", name))
	}

	repos := loadRepos()
	repos = append(repos, repoEntry{Name: name, Path: dir, SkipDirectories: skipDirs})
	saveRepos(repos)

	fmt.Printf("Added repo %q (%s)\n", name, dir)
	if len(skipDirs) > 0 {
		fmt.Printf("Skipping directories by name: %s\n", strings.Join(skipDirs, ", "))
	}
	fmt.Println("Scanning…")
	cmdScan("all")
}

func parseRepoAddArgs(args []string) (dir, name string, skipDirs []string, err error) {
	if len(args) == 0 {
		return "", "", nil, fmt.Errorf("Usage: local-search repo add <folder> [name] [--skip-directory <folder-name>]...")
	}

	var positional []string
	for i := 0; i < len(args); i++ {
		a := args[i]
		switch {
		case a == "--skip-directory":
			if i+1 >= len(args) {
				return "", "", nil, fmt.Errorf("--skip-directory requires a folder name")
			}
			i++
			skipDirs = append(skipDirs, args[i])
		case strings.HasPrefix(a, "--skip-directory="):
			skipDirs = append(skipDirs, strings.TrimPrefix(a, "--skip-directory="))
		case strings.HasPrefix(a, "-"):
			return "", "", nil, fmt.Errorf("unknown flag: %s", a)
		default:
			positional = append(positional, a)
		}
	}

	if len(positional) == 0 {
		return "", "", nil, fmt.Errorf("Usage: local-search repo add <folder> [name] [--skip-directory <folder-name>]...")
	}
	if len(positional) > 2 {
		return "", "", nil, fmt.Errorf("Usage: local-search repo add <folder> [name] [--skip-directory <folder-name>]...")
	}

	normalized, err := normalizeSkipDirectoryNames(skipDirs)
	if err != nil {
		return "", "", nil, err
	}

	dir = positional[0]
	if len(positional) == 2 {
		name = positional[1]
	}
	return dir, name, normalized, nil
}

func normalizeSkipDirectoryNames(values []string) ([]string, error) {
	seen := make(map[string]bool)
	out := make([]string, 0, len(values))
	for _, raw := range values {
		v := strings.TrimSpace(raw)
		if v == "" {
			return nil, fmt.Errorf("--skip-directory requires a non-empty folder name")
		}
		if v == "." || v == ".." {
			return nil, fmt.Errorf("invalid --skip-directory value %q: use a folder name", v)
		}
		if strings.Contains(v, "/") || strings.Contains(v, "\\") {
			return nil, fmt.Errorf("invalid --skip-directory value %q: expected folder name, not path", v)
		}
		if strings.Contains(v, "|") || strings.Contains(v, ",") {
			return nil, fmt.Errorf("invalid --skip-directory value %q: characters '|' and ',' are not allowed", v)
		}
		if !seen[v] {
			seen[v] = true
			out = append(out, v)
		}
	}
	sort.Strings(out)
	return out, nil
}

func repoRemove(args []string) {
	if len(args) == 0 {
		die("Usage: local-search repo remove <name>")
	}
	name := args[0]
	repos := loadRepos()
	var found bool
	var kept []repoEntry
	for _, r := range repos {
		if r.Name == name {
			found = true
		} else {
			kept = append(kept, r)
		}
	}
	if !found {
		die(fmt.Sprintf("Repo %q not found", name))
	}
	saveRepos(kept)
	fmt.Printf("Removed repo %q\n", name)

	if len(kept) == 0 {
		os.Remove(dbFile)
		fmt.Println("No repos left. Index deleted.")
		return
	}

	// Remove entries from DB and repopulate
	if _, err := os.Stat(dbFile); err == nil {
		db := openDB()
		defer db.Close()
		if err := localdb.DeleteRepo(db, name); err != nil {
			fmt.Fprintf(os.Stderr, "warning: %v\n", err)
		}
	}
	fmt.Println("Rebuilding index…")
	cmdScan("all")
}

func repoList() {
	repos := loadRepos()
	if len(repos) == 0 {
		fmt.Println("No repos registered. Use: local-search repo add /path/to/specs")
		return
	}
	for _, r := range repos {
		fmt.Printf("  %-20s  %s\n", r.Name, r.Path)
	}
}

// ── Scan ──────────────────────────────────────────────────────────────────────

func cmdScan(target string) {
	repos := loadReposOrDie()

	// Remove old DB
	os.Remove(dbFile)

	db := openDB()
	defer db.Close()

	if err := localdb.CreateSchema(db); err != nil {
		die(err.Error())
	}

	fmt.Println("Scanning repos…")
	total := 0
	for _, r := range repos {
		if target != "all" && r.Name != target {
			continue
		}
		fmt.Printf("  %s: indexing %s…\n", r.Name, r.Path)
		n, err := localdb.FullScan(db, r.Name, r.Path, r.SkipDirectories)
		if err != nil {
			fmt.Fprintf(os.Stderr, "  %s: error — %v\n", r.Name, err)
			continue
		}
		fmt.Printf("  %s: %d files indexed\n", r.Name, n)
		total += n

		// Store git commit for incremental detection
		if git.IsRepo(r.Path) {
			if commit := git.CurrentCommit(r.Path); commit != "" {
				localdb.SetMeta(db, "git_commit_"+r.Name, commit) //nolint:errcheck
			}
		}
	}

	localdb.SetMeta(db, "last_scan", time.Now().UTC().Format(time.RFC3339)) //nolint:errcheck
	fmt.Printf("\nDone. %d specs indexed. Run 'local-search search <keyword>' to find specs.\n", total)
}

// ensureDB opens the DB (creating it if needed) and runs incremental updates for
// git repos that have changed since the last scan.
func ensureDB() *sql.DB {
	if _, err := os.Stat(dbFile); os.IsNotExist(err) {
		cmdScan("all")
	}

	db := openDB()

	repos := loadRepos()
	for _, r := range repos {
		if !git.IsRepo(r.Path) {
			continue
		}
		lastCommit := localdb.GetMeta(db, "git_commit_"+r.Name)
		changed, err := git.ChangedFiles(r.Path, lastCommit)
		if err != nil || len(changed) == 0 {
			continue
		}
		fmt.Fprintf(os.Stderr, "(%s: git changes detected — incremental update…)\n\n", r.Name)
		n, newCommit, err := localdb.IncrementalScan(db, r.Name, r.Path, lastCommit, r.SkipDirectories)
		if err != nil {
			fmt.Fprintf(os.Stderr, "warning: incremental scan failed: %v\n", err)
			continue
		}
		if n > 0 {
			fmt.Fprintf(os.Stderr, "(%s: %d file(s) updated)\n\n", r.Name, n)
		}
		if newCommit != "" {
			localdb.SetMeta(db, "git_commit_"+r.Name, newCommit) //nolint:errcheck
		}
	}
	return db
}

// ── Search ────────────────────────────────────────────────────────────────────

// stringSliceFlag implements flag.Value for a repeatable string flag.
type stringSliceFlag []string

func (s *stringSliceFlag) String() string     { return strings.Join(*s, ", ") }
func (s *stringSliceFlag) Set(v string) error { *s = append(*s, v); return nil }

// filterByLocation removes results whose Path contains any of the given patterns.
func filterByLocation(results []localdb.SearchResult, patterns []string) []localdb.SearchResult {
	if len(patterns) == 0 {
		return results
	}
	out := results[:0]
	for _, r := range results {
		exclude := false
		for _, p := range patterns {
			if strings.Contains(r.Path, p) {
				exclude = true
				break
			}
		}
		if !exclude {
			out = append(out, r)
		}
	}
	return out
}

func cmdSearch(args []string) {
	fs := flag.NewFlagSet("search", flag.ExitOnError)
	repoFlag := fs.String("repo", "", "Filter results to this repo")
	directoryFlag := fs.String("directory", "", "Filter results to paths starting with this directory")
	var excludeLocations stringSliceFlag
	fs.Var(&excludeLocations, "exclude-location", "Exclude results whose path contains this string (repeatable)")

	// Go's flag package stops at the first non-flag argument, so flags after
	// the query term are silently ignored. Split positional args from flags
	// before parsing so --repo / --exclude-location work in any position.
	var positional, flagArgs []string
	for i := 0; i < len(args); i++ {
		a := args[i]
		if strings.HasPrefix(a, "-") {
			flagArgs = append(flagArgs, a)
			// Consume the next token if the flag uses "= value" or separate value.
			// flag.Parse handles "--flag value" by consuming the next arg itself,
			// but we must keep them together in flagArgs.
			if !strings.Contains(a, "=") && i+1 < len(args) && !strings.HasPrefix(args[i+1], "-") {
				i++
				flagArgs = append(flagArgs, args[i])
			}
		} else {
			positional = append(positional, a)
		}
	}
	fs.Parse(flagArgs) //nolint:errcheck

	if len(positional) == 0 {
		die("Usage: local-search search <query> [--repo <name>] [--directory <path>] [--exclude-location <pattern>]...")
	}
	query := positional[0]

	// Positional repo arg (backward-compat)
	repo := ""
	if len(positional) > 1 {
		repo = positional[1]
	}
	// Named flag takes precedence
	if *repoFlag != "" {
		repo = *repoFlag
	}

	db := ensureDB()
	defer db.Close()

	results, err := localdb.Search(db, query, repo, *directoryFlag)
	if err != nil {
		die(err.Error())
	}
	results = filterByLocation(results, excludeLocations)
	localdb.PrintSearch(results, query)
}

// ── Read ──────────────────────────────────────────────────────────────────────

func cmdRead(args []string) {
	fs := flag.NewFlagSet("read", flag.ExitOnError)
	repoFlag := fs.String("repo", "", "Read from specific repo")
	directoryFlag := fs.String("directory", "", "Filter to paths starting with this directory")

	// Split positional args from flags
	var positional, flagArgs []string
	for i := 0; i < len(args); i++ {
		a := args[i]
		if strings.HasPrefix(a, "-") {
			flagArgs = append(flagArgs, a)
			if !strings.Contains(a, "=") && i+1 < len(args) && !strings.HasPrefix(args[i+1], "-") {
				i++
				flagArgs = append(flagArgs, args[i])
			}
		} else {
			positional = append(positional, a)
		}
	}
	fs.Parse(flagArgs) //nolint:errcheck

	if len(positional) == 0 {
		die("Usage: local-search read <name> [repo] [--directory <path>]")
	}
	name := positional[0]
	repo := ""
	if len(positional) > 1 {
		repo = positional[1]
	}
	if *repoFlag != "" {
		repo = *repoFlag
	}

	db := ensureDB()
	defer db.Close()

	fullpath, err := localdb.ReadSpec(db, name, repo, *directoryFlag)
	if err != nil {
		die(err.Error())
	}
	if fullpath == "" {
		return // multiple matches were listed
	}

	data, err := os.ReadFile(fullpath)
	if err != nil {
		die(err.Error())
	}
	fmt.Print(string(data))
}

// ── List ──────────────────────────────────────────────────────────────────────

func cmdList(args []string) {
	filter := ""
	if len(args) > 0 {
		filter = args[0]
	}

	db := ensureDB()
	defer db.Close()

	if err := localdb.StreamList(db, filter); err != nil {
		die(err.Error())
	}
}

// ── Projects ──────────────────────────────────────────────────────────────────

func cmdProjects() {
	db := ensureDB()
	defer db.Close()

	projects, err := localdb.Projects(db)
	if err != nil {
		die(err.Error())
	}
	for _, p := range projects {
		fmt.Printf("  [%s] %s  (%d specs)\n", p.Repo, p.Project, p.Count)
	}
}

// ── Related ───────────────────────────────────────────────────────────────────

func cmdRelated(args []string) {
	if len(args) == 0 {
		die("Usage: local-search related <name>")
	}
	name := args[0]

	db := ensureDB()
	defer db.Close()

	results, err := localdb.Related(db, name)
	if err != nil {
		die(err.Error())
	}
	if len(results) == 0 {
		fmt.Println("No related specs found.")
		return
	}
	localdb.PrintSearch(results, name)
}

// ── Recent ────────────────────────────────────────────────────────────────────

func cmdRecent(args []string) {
	n := 10
	if len(args) > 0 {
		if v, err := strconv.Atoi(args[0]); err == nil && v > 0 {
			n = v
		}
	}

	db := ensureDB()
	defer db.Close()

	rows, err := localdb.Recent(db, n)
	if err != nil {
		die(err.Error())
	}
	for _, r := range rows {
		fmt.Printf("  [%s] %s/%s  %s\n", r.Repo, r.Project, r.Name, r.Title)
	}
}

// ── Tags ──────────────────────────────────────────────────────────────────────

func cmdTags(args []string) {
	db := ensureDB()
	defer db.Close()

	if len(args) > 0 {
		rows, err := localdb.SpecsByTag(db, args[0])
		if err != nil {
			die(err.Error())
		}
		localdb.PrintList(rows)
		return
	}

	tags, err := localdb.Tags(db)
	if err != nil {
		die(err.Error())
	}
	for _, t := range tags {
		fmt.Printf("  %-30s %d\n", t.Tag, t.Count)
	}
}

// ── Stats ─────────────────────────────────────────────────────────────────────

func cmdStats() {
	db := ensureDB()
	defer db.Close()

	s, err := localdb.Stats(db)
	if err != nil {
		die(err.Error())
	}
	localdb.PrintStats(s, dbFile)
}

// ── Inspect ───────────────────────────────────────────────────────────────────

func cmdInspect() {
	db := ensureDB()
	defer db.Close()

	if err := localdb.Inspect(db, dbFile); err != nil {
		die(err.Error())
	}
}

// ── Reset ─────────────────────────────────────────────────────────────────────

func cmdReset() {
	fmt.Print("This will delete all repos and the index. Continue? [y/N] ")
	reader := bufio.NewReader(os.Stdin)
	answer, _ := reader.ReadString('\n')
	if strings.ToLower(strings.TrimSpace(answer)) != "y" {
		fmt.Println("Cancelled.")
		return
	}
	os.Remove(dbFile)
	os.Remove(reposFile)
	fmt.Println("Reset complete. Start fresh with: local-search repo add /path/to/specs")
}

// ── JSON ──────────────────────────────────────────────────────────────────────

func cmdJSON(args []string) {
	if len(args) == 0 {
		die("Usage: local-search json <search|read|list|repos|related|tags|stats> [args...]")
	}
	sub := args[0]
	rest := args[1:]

	db := ensureDB()
	defer db.Close()

	switch sub {
	case "search":
		if len(rest) == 0 {
			die("Usage: local-search json search <query> [repo]")
		}
		repo := ""
		if len(rest) > 1 {
			repo = rest[1]
		}
		results, err := localdb.Search(db, rest[0], repo, "")
		if err != nil {
			die(err.Error())
		}
		localdb.PrintJSON(results)

	case "read":
		if len(rest) == 0 {
			die("Usage: local-search json read <name> [repo]")
		}
		repo := ""
		if len(rest) > 1 {
			repo = rest[1]
		}
		fullpath, err := localdb.ReadSpec(db, rest[0], repo, "")
		if err != nil {
			die(err.Error())
		}
		if fullpath == "" {
			return
		}
		data, err := os.ReadFile(fullpath)
		if err != nil {
			die(err.Error())
		}
		localdb.PrintJSON(map[string]string{
			"path":    fullpath,
			"content": string(data),
		})

	case "list":
		filter := ""
		if len(rest) > 0 {
			filter = rest[0]
		}
		rows, err := localdb.List(db, filter)
		if err != nil {
			die(err.Error())
		}
		localdb.PrintJSON(rows)

	case "repos":
		repos, err := localdb.Repos(db)
		if err != nil {
			die(err.Error())
		}
		localdb.PrintJSON(repos)

	case "related":
		if len(rest) == 0 {
			die("Usage: local-search json related <name>")
		}
		results, err := localdb.Related(db, rest[0])
		if err != nil {
			die(err.Error())
		}
		localdb.PrintJSON(results)

	case "tags":
		tags, err := localdb.Tags(db)
		if err != nil {
			die(err.Error())
		}
		localdb.PrintJSON(tags)

	case "stats":
		s, err := localdb.Stats(db)
		if err != nil {
			die(err.Error())
		}
		localdb.PrintJSON(s)

	default:
		die("Unknown json subcommand: " + sub)
	}
}

// ── Help ──────────────────────────────────────────────────────────────────────

func cmdHelp() {
	fmt.Print(`local-search — search your project specs across multiple repos

Usage:
	local-search repo add <folder> [name] [--skip-directory <folder-name>]   Register a spec repo
  local-search repo remove <name>         Remove a repo
  local-search repo list                  Show all repos

  local-search scan                       Scan all repos
  local-search scan <repo-name>           Scan one repo

  local-search search <query>                                                        Search all repos
  local-search search <query> --repo <name>                                          Search one repo (named flag)
  local-search search <query> <repo>                                                 Search one repo (positional, legacy)
  local-search search <query> --directory <path>                                     Focus to paths starting with <path>
  local-search search <query> --exclude-location <pattern>                           Exclude paths containing pattern
  local-search read <name>                                                           Read a spec
  local-search read <name> <repo>                                                    Read from specific repo
  local-search read <name> <repo> --directory <path>                                 Read from specific repo and directory
  local-search related <name>             Find related specs

  local-search list                       All specs, all repos
  local-search list <repo-or-project>     Filter by repo or project
  local-search projects                   List all projects
  local-search tags                       List all tags
  local-search tags <tag>                 Specs with a tag
  local-search recent [n]                 Recently modified (default 10)

  local-search stats                      Index statistics
  local-search db                         Print database file path
  local-search inspect                    Dump full index
  local-search reset                      Delete everything and start over
  local-search help                       This help
  local-search -v, --version             Print version and exit

JSON output (for agents):
  local-search json search <query> [repo]
  local-search json read <name>
  local-search json list [repo-or-project]
  local-search json repos
  local-search json related <name>
  local-search json tags
  local-search json stats

Supported file types:
  Indexed directly:         .md  .mdx  .txt
  With companion .md:       .jpg .jpeg .png .gif .webp .svg .pdf

File locations:
  Repo list:  ~/.local-search/repos
  Database:   ~/.local-search/specs.db
`)
}

// ── Repo file helpers ─────────────────────────────────────────────────────────

type repoEntry struct {
	Name            string
	Path            string
	SkipDirectories []string
}

func parseRepoEntryLine(line string) (repoEntry, bool) {
	parts := strings.SplitN(line, "|", 3)
	if len(parts) < 2 {
		return repoEntry{}, false
	}
	r := repoEntry{Name: parts[0], Path: parts[1]}
	if len(parts) == 3 && strings.TrimSpace(parts[2]) != "" {
		r.SkipDirectories = strings.Split(parts[2], ",")
	}
	norm, err := normalizeSkipDirectoryNames(r.SkipDirectories)
	if err != nil {
		return repoEntry{}, false
	}
	r.SkipDirectories = norm
	return r, true
}

func formatRepoEntryLine(r repoEntry) string {
	line := r.Name + "|" + r.Path
	if len(r.SkipDirectories) > 0 {
		norm, err := normalizeSkipDirectoryNames(r.SkipDirectories)
		if err == nil && len(norm) > 0 {
			line += "|" + strings.Join(norm, ",")
		}
	}
	return line
}

func loadRepos() []repoEntry {
	f, err := os.Open(reposFile)
	if err != nil {
		return nil
	}
	defer f.Close()

	var repos []repoEntry
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		if r, ok := parseRepoEntryLine(line); ok {
			repos = append(repos, r)
		}
	}
	return repos
}

func loadReposOrDie() []repoEntry {
	repos := loadRepos()
	if len(repos) == 0 {
		die("No repos added yet. Run: local-search repo add /path/to/specs")
	}
	return repos
}

func saveRepos(repos []repoEntry) {
	f, err := os.Create(reposFile)
	if err != nil {
		die(err.Error())
	}
	defer f.Close()
	for _, r := range repos {
		fmt.Fprintln(f, formatRepoEntryLine(r))
	}
}

func repoExists(repos []repoEntry, name, path string) bool {
	for _, r := range repos {
		if r.Name == name || r.Path == path {
			return true
		}
	}
	return false
}

// ── DB helper ─────────────────────────────────────────────────────────────────

func openDB() *sql.DB {
	if err := os.MkdirAll(appDir, 0755); err != nil {
		die(err.Error())
	}
	db, err := localdb.Open(dbFile)
	if err != nil {
		die("Cannot open database: " + err.Error())
	}
	if err := localdb.CreateSchema(db); err != nil {
		die("Cannot create schema: " + err.Error())
	}
	return db
}

// ── misc ──────────────────────────────────────────────────────────────────────

func die(msg string) {
	fmt.Fprintln(os.Stderr, "Error: "+msg)
	os.Exit(1)
}

// Suppress "imported and not used" for extract package used only indirectly via db/index.go
var _ = extract.TextExts
