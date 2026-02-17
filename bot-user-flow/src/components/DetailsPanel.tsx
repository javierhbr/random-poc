import React from "react";
import type { GraphModel, Selected } from "../types";

type Props = {
  model?: GraphModel;
  selected: Selected;
  onSelectStep: (stepId: string) => void;
};

type DetailTab = "Step Logs" | "MiniApps" | "KVPS" | "Raw";

function pretty(obj: any) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function getMatchScore(selected: Selected) {
  if (selected.kind !== "run") return 82;
  const seed = selected.runId.length * 7;
  return 70 + (seed % 25);
}

export function DetailsPanel({ model, selected, onSelectStep }: Props) {
  const [detailTab, setDetailTab] = React.useState<DetailTab>("Step Logs");

  React.useEffect(() => {
    if (selected.kind === "run") {
      setDetailTab("KVPS");
    } else if (selected.kind === "step") {
      setDetailTab("Step Logs");
    }
  }, [selected.kind]);

  if (!model) {
    return (
      <div className="panel panel--right">
        <h3 className="panel__title">Load data to start</h3>
      </div>
    );
  }

  const stepId = selected.kind === "none" ? model.stepOrder[0] : selected.stepId;
  if (!stepId) {
    return (
      <div className="panel panel--right">
        <h3 className="panel__title">No conversation steps found</h3>
      </div>
    );
  }

  const step = model.stepsById[stepId];
  const stepLogs = model.stepLogsByStepId[stepId] ?? [];
  const runs = model.runsByStepId[stepId] ?? [];
  const run = selected.kind === "run" ? runs.find((r) => r.runId === selected.runId) : undefined;
  const runLogs = selected.kind === "run" ? model.runLogsByRunId[selected.runId] : undefined;
  const score = getMatchScore(selected);

  return (
    <div className="panel panel--right">
      <div className="right-section">
        <h3 className="right-section__title">Conversation</h3>
        <div className="conversation-stream">
          {model.stepOrder.map((sid) => {
            const item = model.stepsById[sid];
            const active = sid === stepId;
            return (
              <div
                key={sid}
                className={`msg-group ${active ? "is-active" : ""}`}
                onClick={() => onSelectStep(sid)}
              >
                <div className="msg msg--user">
                  <div className="msg__meta">User</div>
                  <div>{item?.userText ?? "—"}</div>
                </div>
                <div className="msg msg--bot">
                  <div className="msg__meta">Assistant</div>
                  <div>{item?.botText ?? "—"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="right-section right-section--details">
        <h3 className="right-section__title">Step details</h3>
        <div className="step-details">
          <div className="exec-card">
            <div className="exec-card__kicker">Step execution</div>
            <div className="exec-card__title">{run?.name ?? `Step ${stepId} analysis`}</div>
            <div className="exec-card__bar">
              <div style={{ width: `${score}%` }} />
            </div>
            <div className="exec-card__foot">
              <span>{stepId}</span>
              <span>{score}% match</span>
            </div>
          </div>

          <div className="tabs">
            {(["Step Logs", "MiniApps", "KVPS", "Raw"] as DetailTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setDetailTab(tab)}
                className={`btn btn--tab ${detailTab === tab ? "is-active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {detailTab === "Step Logs" && <pre className="code-block">{pretty(stepLogs)}</pre>}
          {detailTab === "MiniApps" && <pre className="code-block">{pretty(runs)}</pre>}
          {detailTab === "KVPS" && (
            <pre className="code-block">
              {selected.kind === "run" ? pretty(runLogs?.kvps ?? {}) : "Select a mini-app node to view key data."}
            </pre>
          )}
          {detailTab === "Raw" && (
            <pre className="code-block">
              {selected.kind === "run" ? pretty(runLogs ?? {}) : pretty({ step, stepLogs, runs })}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
