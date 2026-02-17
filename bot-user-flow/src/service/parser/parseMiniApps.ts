import type { MiniAppRunsFile } from "../../types";
import type { ParsedMiniApps } from "./types";

function safeOrder(n?: number) {
  return typeof n === "number" ? n : 10_000;
}

/**
 * Parses `miniAppRuns.json` into step-scoped mini-app runs.
 *
 * Output:
 * - `byStepId`: step id -> ordered list of runs.
 * - each run contains:
 *   - `runId`
 *   - `name`
 *   - `order`
 *   - `dependsOn` (always an array; empty when missing).
 */
export function parseMiniAppsFile(miniApps?: MiniAppRunsFile): ParsedMiniApps {
  const byStepId: ParsedMiniApps["byStepId"] = {};
  if (!miniApps?.mini_app_runs?.length) {
    return { byStepId };
  }

  for (const item of miniApps.mini_app_runs) {
    byStepId[item.step_id] = (item.runs ?? [])
      .map((run) => ({
        runId: run.run_id,
        name: run.name,
        order: run.order,
        dependsOn: run.depends_on ?? [],
      }))
      .sort((a, b) => safeOrder(a.order) - safeOrder(b.order));
  }

  return { byStepId };
}
