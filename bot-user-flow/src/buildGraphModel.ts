import type {
  ConversationFile,
  GraphModel,
  MiniAppRunsFile,
  RunId,
  RunLogsFile,
  StepId,
  StepLogsFile,
} from "./types";
import {
  parseConversationFile,
  parseMiniAppsFile,
  parseRunLogsFile,
  parseStepLogsFile,
} from "./service/parser";

function safeOrder(n?: number) {
  return typeof n === "number" ? n : 10_000;
}

const tones = ["slate", "amber", "cyan", "mint", "violet"] as const;

export function buildGraphModel(args: {
  conversation: ConversationFile;
  stepLogs?: StepLogsFile;
  miniApps?: MiniAppRunsFile;
  runLogs?: RunLogsFile;
}): GraphModel {
  const { conversation, stepLogs, miniApps, runLogs } = args;

  const parsedConversation = parseConversationFile(conversation);
  const parsedStepLogs = parseStepLogsFile(stepLogs);
  const parsedMiniApps = parseMiniAppsFile(miniApps);
  const parsedRunLogs = parseRunLogsFile(runLogs);

  const conversationId = parsedConversation.conversationId;

  const stepsById: GraphModel["stepsById"] = {};
  for (const step of parsedConversation.steps) {
    stepsById[step.stepId] = {
      stepId: step.stepId,
      ts: step.ts,
      userText: step.userText,
      botText: step.botText,
    };
  }

  const stepLogsByStepId: GraphModel["stepLogsByStepId"] = parsedStepLogs.byStepId;
  const runsByStepId: GraphModel["runsByStepId"] = parsedMiniApps.byStepId;
  const runLogsByRunId: GraphModel["runLogsByRunId"] = parsedRunLogs.byRunId;

  const stepIds = parsedConversation.steps.map((s) => s.stepId);
  const stepNodes = stepIds.map((id, idx) => ({
    id: `step:${id}`,
    type: "graphNode",
    position: { x: idx * 320, y: 140 + (idx % 2) * 40 },
    data: {
      kind: "step",
      stepId: id,
      label: `Step ${id}`,
      subtitle: (stepsById[id]?.userText ?? "").slice(0, 42),
      meta: stepsById[id]?.ts ?? "",
      tone: tones[idx % tones.length],
    },
  }));

  const stepEdges = stepIds.slice(0, -1).map((id, idx) => ({
    id: `e-step:${id}->${stepIds[idx + 1]}`,
    source: `step:${id}`,
    target: `step:${stepIds[idx + 1]}`,
    type: "smoothstep",
    animated: idx % 2 === 0,
    style: { stroke: "rgba(89, 98, 117, 0.7)", strokeWidth: 2 },
  }));

  const runNodesByStepId: GraphModel["runNodesByStepId"] = {};
  const runEdgesByStepId: GraphModel["runEdgesByStepId"] = {};

  for (const stepId of Object.keys(runsByStepId) as StepId[]) {
    const runs = runsByStepId[stepId] ?? [];
    const edges: any[] = [];
    const hasDeps = runs.some((r) => (r.dependsOn?.length ?? 0) > 0);
    const runById = new Map(runs.map((r) => [r.runId, r]));
    const parentsByRunId = new Map<RunId, RunId[]>();

    for (const run of runs) {
      const validParents = (run.dependsOn ?? []).filter((dep) => runById.has(dep));
      parentsByRunId.set(run.runId, validParents);
    }

    const depthMemo = new Map<RunId, number>();
    const depthStack = new Set<RunId>();
    const getDepth = (runId: RunId): number => {
      if (depthMemo.has(runId)) return depthMemo.get(runId) ?? 1;
      if (depthStack.has(runId)) return 1;
      depthStack.add(runId);
      const parents = parentsByRunId.get(runId) ?? [];
      const depth =
        parents.length === 0
          ? 1
          : Math.max(...parents.map((parentId) => getDepth(parentId) + 1));
      depthStack.delete(runId);
      depthMemo.set(runId, depth);
      return depth;
    };

    const rowsByDepth = new Map<number, Array<(typeof runs)[number]>>();
    for (const run of runs) {
      const depth = hasDeps ? getDepth(run.runId) : safeOrder(run.order);
      const row = rowsByDepth.get(depth) ?? [];
      row.push(run);
      rowsByDepth.set(depth, row);
    }

    const sortedDepths = Array.from(rowsByDepth.keys()).sort((a, b) => a - b);
    for (const d of sortedDepths) {
      (rowsByDepth.get(d) ?? []).sort((a, b) => safeOrder(a.order) - safeOrder(b.order));
    }

    const maxRows = Math.max(
      1,
      ...sortedDepths.map((d) => (rowsByDepth.get(d) ?? []).length),
    );
    const yGap = 150;
    const xGap = 320;
    const baselineY = 110;

    const nodes: any[] = [];
    const stepSummary = stepsById[stepId]?.userText ?? "";
    nodes.push({
      id: `runroot:${stepId}`,
      type: "graphNode",
      position: { x: 24, y: baselineY + ((maxRows - 1) * yGap) / 2 },
      data: {
        kind: "step",
        stepId,
        label: `Step ${stepId}`,
        subtitle: stepSummary.slice(0, 48) || "Mini-app tree",
        meta: `${runs.length} mini-apps`,
        tone: "slate",
      },
    });

    for (const depth of sortedDepths) {
      const row = rowsByDepth.get(depth) ?? [];
      const top = baselineY + ((maxRows - row.length) * yGap) / 2;
      for (let idx = 0; idx < row.length; idx += 1) {
        const r = row[idx];
        nodes.push({
          id: `run:${stepId}:${r.runId}`,
          type: "graphNode",
          position: { x: depth * xGap, y: top + idx * yGap },
          data: {
            kind: "run",
            stepId,
            runId: r.runId,
            label: r.name.replaceAll("_", " "),
            subtitle: r.runId,
            meta: r.order ? `order ${r.order}` : "",
            tone: tones[idx % tones.length],
          },
        });
      }
    }

    if (hasDeps) {
      for (const r of runs) {
        const deps = (r.dependsOn ?? []).filter((dep) => runById.has(dep)) as RunId[];
        if (deps.length === 0) {
          edges.push({
            id: `e-root:${stepId}->${r.runId}`,
            source: `runroot:${stepId}`,
            target: `run:${stepId}:${r.runId}`,
            type: "smoothstep",
            style: { stroke: "rgba(77, 96, 138, 0.45)", strokeWidth: 2 },
          });
          continue;
        }
        for (const dep of deps) {
          edges.push({
            id: `e-run:${stepId}:${dep}->${r.runId}`,
            source: `run:${stepId}:${dep}`,
            target: `run:${stepId}:${r.runId}`,
            type: "smoothstep",
            style: { stroke: "rgba(154, 126, 255, 0.45)", strokeDasharray: "5 4", strokeWidth: 2 },
          });
        }
      }
    } else {
      if (runs[0]) {
        edges.push({
          id: `e-root:${stepId}->${runs[0].runId}`,
          source: `runroot:${stepId}`,
          target: `run:${stepId}:${runs[0].runId}`,
          type: "smoothstep",
          style: { stroke: "rgba(77, 96, 138, 0.45)", strokeWidth: 2 },
        });
      }
      for (let i = 0; i < runs.length - 1; i += 1) {
        edges.push({
          id: `e-run:${stepId}:${runs[i].runId}->${runs[i + 1].runId}`,
          source: `run:${stepId}:${runs[i].runId}`,
          target: `run:${stepId}:${runs[i + 1].runId}`,
          type: "smoothstep",
          style: { stroke: "rgba(85, 122, 255, 0.55)", strokeWidth: 2 },
        });
      }
    }

    runNodesByStepId[stepId] = nodes;
    runEdgesByStepId[stepId] = edges;
  }

  return {
    conversationId,
    stepOrder: stepIds,
    stepsById,
    stepLogsByStepId,
    runsByStepId,
    runLogsByRunId,
    stepNodes,
    stepEdges,
    runNodesByStepId,
    runEdgesByStepId,
  };
}
