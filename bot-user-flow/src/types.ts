export type StepId = string;
export type RunId = string;

export type ConversationFile = {
  conversation_id: string;
  steps: Array<{
    step_id: StepId;
    ts?: string;
    user?: { text?: string };
    bot?: { text?: string };
  }>;
};

export type StepLogsFile = {
  conversation_id: string;
  step_logs: Array<{
    step_id: StepId;
    events: Array<any>;
  }>;
};

export type MiniAppRunsFile = {
  conversation_id: string;
  mini_app_runs: Array<{
    step_id: StepId;
    runs: Array<{
      run_id: RunId;
      name: string;
      order?: number;
      depends_on?: RunId[];
    }>;
  }>;
};

export type RunLogsFile = {
  run_logs: Array<{
    run_id: RunId;
    kvps?: Record<string, any>;
    raw?: any;
    http?: Array<any>;
  }>;
};

export type GraphModel = {
  conversationId: string;
  stepOrder: StepId[];

  stepsById: Record<
    StepId,
    {
      stepId: StepId;
      ts?: string;
      userText?: string;
      botText?: string;
    }
  >;

  stepLogsByStepId: Record<StepId, any[]>;

  runsByStepId: Record<
    StepId,
    Array<{
      runId: RunId;
      name: string;
      order?: number;
      dependsOn?: RunId[];
    }>
  >;

  runLogsByRunId: Record<
    RunId,
    {
      kvps?: Record<string, any>;
      raw?: any;
      http?: any[];
    }
  >;

  stepNodes: any[];
  stepEdges: any[];

  runNodesByStepId: Record<StepId, any[]>;
  runEdgesByStepId: Record<StepId, any[]>;
};

export type Selected =
  | { kind: "none" }
  | { kind: "step"; stepId: StepId }
  | { kind: "run"; stepId: StepId; runId: RunId };
