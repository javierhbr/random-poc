import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from '../src/server.js';
import { createRegistry } from '../src/sessions.js';
import { parseReposStdout } from '../src/repos.js';
import { probeJsonContext } from '../src/smoke.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 8787;
const staticDir = path.resolve(__dirname, '../../frontend/dist');

// Capture stdout/exit code of a `local-search <args>` invocation.
function runLocalSearch(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('local-search', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', reject);
    child.on('close', (code) => resolve({ stdout, stderr, code }));
  });
}

// deps.runRepos resolves the raw stdout string (repos.js parses it).
async function runRepos() {
  const { stdout, stderr, code } = await runLocalSearch(['json', 'repos']);
  if (code !== 0) {
    throw new Error(`local-search json repos exited ${code}: ${stderr.trim()}`);
  }
  return stdout;
}

const registry = createRegistry();
const deps = { runRepos };
const server = createServer({ staticDir, registry, deps });

// R-5.5: at startup, probe json context against the first available repo and
// report whether provenance is available or degraded. Never fatal.
async function probeProvenance() {
  let firstRepo;
  try {
    const rows = parseReposStdout(await runRepos());
    firstRepo = rows[0]?.name || rows[0]?.repo;
  } catch (err) {
    console.warn(`provenance: could not list repos (${err.message}); provenance degraded`);
    return;
  }
  if (!firstRepo) {
    console.warn('provenance: no repos found; provenance degraded');
    return;
  }
  const result = await probeJsonContext({ run: runLocalSearch, repo: firstRepo });
  if (result.available) {
    console.log(`provenance: available (probed "${firstRepo}")`);
  } else {
    console.warn(`provenance: degraded (${result.reason})`);
  }
}

server.listen(port, () => {
  console.log(`explainable-search backend listening on http://localhost:${port}`);
  probeProvenance();
});
