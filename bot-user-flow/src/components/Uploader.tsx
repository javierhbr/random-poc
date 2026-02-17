import React from "react";

type Props = {
  onLoad: (files: {
    conversation?: any;
    stepLogs?: any;
    miniApps?: any;
    runLogs?: any;
  }) => void;
  onLoadDemo: () => void;
};

async function readJsonFile(file: File): Promise<any> {
  const text = await file.text();
  return JSON.parse(text);
}

export function Uploader({ onLoad, onLoadDemo }: Props) {
  const [state, setState] = React.useState<{
    conversation?: any;
    stepLogs?: any;
    miniApps?: any;
    runLogs?: any;
  }>({});

  const pick =
    (key: keyof typeof state) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const json = await readJsonFile(f);
      setState((prev) => ({ ...prev, [key]: json }));
    };

  return (
    <div className="uploader">
      <button className="btn btn--primary" onClick={onLoadDemo}>
        Try example data
      </button>

      <label className="file-field">
        Chat messages JSON
        <input type="file" accept="application/json" onChange={pick("conversation")} />
      </label>

      <label className="file-field">
        Activity logs JSON
        <input type="file" accept="application/json" onChange={pick("stepLogs")} />
      </label>

      <label className="file-field">
        Mini-app runs JSON
        <input type="file" accept="application/json" onChange={pick("miniApps")} />
      </label>

      <label className="file-field">
        Run Logs JSON (optional)
        <input type="file" accept="application/json" onChange={pick("runLogs")} />
      </label>

      <button
        className="btn"
        onClick={() => onLoad(state)}
        disabled={!state.conversation}
        title={!state.conversation ? "Upload Conversation JSON first" : ""}
      >
        Show flow
      </button>
    </div>
  );
}
