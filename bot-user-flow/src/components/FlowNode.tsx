import { useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals, type NodeProps } from "reactflow";

type NodeData = {
    kind?: "step" | "run";
    label?: string;
    subtitle?: string;
    meta?: string;
    tone?: "slate" | "amber" | "cyan" | "mint" | "violet";
    active?: boolean;
    muted?: boolean;
    layout?: "horizontal" | "vertical";
};

export function FlowNode({ id, data }: NodeProps<NodeData>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const kind = data?.kind ?? "step";
  const tone = data?.tone ?? "slate";
  const isVertical = data?.layout === "vertical";
  const targetPosition = isVertical ? Position.Top : Position.Left;
  const sourcePosition = isVertical ? Position.Bottom : Position.Right;

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, isVertical, updateNodeInternals]);

  return (
    <div
      className={`flow-node flow-node--${tone}${data?.active ? " is-active" : ""}${data?.muted ? " is-muted" : ""}`}
    >
      <Handle type="target" position={targetPosition} />
      <Handle type="source" position={sourcePosition} />

      <div className="flow-node__head">
        <span className="flow-node__kind">{kind === "step" ? "Step" : "Mini-app"}</span>
        {data?.meta ? <span className="flow-node__meta">{data.meta}</span> : null}
      </div>
      <div className="flow-node__title">{data?.label ?? "Node"}</div>
      <div className="flow-node__subtitle">{data?.subtitle ?? "—"}</div>
    </div>
  );
}
