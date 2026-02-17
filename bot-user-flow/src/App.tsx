import React from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  applyNodeChanges,
  type NodeChange,
} from "reactflow";
import "reactflow/dist/style.css";

import { DetailsPanel } from "./components/DetailsPanel";
import { FlowNode } from "./components/FlowNode";
import { Uploader } from "./components/Uploader";
import { buildGraphModel } from "./buildGraphModel";
import { demoConversation, demoMiniApps, demoRunLogs, demoStepLogs } from "./demoData";
import type { GraphModel, Selected } from "./types";

type ViewMode = "steps" | "miniapps";
type LayoutMode = "horizontal" | "vertical";

export default function App() {
  const nodeTypes = React.useMemo(() => ({ graphNode: FlowNode }), []);
  const prevLayoutRef = React.useRef<LayoutMode>("horizontal");
  const prevGraphKeyRef = React.useRef<string>("");

  const [model, setModel] = React.useState<GraphModel | undefined>(undefined);
  const [selected, setSelected] = React.useState<Selected>({ kind: "none" });
  const [viewMode, setViewMode] = React.useState<ViewMode>("steps");
  const [layoutMode, setLayoutMode] = React.useState<LayoutMode>("horizontal");
  const [dragEnabled, setDragEnabled] = React.useState(true);
  const [miniAppsStepId, setMiniAppsStepId] = React.useState<string | undefined>(undefined);

  const [flowNodes, setFlowNodes] = React.useState<any[]>([]);
  const [flowEdges, setFlowEdges] = React.useState<any[]>([]);

  function transformNodesLayout(nodes: any[], layout: LayoutMode) {
    if (layout === "horizontal") return nodes;

    const swapped = nodes.map((node) => ({
      ...node,
      position: {
        x: node.position?.y ?? 0,
        y: node.position?.x ?? 0,
      },
    }));

    const minX = Math.min(...swapped.map((n) => n.position.x), 0);
    const minY = Math.min(...swapped.map((n) => n.position.y), 0);
    const offsetX = minX < 24 ? 24 - minX : 0;
    const offsetY = minY < 24 ? 24 - minY : 0;
    return swapped.map((node) => ({
      ...node,
      position: {
        x: node.position.x + offsetX,
        y: node.position.y + offsetY,
      },
    }));
  }

  function applyNodeHighlighting(nodes: any[], activeStepId?: string, activeRunId?: string) {
    return nodes.map((node) => {
      const nodeKind = node.data?.kind;
      const nodeStepId = node.data?.stepId;
      const nodeRunId = node.data?.runId;
      const isActive =
        nodeKind === "step"
          ? nodeStepId === activeStepId
          : nodeStepId === activeStepId && (!activeRunId || nodeRunId === activeRunId);

      return {
        ...node,
        data: {
          ...node.data,
          active: isActive,
          muted: Boolean(activeStepId) && !isActive,
        },
      };
    });
  }

  function applyNodeLayoutDirection(nodes: any[], layout: LayoutMode) {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        layout,
      },
    }));
  }

  function preserveDraggedPositions(baseNodes: any[], prevNodes: any[]) {
    const prevById = new Map(prevNodes.map((node) => [node.id, node]));
    return baseNodes.map((node) => {
      const prev = prevById.get(node.id);
      if (!prev?.position) return node;
      return {
        ...node,
        position: prev.position,
      };
    });
  }

  function getTreeScore(stepId: string, m: GraphModel) {
    const runs = m.runsByStepId[stepId] ?? [];
    if (runs.length === 0) return 0;
    const rootCount = runs.filter((r) => (r.dependsOn?.length ?? 0) === 0).length;
    const mergeCount = runs.filter((r) => (r.dependsOn?.length ?? 0) > 1).length;
    return rootCount + mergeCount * 2 + Math.max(0, runs.length - 2) * 0.1;
  }

  function getBestTreeStepId(m: GraphModel) {
    let bestStepId = m.stepOrder[0];
    let bestScore = -1;
    for (const sid of m.stepOrder) {
      const score = getTreeScore(sid, m);
      if (score > bestScore) {
        bestScore = score;
        bestStepId = sid;
      }
    }
    return bestStepId;
  }

  function getActiveStepId(m: GraphModel) {
    return selected.kind === "none" ? m.stepOrder[0] : selected.stepId;
  }

  function loadModelFromFiles(files: {
    conversation?: any;
    stepLogs?: any;
    miniApps?: any;
    runLogs?: any;
  }) {
    if (!files.conversation) return;

    const m = buildGraphModel({
      conversation: files.conversation,
      stepLogs: files.stepLogs,
      miniApps: files.miniApps,
      runLogs: files.runLogs,
    });

    setModel(m);
    setSelected({ kind: "none" });
    setViewMode("steps");
    setLayoutMode("horizontal");
    setMiniAppsStepId(getBestTreeStepId(m));
  }

  function loadDemo() {
    const m = buildGraphModel({
      conversation: demoConversation,
      stepLogs: demoStepLogs,
      miniApps: demoMiniApps,
      runLogs: demoRunLogs,
    });
    setModel(m);
    setSelected({ kind: "none" });
    setViewMode("steps");
    setLayoutMode("horizontal");
    setMiniAppsStepId(getBestTreeStepId(m));
  }

  React.useEffect(() => {
    loadDemo();
  }, []);

  function switchToSteps() {
    setViewMode("steps");
  }

  function switchToMiniApps(stepId?: string) {
    if (!model) return;
    let sid =
      stepId ??
      (selected.kind === "step"
        ? selected.stepId
        : selected.kind === "run"
          ? selected.stepId
          : undefined);

    if (!sid) {
      sid = getBestTreeStepId(model);
    } else if (!stepId && selected.kind !== "run" && getTreeScore(sid, model) <= 1) {
      sid = getBestTreeStepId(model);
    }

    if (!sid) return;

    setViewMode("miniapps");
    setMiniAppsStepId(sid);
    setSelected({ kind: "step", stepId: sid });
  }

  function selectConversationStep(stepId: string) {
    setSelected({ kind: "step", stepId });
    if (viewMode === "miniapps") {
      setMiniAppsStepId(stepId);
    }
  }

  const onNodesChange = React.useCallback((changes: NodeChange[]) => {
    setFlowNodes((nodes) => applyNodeChanges(changes, nodes));
  }, []);

  const onNodeClick = (_: any, node: any) => {
    const d = node.data ?? {};
    if (d.kind === "step") {
      setSelected({ kind: "step", stepId: d.stepId });
    } else if (d.kind === "run") {
      setMiniAppsStepId(d.stepId);
      setSelected({ kind: "run", stepId: d.stepId, runId: d.runId });
    }
  };

  React.useEffect(() => {
    if (!model) {
      setFlowNodes([]);
      setFlowEdges([]);
      return;
    }

    const activeStepId = getActiveStepId(model);
    const activeRunId = selected.kind === "run" ? selected.runId : undefined;
    let baseNodes: any[] = [];
    let baseEdges: any[] = [];

    let graphKey = "steps";

    if (viewMode === "steps") {
      baseNodes = transformNodesLayout(model.stepNodes, layoutMode);
      baseEdges = model.stepEdges;
    } else {
      const sid = miniAppsStepId ?? activeStepId;
      if (!sid) {
        setFlowNodes([]);
        setFlowEdges([]);
        return;
      }
      graphKey = `miniapps:${sid}`;
      baseNodes = transformNodesLayout(model.runNodesByStepId[sid] ?? [], layoutMode);
      baseEdges = model.runEdgesByStepId[sid] ?? [];
    }

    setFlowEdges(baseEdges);
    const shouldPreserveDragged =
      prevLayoutRef.current === layoutMode && prevGraphKeyRef.current === graphKey;

    const nodesWithDirection = applyNodeLayoutDirection(baseNodes, layoutMode);
    setFlowNodes((prev) =>
      applyNodeHighlighting(
        shouldPreserveDragged
          ? preserveDraggedPositions(nodesWithDirection, prev)
          : nodesWithDirection,
        activeStepId,
        activeRunId,
      ),
    );
    prevLayoutRef.current = layoutMode;
    prevGraphKeyRef.current = graphKey;
  }, [layoutMode, miniAppsStepId, model, selected, viewMode]);

  React.useEffect(() => {
    if (!model || flowNodes.length === 0) return;
    const activeStepId = getActiveStepId(model);
    const activeRunId = selected.kind === "run" ? selected.runId : undefined;
    setFlowNodes((nodes) => applyNodeHighlighting(nodes, activeStepId, activeRunId));
  }, [model, selected]);

  return (
    <div className="page">
      <div className="topbar">
        <div className="topbar__row topbar__row--main">
          <div className="brand brand--product">
            <div className="brand__logo">◫</div>
            <div>
              <h1 className="brand__title">Metuur Flow</h1>
              <div className="brand__breadcrumb">Projects  ›  Inspector  ›  conversation_trace.json</div>
            </div>
          </div>

          <div className="header-status">
            <span className="status-pill">
              Conversation <b>{model?.conversationId ?? "—"}</b>
            </span>
            <span className="status-pill">
              Active step{" "}
              <b>{selected.kind === "none" ? model?.stepOrder?.[0] ?? "—" : selected.stepId}</b>
            </span>
            <span className="status-pill">
              Nodes <b>{flowNodes.length}</b>
            </span>
          </div>
        </div>

        <div className="topbar__row topbar__row--controls">
          <div className="toolbar-section toolbar-section--inline">
            <div className="toolbar-title">Data</div>
            <Uploader onLoad={loadModelFromFiles} onLoadDemo={loadDemo} />
          </div>

          <div className="view-controls toolbar-section toolbar-section--inline">
            <div className="toolbar-title">Explore</div>
            <span className="mode-pill">
              View <b>{viewMode === "steps" ? "Conversation steps" : "Mini-app tree"}</b>
            </span>
            <span className="mode-pill">
              Layout <b>{layoutMode}</b>
            </span>
            <button className="btn" onClick={switchToSteps} disabled={!model || viewMode === "steps"}>
              Conversation flow
            </button>
            <button
              className="btn"
              onClick={() => switchToMiniApps()}
              disabled={!model || viewMode === "miniapps"}
            >
              Mini-app tree
            </button>
            <button className="btn" onClick={() => setLayoutMode("horizontal")} disabled={layoutMode === "horizontal"}>
              Horizontal
            </button>
            <button className="btn" onClick={() => setLayoutMode("vertical")} disabled={layoutMode === "vertical"}>
              Vertical
            </button>
            <button className="btn" onClick={() => setDragEnabled((v) => !v)}>
              {dragEnabled ? "Drag on" : "Drag off"}
            </button>
          </div>
        </div>
      </div>

      <div className="layout">
        <div className="canvas-wrap">
          {viewMode === "miniapps" && miniAppsStepId ? (
            <div className="tree-indicator">
              Showing tree for <b>{miniAppsStepId}</b>
            </div>
          ) : null}
          <div className="flow-legend">
            <span className="flow-legend__item"><i className="dot dot--active" />Selected</span>
            <span className="flow-legend__item"><i className="dot dot--step" />Step</span>
            <span className="flow-legend__item"><i className="dot dot--mini" />Mini-app</span>
          </div>
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges.map((edge) => ({
              ...edge,
              markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
              type: layoutMode === "vertical" ? "bezier" : edge.type,
            }))}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onNodesChange={onNodesChange}
            nodesDraggable={dragEnabled}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            defaultEdgeOptions={{ type: "smoothstep" }}
          >
            <Background color="#d9dce3" gap={40} size={2} />
            <Controls />
          </ReactFlow>

          {model && viewMode === "steps" && selected.kind === "step" && (
            <div className="tip">
              <div className="tip__kicker">Next</div>
              <div className="tip__text">
                Open <b>Mini-app tree</b> to see how step <b>{selected.stepId}</b> was generated.
              </div>
            </div>
          )}
        </div>

        <div className="panel-wrap">
          <DetailsPanel
            model={model}
            selected={selected}
            onSelectStep={selectConversationStep}
          />
        </div>
      </div>
    </div>
  );
}
