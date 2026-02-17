import type { StepLogsFile } from "../../types";
import type { ParsedStepLogs } from "./types";

/**
 * Parses `stepLogs.json` into an indexable map.
 *
 * Output:
 * - `byStepId`: step id -> array of events captured for that step.
 */
export function parseStepLogsFile(stepLogs?: StepLogsFile): ParsedStepLogs {
  const byStepId: ParsedStepLogs["byStepId"] = {};
  if (!stepLogs?.step_logs?.length) {
    return { byStepId };
  }

  for (const item of stepLogs.step_logs) {
    byStepId[item.step_id] = item.events ?? [];
  }

  return { byStepId };
}
