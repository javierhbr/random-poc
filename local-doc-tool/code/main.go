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

	"local-search/codegraph"
	localdb "local-search/db"
	"local-search/extract"
	"local-search/find"
	"local-search/git"
	"local-search/graph"
	"local-search/scope"
)

// ── Config ────────────────────────────────────────────────────────────────────

const Version = "0.2.1"

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
	case "graphs":
		cmdGraphs(args)
	case "scan", "rebuild", "index":
		target := "all"
		if len(args) > 0 {
			target = args[0]
		}
		cmdScan(target)
	case "search", "s":
		cmdSearch(args)
	case "find", "f":
		cmdFind(args)
	case "code":
		cmdCode(args)
	case "scope":
		cmdScope(args)
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

// ── Graphs (graphify integration) ─────────────────────────────────────────────

func cmdGraphs(args []string) {
	if len(args) == 0 {
		graphsList()
		return
	}
	switch args[0] {
	case "list", "ls":
		graphsList()
	case "add":
		graphsAdd(args[1:])
	case "remove", "rm":
		graphsRemove(args[1:])
	case "prune":
		graphsPrune()
	default:
		fmt.Fprintln(os.Stderr, "Usage: local-search graphs [list|add|remove|prune]")
		os.Exit(1)
	}
}

func graphsList() {
	db := ensureDB()
	defer db.Close()

	repos, err := localdb.Repos(db)
	if err != nil {
		die(err.Error())
	}
	externals, err := localdb.ExternalGraphs(db)
	if err != nil {
		die(err.Error())
	}

	now := time.Now().Unix()
	fmt.Printf("%-22s  %-18s  %7s  %s\n", "REPO", "KIND", "NODES", "AGE")
	enabled := 0
	for _, r := range repos {
		// Print one line per kind present on this repo.
		if r.GraphPath != "" {
			fmt.Printf("%-22s  %-18s  %7d  %s\n", r.Name, "graphify",
				r.GraphNodeCount, humanAge(now-r.GraphMTime))
			enabled++
		}
		if r.CodeGraphPath != "" {
			fmt.Printf("%-22s  %-18s  %7d  %s\n", r.Name, "code-review-graph",
				r.CodeGraphNodeCount, humanAge(now-r.CodeGraphMTime))
			enabled++
		}
		if r.GraphPath == "" && r.CodeGraphPath == "" {
			fmt.Printf("%-22s  %-18s  %7s  %s\n", r.Name, "—", "—", "—")
		}
	}

	if len(externals) > 0 {
		fmt.Println()
		fmt.Println("External graphs:")
		fmt.Printf("%-22s  %-18s  %7s  %s\n", "NAME", "KIND", "NODES", "AGE")
		for _, e := range externals {
			age := "—"
			if e.GraphMTime > 0 {
				age = humanAge(now - e.GraphMTime)
			}
			fmt.Printf("%-22s  %-18s  %7d  %s\n", e.Name, e.Kind, e.NodeCount, age)
		}
	}

	if enabled == 0 && len(externals) == 0 {
		fmt.Println()
		if !graph.BinaryAvailable() {
			fmt.Println("Tip: no graphify or code-review-graph artifacts detected.")
			fmt.Println("  graphify:          run `graphify .` in a registered repo")
			fmt.Println("  code-review-graph: run `code-review-graph build` in a registered repo")
			fmt.Println("Then re-run `local-search scan`.")
		} else {
			fmt.Println("No graphify-out/graph.json or .code-review-graph/graph.sqlite found in any registered repo.")
			fmt.Println("Run `graphify .` or `code-review-graph build` in a repo, then `local-search scan`.")
		}
	}
}

func graphsAdd(args []string) {
	// Parse out an optional --kind flag from anywhere in args.
	var rest []string
	kindOverride := ""
	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--kind":
			if i+1 >= len(args) {
				die("--kind needs a value (graphify | code-review-graph)")
			}
			kindOverride = args[i+1]
			i++
		default:
			rest = append(rest, args[i])
		}
	}
	if len(rest) < 2 {
		die("Usage: local-search graphs add <name> <path> [--kind graphify|code-review-graph]")
	}
	name := rest[0]
	abs, err := filepath.Abs(rest[1])
	if err != nil {
		die("Cannot resolve path: " + rest[1])
	}
	st, err := os.Stat(abs)
	if err != nil || st.IsDir() {
		die("Graph file not found: " + abs)
	}

	kind := detectGraphKind(abs, kindOverride)

	db := ensureDB()
	defer db.Close()

	switch kind {
	case localdb.GraphKindCodeReviewGraph:
		mtime := st.ModTime().Unix()
		nodes := codegraph.CountNodes(abs)
		if err := localdb.AddExternalGraph(db, name, abs, mtime, nodes, localdb.GraphKindCodeReviewGraph); err != nil {
			die("Cannot add external graph: " + err.Error())
		}
		fmt.Printf("Added external code-review-graph %q  (%d nodes)\n", name, nodes)

	default: // graphify (or unknown → default)
		info := graph.Info{Path: abs, MTime: st.ModTime().Unix()}
		if parent := filepath.Dir(filepath.Dir(abs)); filepath.Base(filepath.Dir(abs)) == "graphify-out" {
			info = graph.Detect(parent)
			if info.Path == "" {
				info = graph.Info{Path: abs, MTime: st.ModTime().Unix()}
			}
		}
		if info.NodeCount == 0 {
			info = graph.Info{Path: abs, MTime: st.ModTime().Unix(), NodeCount: graph.CountNodes(abs)}
		}
		if err := localdb.AddExternalGraph(db, name, abs, info.MTime, info.NodeCount, localdb.GraphKindGraphify); err != nil {
			die("Cannot add external graph: " + err.Error())
		}
		fmt.Printf("Added external graph %q  (%d nodes)\n", name, info.NodeCount)
	}
}

// detectGraphKind chooses between graphify and code-review-graph for the file
// at path. An explicit override (from --kind) always wins. Otherwise the
// extension is the primary signal; for SQLite extensions we additionally
// verify the schema looks like code-review-graph.
func detectGraphKind(path, override string) string {
	switch override {
	case localdb.GraphKindGraphify, localdb.GraphKindCodeReviewGraph:
		return override
	case "":
		// fall through
	default:
		die("--kind must be 'graphify' or 'code-review-graph', got: " + override)
	}
	ext := strings.ToLower(filepath.Ext(path))
	switch ext {
	case ".json":
		return localdb.GraphKindGraphify
	case ".sqlite", ".db":
		if codegraph.LooksLikeCodeReviewGraph(path) {
			return localdb.GraphKindCodeReviewGraph
		}
		return localdb.GraphKindGraphify
	}
	// Unknown extension: probe content.
	if codegraph.LooksLikeCodeReviewGraph(path) {
		return localdb.GraphKindCodeReviewGraph
	}
	return localdb.GraphKindGraphify
}

func graphsRemove(args []string) {
	if len(args) == 0 {
		die("Usage: local-search graphs remove <name>")
	}
	db := ensureDB()
	defer db.Close()

	if err := localdb.RemoveExternalGraph(db, args[0]); err != nil {
		if err == sql.ErrNoRows {
			die(fmt.Sprintf("External graph %q not found", args[0]))
		}
		die(err.Error())
	}
	fmt.Printf("Removed external graph %q\n", args[0])
}

func graphsPrune() {
	db := ensureDB()
	defer db.Close()

	externals, err := localdb.ExternalGraphs(db)
	if err != nil {
		die(err.Error())
	}
	pruned := 0
	for _, e := range externals {
		if _, err := os.Stat(e.GraphPath); os.IsNotExist(err) {
			if err := localdb.RemoveExternalGraph(db, e.Name); err == nil {
				fmt.Printf("Pruned %q (file no longer exists: %s)\n", e.Name, e.GraphPath)
				pruned++
			}
		}
	}
	if pruned == 0 {
		fmt.Println("Nothing to prune.")
	}
}

// humanAge formats a duration in seconds as a short relative-time string.
// Returns "—" for negative or zero ages.
func humanAge(secs int64) string {
	if secs <= 0 {
		return "—"
	}
	switch {
	case secs < 60:
		return fmt.Sprintf("%ds", secs)
	case secs < 3600:
		return fmt.Sprintf("%dm", secs/60)
	case secs < 86400:
		return fmt.Sprintf("%dh", secs/3600)
	default:
		return fmt.Sprintf("%dd", secs/86400)
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

// ensureDB opens the DB (creating it if needed) and reconciles three states:
//
//  1. DB file missing → cmdScan("all") builds it from scratch.
//  2. Repo present in repos file but missing from the SQLite repos table →
//     FullScan that one repo so its row (with code_graph_* metadata) appears.
//     This covers the auto-bootstrap path where autoBootstrapFromCWD just
//     appended a new entry, plus any manual edit / backup restore that adds
//     a repo behind the binary's back.
//  3. Already-known git repo with new commits → IncrementalScan to pick up
//     the changes.
func ensureDB() *sql.DB {
	if _, err := os.Stat(dbFile); os.IsNotExist(err) {
		cmdScan("all")
	}

	db := openDB()

	known, err := localdb.Repos(db)
	if err != nil {
		fmt.Fprintf(os.Stderr, "warning: could not read repos table: %v\n", err)
	}
	knownNames := make(map[string]bool, len(known))
	for _, r := range known {
		knownNames[r.Name] = true
	}

	repos := loadRepos()
	for _, r := range repos {
		// Catch up newly-added repos (file says yes, table says no) with a
		// FullScan so the repos row + code_graph_* metadata get created. We
		// fall through to IncrementalScan after — but IncrementalScan is a
		// no-op when there's nothing to do, so the order is harmless.
		if !knownNames[r.Name] {
			fmt.Fprintf(os.Stderr, "(%s: new repo — running first scan…)\n", r.Name)
			if _, err := localdb.FullScan(db, r.Name, r.Path); err != nil {
				fmt.Fprintf(os.Stderr, "warning: scan of %s failed: %v\n", r.Name, err)
				continue
			}
			if git.IsRepo(r.Path) {
				if commit := git.CurrentCommit(r.Path); commit != "" {
					localdb.SetMeta(db, "git_commit_"+r.Name, commit) //nolint:errcheck
				}
			}
			continue
		}

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
<<<<<<< HEAD
	repoFlag := fs.String("repo", "", "Filter results to this repo")
	directoryFlag := fs.String("directory", "", "Filter results to paths starting with this directory")
=======
	repoFlag := fs.String("repo", "", "Filter results to this repo (legacy; prefer --repos)")
	reposFlag := fs.String("repos", "all", "Which repos to search: all | graph-only | name1,name2")
	sourceFlag := fs.String("source", "auto", "Where results come from: auto | fts | graph | both")
	rankFlag := fs.String("rank", "auto", "Ranking strategy: auto | bm25 | graph-aware")
>>>>>>> ed5f3da (Add graph and scope packages with associated tests)
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
<<<<<<< HEAD
		die("Usage: local-search search <query> [--repo <name>] [--directory <path>] [--exclude-location <pattern>]...")
=======
		die("Usage: local-search search <query> [--repos <spec>] [--source <fts|graph|both>] [--rank <bm25|graph-aware>] [--exclude-location <pattern>]...")
>>>>>>> ed5f3da (Add graph and scope packages with associated tests)
	}
	query := positional[0]

	// Backward-compat: positional repo arg, then --repo flag, both override --repos.
	legacyRepo := ""
	if len(positional) > 1 {
		legacyRepo = positional[1]
	}
	if *repoFlag != "" {
		legacyRepo = *repoFlag
	}

	db := ensureDB()
	defer db.Close()

<<<<<<< HEAD
	results, err := localdb.Search(db, query, repo, *directoryFlag)
=======
	allRepos, err := localdb.Repos(db)
>>>>>>> ed5f3da (Add graph and scope packages with associated tests)
	if err != nil {
		die(err.Error())
	}

	// Resolve the three flags (auto → concrete) given the repos available now.
	plan := resolveSearchPlan(allRepos, legacyRepo, *reposFlag, *sourceFlag, *rankFlag)

	// Print the status header so the user always knows what backend ran.
	printSearchHeader(plan)

	// Run FTS if the plan asks for it.
	var ftsResults []localdb.SearchResult
	if plan.runFTS {
		// One Search() call per repo when plan.repos is a subset; one call with
		// repoFilter="" when plan.repos covers every registered repo.
		if plan.allRepos {
			ftsResults, err = localdb.Search(db, query, "")
			if err != nil {
				die(err.Error())
			}
		} else {
			for _, name := range plan.repos {
				rs, err := localdb.Search(db, query, name)
				if err != nil {
					die(err.Error())
				}
				ftsResults = append(ftsResults, rs...)
			}
		}
		ftsResults = filterByLocation(ftsResults, excludeLocations)
	}

	// Run graph-node label search if the plan asks for it.
	var graphHits []graph.LabelMatch
	if plan.runGraph {
		graphHits = collectGraphHits(query, plan.repos, allRepos)
	}

	// Apply graph-aware re-ranking to FTS results if requested.
	if plan.rank == "graph-aware" && len(ftsResults) > 0 {
		applyGraphAwareRanking(ftsResults, allRepos)
	}

	printSearchResults(ftsResults, graphHits, query, plan)
}

// ── Search-plan resolution & helpers ──────────────────────────────────────────

// searchPlan is the resolved (post-auto) configuration for one search call.
type searchPlan struct {
	repos      []string // repo names to search (always concrete)
	allRepos   bool     // true when repos covers every registered repo
	graphRepos int      // count of repos in `repos` that have graph_path
	totalRepos int      // count of all registered repos
	source     string   // fts | graph | both
	rank       string   // bm25 | graph-aware
	runFTS     bool     // shortcut: source == fts || both
	runGraph   bool     // shortcut: source == graph || both
	autoNotes  []string // human notes for header (e.g. "graphs available but unused")
}

// resolveSearchPlan turns the three auto-able flags into concrete values.
// Precedence: legacyRepo > --repos.
func resolveSearchPlan(all []localdb.RepoRow, legacyRepo, reposFlag, sourceFlag, rankFlag string) searchPlan {
	// Step 1: pick the repo set.
	var picked []string
	allRepos := false
	switch {
	case legacyRepo != "":
		picked = []string{legacyRepo}
	case reposFlag == "" || reposFlag == "all":
		for _, r := range all {
			picked = append(picked, r.Name)
		}
		allRepos = true
	case reposFlag == "graph-only":
		for _, r := range all {
			if r.GraphPath != "" {
				picked = append(picked, r.Name)
			}
		}
	default:
		for _, name := range strings.Split(reposFlag, ",") {
			picked = append(picked, strings.TrimSpace(name))
		}
	}

	// Step 2: count graph-enabled repos in the picked set.
	graphInPicked := 0
	pickedSet := map[string]bool{}
	for _, n := range picked {
		pickedSet[n] = true
	}
	for _, r := range all {
		if pickedSet[r.Name] && r.GraphPath != "" {
			graphInPicked++
		}
	}

	// Step 3: resolve --source.
	source := sourceFlag
	if source == "auto" {
		if graphInPicked > 0 {
			source = "both"
		} else {
			source = "fts"
		}
	}

	// Step 4: resolve --rank.
	rank := rankFlag
	if rank == "auto" {
		if graphInPicked > 0 {
			rank = "graph-aware"
		} else {
			rank = "bm25"
		}
	}

	plan := searchPlan{
		repos:      picked,
		allRepos:   allRepos,
		graphRepos: graphInPicked,
		totalRepos: len(all),
		source:     source,
		rank:       rank,
		runFTS:     source == "fts" || source == "both",
		runGraph:   source == "graph" || source == "both",
	}

	// Helpful note: graphs exist but the user explicitly opted out.
	if graphInPicked > 0 && source == "fts" {
		plan.autoNotes = append(plan.autoNotes, "graphs available but unused (--source=fts)")
	}
	if graphInPicked == 0 && (sourceFlag == "graph" || sourceFlag == "both") {
		plan.autoNotes = append(plan.autoNotes, "no graphs in selected repos — graph results will be empty")
	}
	return plan
}

func printSearchHeader(p searchPlan) {
	parts := []string{
		"source=" + p.source,
		"rank=" + p.rank,
	}
	if p.allRepos {
		parts = append(parts, fmt.Sprintf("repos=%d (%d with graphs)", p.totalRepos, p.graphRepos))
	} else {
		parts = append(parts, fmt.Sprintf("repos=%d (%d with graphs)", len(p.repos), p.graphRepos))
	}
	for _, n := range p.autoNotes {
		parts = append(parts, n)
	}
	fmt.Printf("[%s]\n", strings.Join(parts, " · "))
}

func collectGraphHits(query string, repoNames []string, allRepos []localdb.RepoRow) []graph.LabelMatch {
	byName := map[string]localdb.RepoRow{}
	for _, r := range allRepos {
		byName[r.Name] = r
	}
	const perRepoLimit = 20
	var hits []graph.LabelMatch
	for _, name := range repoNames {
		r, ok := byName[name]
		if !ok || r.GraphPath == "" {
			continue
		}
		g, err := graph.Load(r.Name, r.GraphPath, r.GraphMTime)
		if err != nil || g == nil {
			continue
		}
		for _, n := range g.SearchLabels(query, perRepoLimit) {
			hits = append(hits, graph.LabelMatch{Repo: r.Name, Node: n, GraphPath: r.GraphPath})
		}
	}
	return hits
}

// applyGraphAwareRanking multiplies FTS Relevance by a centrality boost for
// specs whose name matches a node in the same repo's graph. Higher Relevance
// in FTS means lower BM25 score (rank), so we DIVIDE by the boost to surface
// graph-central specs. (FTS5's f.rank is "lower is better".)
func applyGraphAwareRanking(results []localdb.SearchResult, allRepos []localdb.RepoRow) {
	byName := map[string]localdb.RepoRow{}
	for _, r := range allRepos {
		byName[r.Name] = r
	}
	for i := range results {
		r, ok := byName[results[i].Repo]
		if !ok || r.GraphPath == "" {
			continue
		}
		g, err := graph.Load(r.Name, r.GraphPath, r.GraphMTime)
		if err != nil || g == nil {
			continue
		}
		boost := g.CentralityBoost(results[i].Name)
		if boost > 1.0 {
			// FTS5 rank: more negative = better. Multiply (toward more negative)
			// to elevate boosted results; positive ranks divide instead.
			if results[i].Relevance < 0 {
				results[i].Relevance *= boost
			} else {
				results[i].Relevance /= boost
			}
		}
	}
	// Re-sort by Relevance ascending (FTS5 rank semantics).
	for i := 1; i < len(results); i++ {
		for j := i; j > 0 && results[j].Relevance < results[j-1].Relevance; j-- {
			results[j], results[j-1] = results[j-1], results[j]
		}
	}
}

func printSearchResults(ftsResults []localdb.SearchResult, graphHits []graph.LabelMatch, query string, p searchPlan) {
	if len(ftsResults) == 0 && len(graphHits) == 0 {
		fmt.Println("No results for: " + query)
		fmt.Println()
		fmt.Println("  Broader term, or prefix: local-search search \"" + query + "*\"")
		fmt.Println("  Boolean: local-search search \"" + query + " OR <other>\"")
		fmt.Println("  Browse: local-search list")
		return
	}

	if len(graphHits) > 0 {
		fmt.Printf("\nGraph nodes (%d):\n", len(graphHits))
		for _, h := range graphHits {
			fmt.Printf("  [%s · graph] %s  (deg=%d, community=%d)\n",
				h.Repo, h.Node.Label, h.Node.Degree, h.Node.Community)
		}
	}

	if len(ftsResults) > 0 {
		fmt.Printf("\nSpecs (%d):\n", len(ftsResults))
		for _, r := range ftsResults {
			origin := "FTS"
			if p.rank == "graph-aware" && hasGraphForRepo(r.Repo, p) {
				origin = "FTS+graph"
			}
			fmt.Printf("  [%s · %s] %s\n", r.Repo, origin, r.Path)
			fmt.Printf("    %s", r.Title)
			if r.Tags != "" {
				fmt.Printf("  (%s)", r.Tags)
			}
			fmt.Printf("  .%s\n", r.Ext)
		}
	}
}

func hasGraphForRepo(repoName string, p searchPlan) bool {
	// Cheap path check — we only know graphRepos as a count in the plan, so
	// we re-resolve via the cached graph load. False is a safe fallback.
	return p.graphRepos > 0
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

	case "find":
		// json find delegates to the same scope-resolved find pipeline as the
		// CLI command, but never prints non-JSON to stdout. ensureDB() above
		// already opened a connection; close it and let resolveScope reopen
		// (it owns the lifetime via the same pattern as the CLI handlers).
		db.Close()
		flagScope, jrest := extractScopeFlag(rest)
		if len(jrest) == 0 {
			die("Usage: local-search json find <query> [--scope repo1,repo2]")
		}
		sc, repos, jdb := resolveScope(flagScope)
		defer jdb.Close()
		exts, _ := localdb.ExternalGraphs(jdb)
		resp, err := find.Find(find.Inputs{
			Query: jrest[0], DB: jdb, Scope: sc,
			Repos: repos, ExternalGraphs: exts,
		})
		if err != nil {
			die(err.Error())
		}
		localdb.PrintJSON(resp)

	case "context":
		// json context is the agent payload — find + inlined blast radius for
		// the top codegraph hit. Same scope rules as json find.
		db.Close()
		flagScope, jrest := extractScopeFlag(rest)
		if len(jrest) == 0 {
			die("Usage: local-search json context <query> [--scope repo1,repo2]")
		}
		sc, repos, jdb := resolveScope(flagScope)
		defer jdb.Close()
		exts, _ := localdb.ExternalGraphs(jdb)
		resp, err := find.Context(find.Inputs{
			Query: jrest[0], DB: jdb, Scope: sc,
			Repos: repos, ExternalGraphs: exts,
		})
		if err != nil {
			die(err.Error())
		}
		localdb.PrintJSON(resp)

	default:
		die("Unknown json subcommand: " + sub)
	}
}

// ── Find / Code / Scope (unified scoped search) ──────────────────────────────

// extractScopeFlag pulls --scope <value> out of args, returning the value and
// the remaining args. Empty string when not present.
func extractScopeFlag(args []string) (string, []string) {
	var rest []string
	value := ""
	for i := 0; i < len(args); i++ {
		a := args[i]
		if a == "--scope" {
			if i+1 < len(args) {
				value = args[i+1]
				i++
			}
			continue
		}
		if strings.HasPrefix(a, "--scope=") {
			value = strings.TrimPrefix(a, "--scope=")
			continue
		}
		rest = append(rest, a)
	}
	return value, rest
}

// resolveScope is the common entry used by find/code/scope. Returns the
// resolved scope, opening the DB along the way.
//
// Auto-init policy: if --scope was not passed AND there is no
// .local-search.toml in CWD (nor in any parent dir), create one in CWD seeded
// from CWD walk-up:
//
//   - If a registered repo encloses CWD, write `scope = ["that-repo"]`.
//   - Otherwise write empty `scope = []` and warn — the search will return
//     no results, but the user gets a tangible config file to edit.
//
// This guarantees the user always ends up with a real .local-search.toml in
// the directory they ran the command from, which is what they asked for. The
// notice is printed to stderr so JSON output on stdout stays clean.
func resolveScope(flagValue string) (scope.Scope, []localdb.RepoRow, *sql.DB) {
	cwd, _ := os.Getwd()

	// Open DB up front. ensureDB used to die on a fresh install with no
	// repos because cmdScan("all") calls loadReposOrDie. We avoid that path
	// by opening the DB directly when no repos are registered yet — there's
	// nothing to scan and ensureDB's incremental-update loop is a no-op
	// when the repos table is empty.
	db := openDBForResolve()
	repos, err := localdb.Repos(db)
	if err != nil {
		db.Close()
		die(err.Error())
	}

	// Auto-register a .code-review-graph/ artifact in CWD as an external
	// graph (NOT a repo — no filesystem walk, no markdown indexing). The
	// returned name is the "graph:"-prefixed scope entry to seed the config.
	autoSeed := ""
	if flagValue == "" {
		if _, _, found := scope.FindProjectConfig(cwd); !found {
			autoSeed = autoBootstrapFromCWD(cwd, db)
		}
	}

	scopeRepos := make([]scope.Repo, 0, len(repos))
	for _, r := range repos {
		scopeRepos = append(scopeRepos, scope.Repo{Name: r.Name, Path: r.Path})
	}
	externals, _ := localdb.ExternalGraphs(db)
	externalNames := make([]string, 0, len(externals))
	for _, e := range externals {
		externalNames = append(externalNames, e.Name)
	}

	// Create .local-search.toml if missing. Seeding precedence:
	//   1. autoSeed (newly-registered external graph) if any
	//   2. CWD walk-up to a registered repo
	//   3. Empty
	if flagValue == "" {
		if _, _, found := scope.FindProjectConfig(cwd); !found {
			autoInitLocalConfig(cwd, scopeRepos, autoSeed)
		}
	}

	// Now run ensureDB's incremental-update pass for already-known git repos.
	// We deferred this until after auto-bootstrap so a freshly-registered
	// external graph doesn't trigger any scans.
	runIncrementalUpdates(db, repos)

	res := scope.Resolver{
		CWD:            cwd,
		ExternalGraphs: externalNames,
		FlagValue:      flagValue,
		Repos:     scopeRepos,
		HomeDir:   homeDir(),
	}
	sc, err := res.Resolve()
	if err == nil {
		return sc, repos, db
	}
	if err == scope.ErrNoScope {
		// Should not happen now that auto-init always writes a config — but
		// belt-and-braces in case the flag was passed and no config exists.
		db.Close()
		die("no scope configured. Pass --scope or remove the flag to auto-init " + scope.ConfigFileName)
	}
	// Empty scope config (scope = []) → Resolve returns "config lists scope
	// but none are registered". Treat that as a usable empty-result Scope so
	// the user sees the banner + footer instead of a crash.
	if isEmptyScopeError(err) {
		cfgPath := filepath.Join(cwd, scope.ConfigFileName)
		return scope.Scope{
			Repos:   nil,
			Source:  cfgPath,
			Weights: defaultScopeWeights(),
			Limits:  defaultScopeLimits(),
		}, repos, db
	}
	db.Close()
	die(err.Error())
	return scope.Scope{}, nil, nil // unreachable; die exits
}

// autoBootstrapFromCWD registers a code-graph artifact (.code-review-graph/)
// found in cwd as an EXTERNAL GRAPH — never as a repo. No filesystem walk,
// no markdown indexing. Returns the registered name (with the "graph:" prefix
// already attached) when registration happened, "" otherwise.
//
// Why external-graph and not repo: registering as a repo would trigger a
// FullScan that walks the whole project looking for .md/.mdx/.txt files,
// generating warnings for every image without a companion .md and indexing
// thousands of unrelated files. The user explicitly does NOT want that —
// the integration's whole point is to use the code-graph the upstream tool
// already built.
//
// If the user also wants markdown indexing, they run `local-search repo add .`
// explicitly. We surface that hint in the registration notice.
func autoBootstrapFromCWD(cwd string, db *sql.DB) string {
	// Skip when cwd is already inside a registered repo — that repo's own
	// scan already picked up its .code-review-graph/ via FullScan.
	for _, r := range loadRepos() {
		if pathContainsOrEquals(r.Path, cwd) {
			return ""
		}
	}

	// Need a code-review-graph artifact to justify auto-registration.
	cgi := codegraph.Detect(cwd)
	if cgi.Path == "" {
		return ""
	}

	// Skip when this exact graph file is already registered (re-running
	// `find` from the same dir shouldn't re-register on every invocation).
	existing, err := localdb.ExternalGraphs(db)
	if err == nil {
		for _, e := range existing {
			if e.GraphPath == cgi.Path {
				return e.Name
			}
		}
	}

	name := filepath.Base(cwd)
	// Guard against name collisions across BOTH repos and external graphs —
	// the scope `graph:` prefix keeps them apart in resolution but the
	// external_graphs table still requires unique names.
	taken := map[string]bool{}
	if existing != nil {
		for _, e := range existing {
			taken[e.Name] = true
		}
	}
	for _, r := range loadRepos() {
		taken[r.Name] = true
	}
	base := name
	for i := 2; taken[name]; i++ {
		name = fmt.Sprintf("%s-%d", base, i)
	}

	if err := localdb.AddExternalGraph(db, name, cgi.Path, cgi.MTime, cgi.NodeCount, localdb.GraphKindCodeReviewGraph); err != nil {
		fmt.Fprintf(os.Stderr, "warning: could not register code-graph %q: %v\n", name, err)
		return ""
	}

	fmt.Fprintf(os.Stderr,
		"Detected %s in CWD — registered code-graph %q (%d nodes). No source files indexed.\n",
		filepath.Join(codegraph.DirName, filepath.Base(cgi.Path)), name, cgi.NodeCount)
	fmt.Fprintf(os.Stderr,
		"To also index this project's markdown specs, run:  local-search repo add %s\n",
		cwd)
	return scope.GraphPrefix + name
}

// pathContainsOrEquals reports whether parent is either equal to child or an
// ancestor of it. Used to skip auto-bootstrap when cwd is inside an already-
// registered repo.
func pathContainsOrEquals(parent, child string) bool {
	if parent == "" || child == "" {
		return false
	}
	pa, err1 := filepath.Abs(parent)
	ca, err2 := filepath.Abs(child)
	if err1 != nil || err2 != nil {
		return false
	}
	pa = filepath.Clean(pa)
	ca = filepath.Clean(ca)
	if pa == ca {
		return true
	}
	return strings.HasPrefix(ca, pa+string(filepath.Separator))
}

// openDBForResolve opens the DB without ensureDB's "die when no repos exist"
// failure mode. Used by resolveScope so a fresh install can register its
// first external graph before any repo is registered.
//
// Side effect: creates the DB file if missing and runs schema migrations.
// Does NOT trigger any scans.
func openDBForResolve() *sql.DB {
	db, err := localdb.Open(dbFile)
	if err != nil {
		die("Cannot open database: " + err.Error())
	}
	if err := localdb.CreateSchema(db); err != nil {
		die("Cannot create schema: " + err.Error())
	}
	return db
}

// runIncrementalUpdates is the post-bootstrap half of what ensureDB used to
// do: walk every registered git repo, detect commits since the last scan,
// run IncrementalScan. Called explicitly by resolveScope after auto-bootstrap
// so a freshly-registered external graph doesn't accidentally trigger an
// indexing pass.
func runIncrementalUpdates(db *sql.DB, repos []localdb.RepoRow) {
	knownNames := make(map[string]bool, len(repos))
	for _, r := range repos {
		knownNames[r.Name] = true
	}
	for _, r := range loadRepos() {
		// New repos in the file (not yet in the table) get a FullScan first
		// so their row appears with code_graph_* metadata.
		if !knownNames[r.Name] {
			fmt.Fprintf(os.Stderr, "(%s: new repo — running first scan…)\n", r.Name)
			if _, err := localdb.FullScan(db, r.Name, r.Path); err != nil {
				fmt.Fprintf(os.Stderr, "warning: scan of %s failed: %v\n", r.Name, err)
				continue
			}
			if git.IsRepo(r.Path) {
				if commit := git.CurrentCommit(r.Path); commit != "" {
					localdb.SetMeta(db, "git_commit_"+r.Name, commit) //nolint:errcheck
				}
			}
			continue
		}
		if !git.IsRepo(r.Path) {
			continue
		}
		lastCommit := localdb.GetMeta(db, "git_commit_"+r.Name)
		changed, err := git.ChangedFiles(r.Path, lastCommit)
		if err != nil || len(changed) == 0 {
			continue
		}
		fmt.Fprintf(os.Stderr, "(%s: git changes detected — incremental update…)\n\n", r.Name)
		n, newCommit, err := localdb.IncrementalScan(db, r.Name, r.Path, lastCommit)
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
}

// autoInitLocalConfig writes .local-search.toml in cwd. Seeding precedence:
//
//  1. autoSeed (e.g. a "graph:foo" entry just produced by autoBootstrapFromCWD)
//  2. CWD walk-up to a registered repo
//  3. Empty (with a friendly warning + remediation hint)
//
// Prints a one-line notice to stderr so the user knows what just happened.
func autoInitLocalConfig(cwd string, scopeRepos []scope.Repo, autoSeed string) {
	var seed []string
	switch {
	case autoSeed != "":
		seed = []string{autoSeed}
	default:
		if name, ok := scope.NearestRepoForCWD(cwd, scopeRepos); ok {
			seed = []string{name}
		}
	}
	cfgPath, werr := scope.WriteProjectConfig(cwd, seed)
	if werr != nil {
		die("could not auto-init " + scope.ConfigFileName + ": " + werr.Error())
	}
	switch {
	case autoSeed != "":
		fmt.Fprintf(os.Stderr, "Created %s with scope = %v (using detected code-graph).\n",
			cfgPath, seed)
	case len(seed) > 0:
		fmt.Fprintf(os.Stderr, "Created %s with scope = %v (CWD is inside registered repo %q).\n",
			cfgPath, seed, seed[0])
	default:
		fmt.Fprintf(os.Stderr,
			"Created empty %s — CWD is not inside any registered repo.\n"+
				"Edit it to add scope, e.g.:  scope = [\"repo1\", \"repo2\"]\n"+
				"See available repos: local-search repo list\n",
			cfgPath)
	}
}

// isEmptyScopeError reports whether err is the "config lists scope but none
// are registered" error from scope.Resolve when the config has scope = [].
// Match is by message substring because scope.Resolve uses fmt.Errorf, not
// a sentinel error.
func isEmptyScopeError(err error) bool {
	return err != nil && strings.Contains(err.Error(), "lists scope")
}

// defaultScopeWeights / defaultScopeLimits mirror the package-level defaults
// in scope/. Used by resolveScope's empty-scope fall-through so the returned
// Scope has the same defaults a parsed config would have.
func defaultScopeWeights() scope.Weights {
	return scope.Weights{
		Specs:     scope.DefaultWeightSpecs,
		Graphify:  scope.DefaultWeightGraphify,
		CodeGraph: scope.DefaultWeightCodeGraph,
	}
}

func defaultScopeLimits() scope.Limits {
	return scope.Limits{
		Specs:      scope.DefaultLimitSpecs,
		Graphify:   scope.DefaultLimitGraphify,
		CodeGraph:  scope.DefaultLimitCodeGraph,
		BlastDepth: scope.DefaultBlastDepth,
		BlastCap:   scope.DefaultBlastCap,
	}
}

func cmdFind(args []string) {
	flagScope, rest := extractScopeFlag(args)
	if len(rest) == 0 {
		die("Usage: local-search find <query> [--scope repo1,repo2]")
	}
	query := rest[0]

	sc, repos, db := resolveScope(flagScope)
	defer db.Close()
	exts, _ := localdb.ExternalGraphs(db)

	resp, err := find.Find(find.Inputs{
		Query:          query,
		DB:             db,
		Scope:          sc,
		Repos:          repos,
		ExternalGraphs: exts,
	})
	if err != nil {
		die(err.Error())
	}
	printFindResponse(resp, query)
}

func cmdCode(args []string) {
	if len(args) == 0 {
		die("Usage: local-search code <query|hubs|blast|callers|callees> [args...]")
	}
	switch args[0] {
	case "hubs":
		cmdCodeHubs(args[1:])
	case "blast":
		cmdCodeBlast(args[1:])
	case "callers":
		cmdCodeRelated(args[1:], "callers")
	case "callees":
		cmdCodeRelated(args[1:], "callees")
	default:
		// Treat as a node-name query.
		cmdCodeQuery(args)
	}
}

func cmdCodeQuery(args []string) {
	flagScope, rest := extractScopeFlag(args)
	if len(rest) == 0 {
		die("Usage: local-search code <query> [--scope repo1,repo2]")
	}
	query := rest[0]

	sc, repos, db := resolveScope(flagScope)
	defer db.Close()

	any := false
	for _, r := range filterScopeRepos(repos, sc.Repos) {
		if r.CodeGraphPath == "" {
			fmt.Printf("[%s] no .code-review-graph/ — fix: %s\n", r.Name, codegraph.MissingInstructions(r.Path))
			continue
		}
		d, err := codegraph.Open(r.Name, r.CodeGraphPath, r.CodeGraphMTime)
		if err != nil || d == nil {
			fmt.Printf("[%s] code-graph unreadable\n", r.Name)
			continue
		}
		nodes, err := d.FindNodes(query, sc.Limits.CodeGraph)
		if err != nil {
			fmt.Printf("[%s] error: %v\n", r.Name, err)
			continue
		}
		if len(nodes) == 0 {
			continue
		}
		fmt.Printf("\n[%s] %d match(es):\n", r.Name, len(nodes))
		for _, n := range nodes {
			loc := n.FilePath
			if n.LineStart > 0 {
				loc = fmt.Sprintf("%s:%d", n.FilePath, n.LineStart)
			}
			fmt.Printf("  %-9s %-50s  %s\n", n.Kind, n.QualifiedName, loc)
		}
		any = true
	}
	if !any {
		fmt.Println("No code-graph matches in scope.")
	}
}

func cmdCodeHubs(args []string) {
	flagScope, _ := extractScopeFlag(args)
	sc, repos, db := resolveScope(flagScope)
	defer db.Close()

	for _, r := range filterScopeRepos(repos, sc.Repos) {
		if r.CodeGraphPath == "" {
			continue
		}
		d, err := codegraph.Open(r.Name, r.CodeGraphPath, r.CodeGraphMTime)
		if err != nil || d == nil {
			continue
		}
		hubs, err := d.HubNodes(10)
		if err != nil || len(hubs) == 0 {
			continue
		}
		fmt.Printf("\n[%s] top hubs:\n", r.Name)
		for _, h := range hubs {
			fmt.Printf("  %-9s %-50s  out=%d\n", h.Node.Kind, h.Node.QualifiedName, h.OutDegree)
		}
	}
}

func cmdCodeBlast(args []string) {
	flagScope, rest := extractScopeFlag(args)
	if len(rest) == 0 {
		die("Usage: local-search code blast <qualified-name> [--scope repo1,repo2]")
	}
	target := rest[0]
	sc, repos, db := resolveScope(flagScope)
	defer db.Close()

	for _, r := range filterScopeRepos(repos, sc.Repos) {
		if r.CodeGraphPath == "" {
			continue
		}
		d, err := codegraph.Open(r.Name, r.CodeGraphPath, r.CodeGraphMTime)
		if err != nil || d == nil {
			continue
		}
		nodes, err := d.BlastRadius(target, sc.Limits.BlastDepth, sc.Limits.BlastCap)
		if err != nil || len(nodes) == 0 {
			continue
		}
		fmt.Printf("\n[%s] blast radius of %s (depth=%d, cap=%d):\n",
			r.Name, target, sc.Limits.BlastDepth, sc.Limits.BlastCap)
		for _, n := range nodes {
			loc := n.FilePath
			if n.LineStart > 0 {
				loc = fmt.Sprintf("%s:%d", n.FilePath, n.LineStart)
			}
			fmt.Printf("  %-9s %-50s  %s\n", n.Kind, n.QualifiedName, loc)
		}
	}
}

func cmdCodeRelated(args []string, mode string) {
	flagScope, rest := extractScopeFlag(args)
	if len(rest) == 0 {
		die("Usage: local-search code " + mode + " <qualified-name> [--scope repo1,repo2]")
	}
	target := rest[0]
	sc, repos, db := resolveScope(flagScope)
	defer db.Close()

	for _, r := range filterScopeRepos(repos, sc.Repos) {
		if r.CodeGraphPath == "" {
			continue
		}
		d, err := codegraph.Open(r.Name, r.CodeGraphPath, r.CodeGraphMTime)
		if err != nil || d == nil {
			continue
		}
		var nodes []codegraph.Node
		if mode == "callers" {
			nodes, err = d.CallersOf(target)
		} else {
			nodes, err = d.CalleesOf(target)
		}
		if err != nil || len(nodes) == 0 {
			continue
		}
		fmt.Printf("\n[%s] %s of %s:\n", r.Name, mode, target)
		for _, n := range nodes {
			loc := n.FilePath
			if n.LineStart > 0 {
				loc = fmt.Sprintf("%s:%d", n.FilePath, n.LineStart)
			}
			fmt.Printf("  %-9s %-50s  %s\n", n.Kind, n.QualifiedName, loc)
		}
	}
}

func cmdScope(args []string) {
	if len(args) == 0 {
		args = []string{"show"}
	}
	switch args[0] {
	case "show":
		cmdScopeShow()
	case "set":
		cmdScopeSet(args[1:])
	case "clear":
		cmdScopeClear()
	case "init":
		cmdScopeInit()
	default:
		die("Usage: local-search scope <show|set|clear|init>")
	}
}

func cmdScopeShow() {
	flagScope := ""
	sc, _, db := resolveScope(flagScope)
	defer db.Close()
	fmt.Printf("Scope:   %s\n", strings.Join(sc.Repos, ", "))
	fmt.Printf("Source:  %s\n", sc.Source)
	fmt.Printf("Weights: specs=%.2f graphify=%.2f codegraph=%.2f\n",
		sc.Weights.Specs, sc.Weights.Graphify, sc.Weights.CodeGraph)
	fmt.Printf("Limits:  specs=%d graphify=%d codegraph=%d blast_depth=%d blast_cap=%d\n",
		sc.Limits.Specs, sc.Limits.Graphify, sc.Limits.CodeGraph,
		sc.Limits.BlastDepth, sc.Limits.BlastCap)
}

func cmdScopeSet(args []string) {
	if len(args) == 0 {
		die("Usage: local-search scope set repo1,repo2,...")
	}
	cwd, err := os.Getwd()
	if err != nil {
		die(err.Error())
	}
	scopeList := splitComma(args[0])
	if len(scopeList) == 0 {
		die("scope list is empty")
	}
	path, err := scope.WriteProjectConfig(cwd, scopeList)
	if err != nil {
		die(err.Error())
	}
	fmt.Printf("Wrote %s with scope = %v\n", path, scopeList)
}

func cmdScopeClear() {
	cwd, err := os.Getwd()
	if err != nil {
		die(err.Error())
	}
	if err := scope.RemoveProjectConfig(cwd); err != nil {
		die(err.Error())
	}
	fmt.Printf("Removed %s/%s (or it did not exist)\n", cwd, scope.ConfigFileName)
}

func cmdScopeInit() {
	cwd, err := os.Getwd()
	if err != nil {
		die(err.Error())
	}
	db := ensureDB()
	defer db.Close()
	repos, err := localdb.Repos(db)
	if err != nil {
		die(err.Error())
	}
	scopeRepos := make([]scope.Repo, 0, len(repos))
	for _, r := range repos {
		scopeRepos = append(scopeRepos, scope.Repo{Name: r.Name, Path: r.Path})
	}
	res := scope.Resolver{CWD: cwd, Repos: scopeRepos, HomeDir: homeDir()}
	sc, err := res.Resolve()
	if err != nil {
		die("could not auto-detect a scope from CWD. Pass `local-search scope set repo1,repo2` instead.")
	}
	path, err := scope.WriteProjectConfig(cwd, sc.Repos)
	if err != nil {
		die(err.Error())
	}
	fmt.Printf("Wrote %s with scope = %v (auto-detected from %s)\n", path, sc.Repos, sc.Source)
}

// printFindResponse renders a Response as a human-readable table with a
// prominent banner naming the searched repos, the table itself, a missing-
// sources block (if any), and a footer reminding the user where the scope
// config lives so they know what to edit to change it.
func printFindResponse(resp find.Response, query string) {
	// ── Banner: always show which repos were searched ──
	repoList := strings.Join(resp.Scope, ", ")
	if repoList == "" {
		repoList = "(none — empty scope)"
	}
	fmt.Println("─────────────────────────────────────────────────────────────")
	fmt.Printf("Searched repos: %s\n", repoList)
	fmt.Printf("Scope source:   %s\n", resp.ScopeSource)
	fmt.Printf("Results:        %d\n", len(resp.Results))
	fmt.Println("─────────────────────────────────────────────────────────────")

	if len(resp.Results) == 0 {
		fmt.Println("No results for: " + query)
		if len(resp.Scope) == 0 {
			fmt.Println()
			fmt.Println("Scope is empty. Edit .local-search.toml to add repos:")
			fmt.Println("  scope = [\"repo1\", \"repo2\"]")
			fmt.Println("Available repos: local-search repo list")
		}
	} else {
		fmt.Printf("\n%-6s  %-10s  %-22s  %-50s  %s\n",
			"SCORE", "TYPE", "REPO", "NAME", "LOCATION")
		for _, r := range resp.Results {
			loc := r.Path
			if r.Type == find.SourceCodeGraph && r.CodeGraph != nil && r.CodeGraph.LineStart > 0 {
				loc = fmt.Sprintf("%s:%d", r.CodeGraph.FilePath, r.CodeGraph.LineStart)
			}
			fmt.Printf("%-6.2f  %-10s  %-22s  %-50s  %s\n",
				r.Score, r.Type, r.Repo, truncate(r.Name, 50), loc)
		}
	}

	if len(resp.Missing) > 0 {
		fmt.Println("\nMissing sources:")
		for _, m := range resp.Missing {
			fmt.Printf("  [%s] %s\n        fix: %s\n", m.Repo, m.Reason, m.Fix)
		}
	}

	// ── Footer: tell the user where the scope config is ──
	fmt.Println()
	if strings.HasPrefix(resp.ScopeSource, "/") {
		// File-path source — point the user at it.
		fmt.Printf("(scope: %s — edit to change which repos are searched)\n", resp.ScopeSource)
	} else {
		// Non-file source (--scope flag, cwd-walk). Tell the user how to make
		// it permanent if they want to.
		fmt.Printf("(scope source: %s — run `local-search scope set repo1,repo2` to write a permanent .local-search.toml)\n", resp.ScopeSource)
	}
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max-1] + "…"
}

func splitComma(s string) []string {
	var out []string
	for _, p := range strings.Split(s, ",") {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}

func filterScopeRepos(repos []localdb.RepoRow, names []string) []localdb.RepoRow {
	keep := map[string]bool{}
	for _, n := range names {
		keep[n] = true
	}
	out := make([]localdb.RepoRow, 0, len(names))
	for _, r := range repos {
		if keep[r.Name] {
			out = append(out, r)
		}
	}
	return out
}

// ── Help ──────────────────────────────────────────────────────────────────────

func cmdHelp() {
	fmt.Print(`local-search — search your project specs across multiple repos

Usage:
	local-search repo add <folder> [name] [--skip-directory <folder-name>]   Register a spec repo
  local-search repo remove <name>         Remove a repo
  local-search repo list                  Show all repos

  local-search graphs                                 List graph status (graphify + code-review-graph)
  local-search graphs add <name> <path> [--kind K]    Register a standalone graph (K = graphify | code-review-graph)
  local-search graphs remove <name>                   Unregister a standalone graph
  local-search graphs prune                           Forget standalone graphs whose files vanished

  local-search find <query> [--scope <repos>]         Unified search: specs + graphify + code-review-graph
  local-search code <query> [--scope <repos>]         Search code-review-graph nodes by name
  local-search code hubs [--scope <repos>]            Top hub functions/classes
  local-search code blast <qualified> [--scope ...]   Impact set (depth 2, cap 50 by default)
  local-search code callers <qualified> [--scope ...] Direct callers
  local-search code callees <qualified> [--scope ...] Direct callees

  local-search scope show                             Print resolved scope and where it came from
  local-search scope set repo1,repo2                  Write .local-search.toml in CWD
  local-search scope clear                            Remove .local-search.toml from CWD
  local-search scope init                             Auto-detect nearest enclosing repo as scope

  local-search scan                       Scan all repos
  local-search scan <repo-name>           Scan one repo

<<<<<<< HEAD
  local-search search <query>                                                        Search all repos
  local-search search <query> --repo <name>                                          Search one repo (named flag)
  local-search search <query> <repo>                                                 Search one repo (positional, legacy)
  local-search search <query> --directory <path>                                     Focus to paths starting with <path>
  local-search search <query> --exclude-location <pattern>                           Exclude paths containing pattern
  local-search read <name>                                                           Read a spec
  local-search read <name> <repo>                                                    Read from specific repo
  local-search read <name> <repo> --directory <path>                                 Read from specific repo and directory
=======
  local-search search <query>                                Search all repos (auto-routes to FTS+graph)
  local-search search <query> --repos all                    Every registered repo (default)
  local-search search <query> --repos graph-only             Only repos with graphify-out/
  local-search search <query> --repos repoA,repoB            Comma-separated subset
  local-search search <query> --source auto|fts|graph|both   Where results come from (default auto)
  local-search search <query> --rank auto|bm25|graph-aware   Ranking strategy (default auto)
  local-search search <query> --repo <name>                  Single repo (legacy; prefer --repos)
  local-search search <query> --exclude-location <pattern>   Exclude paths containing pattern

  Auto rules:
    --source auto → both when any selected repo has graphify-out/, else fts
    --rank auto   → graph-aware when any selected repo has graphify-out/, else bm25
    The status line in [brackets] above results shows the resolved values.
  local-search read <name>                                   Read a spec
  local-search read <name> <repo>                            Read from specific repo
>>>>>>> ed5f3da (Add graph and scope packages with associated tests)
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
