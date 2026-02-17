import React from "react";
import type { GraphModel, Selected } from "../types";

type Props = {
  model?: GraphModel;
  selected: Selected;
  onSelectStep: (stepId: string) => void;
};

type Tab = "Step Logs" | "MiniApps" | "KVPS" | "Raw";

function pretty(obj: any) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export function DetailsPanel({ model, selected, onSelectStep }: Props) {
  const [tab, setTab] = React.useState<Tab>("Step Logs");

  React.useEffect(() => {
    if (selected.kind === "run") setTab("KVPS");
    if (selected.kind === "step") setTab("Step Logs");
  }, [selected.kind]);

  if (!model) {
    return (
      <div className="panel">
        <h3 className="panel__title">Details</h3>
        <p>Load data to see the conversation and step details.</p>
      </div>
    );
  }

  const fallbackStepId = model.stepOrder[0];
  const stepId =
    selected.kind === "none"
      ? fallbackStepId
      : selected.kind === "step"
        ? selected.stepId
        : selected.stepId;

  if (!stepId) {
    return (
      <div className="panel">
        <h3 className="panel__title">Details</h3>
        <p>No steps found in the conversation.</p>
      </div>
    );
  }

  const step = model.stepsById[stepId];
  const stepLogs = model.stepLogsByStepId[stepId] ?? [];
  const runs = model.runsByStepId[stepId] ?? [];

  const run = selected.kind === "run" ? runs.find((r) => r.runId === selected.runId) : undefined;

  const runLogs = selected.kind === "run" ? model.runLogsByRunId[selected.runId] : undefined;

  return (
    <div className="panel">
      <h3 className="panel__title">Conversation</h3>
      <div className="conversation-list">
        {model.stepOrder.map((sid) => {
          const item = model.stepsById[sid];
          const isActiveStep = sid === stepId;
          return (
            <button
              key={sid}
              className={`conversation-card${isActiveStep ? " is-active" : ""}`}
              onClick={() => onSelectStep(sid)}
            >
              <div className="conversation-card__head">
                <span>{sid}</span>
                <span>{item?.ts ?? "—"}</span>
              </div>
              <div className="conversation-card__line">
                <b>User:</b> {item?.userText ?? "—"}
              </div>
              <div className="conversation-card__line">
                <b>Bot:</b> {item?.botText ?? "—"}
              </div>
            </button>
          );
        })}
      </div>

      <h3 className="panel__title panel__title--small">
        {selected.kind === "run" ? `Step ${stepId} · Run ${selected.runId}` : `Step ${stepId}`}
      </h3>

      <div className="tabs">
        {(["Step Logs", "MiniApps", "KVPS", "Raw"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn btn--tab ${tab === t ? "is-active" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Step Logs" && (
        <pre className="code-block">{pretty(stepLogs)}</pre>
      )}

      {tab === "MiniApps" && (
        <div>
          {runs.length === 0 ? (
            <p>No mini-app runs for this step.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {runs.map((r) => (
                <li key={r.runId} style={{ marginBottom: 8 }}>
                  <div>
                    <b>{r.name}</b> <span style={{ opacity: 0.7 }}>({r.runId})</span>
                  </div>
                  <div className="panel__muted">
                    order={r.order ?? "—"} deps={r.dependsOn?.join(", ") || "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "KVPS" && (
        <div>
          {selected.kind !== "run" ? (
            <p>Select a run node to see KVPS.</p>
          ) : !runLogs ? (
            <p>No run logs found for {selected.runId}.</p>
          ) : (
            <>
              <h4 className="panel__subtitle">{run?.name ?? selected.runId}</h4>
              <div className="panel__group">
                <div className="panel__label">KVPS</div>
                <pre className="code-block">{pretty(runLogs.kvps ?? {})}</pre>
              </div>

              <div>
                <div className="panel__label">HTTP / Extra</div>
                <pre className="code-block">{pretty(runLogs.http ?? [])}</pre>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "Raw" && (
        <pre className="code-block">{selected.kind === "run" ? pretty(runLogs ?? {}) : pretty({ step, stepLogs, runs })}</pre>
      )}
    </div>
  );
}
