import { Handle, Position } from "reactflow";

type Props = {
  data?: {
    kind?: "step" | "run";
    label?: string;
    subtitle?: string;
    meta?: string;
    tone?: "slate" | "amber" | "cyan" | "mint" | "violet";
    active?: boolean;
    muted?: boolean;
  };
};

export function FlowNode({ data }: Props) {
  const kind = data?.kind ?? "step";
  const tone = data?.tone ?? "slate";

  return (
    <div
      className={`flow-node flow-node--${tone}${data?.active ? " is-active" : ""}${data?.muted ? " is-muted" : ""}`}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="flow-node__head">
        <span className="flow-node__kind">{kind === "step" ? "Step" : "Mini-app"}</span>
        {data?.meta ? <span className="flow-node__meta">{data.meta}</span> : null}
      </div>
      <div className="flow-node__title">{data?.label ?? "Node"}</div>
      <div className="flow-node__subtitle">{data?.subtitle ?? "—"}</div>
    </div>
  );
}
