import type { RunLogsFile } from "../../types";
import type { ParsedRunLogs } from "./types";

/**
 * Parses `runLogs.json` into a run id index.
 *
 * Output:
 * - `byRunId`: run id -> normalized log payload.
 * - normalized payload fields:
 *   - `kvps`: key-value pairs extracted from the run.
 *   - `raw`: original run log payload (or explicit `raw` when provided).
 *   - `http`: HTTP / side-effect metadata list.
 */
export function parseRunLogsFile(runLogs?: RunLogsFile): ParsedRunLogs {
  const byRunId: ParsedRunLogs["byRunId"] = {};
  if (!runLogs?.run_logs?.length) {
    return { byRunId };
  }

  for (const item of runLogs.run_logs) {
    byRunId[item.run_id] = {
      kvps: item.kvps,
      raw: item.raw ?? item,
      http: item.http,
    };
  }

  return { byRunId };
}
