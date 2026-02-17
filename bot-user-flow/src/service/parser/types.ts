import type { RunId, StepId } from "../../types";

export type ParsedConversationStep = {
  stepId: StepId;
  ts?: string;
  userText: string;
  botText: string;
};

export type ParsedConversation = {
  conversationId: string;
  steps: ParsedConversationStep[];
};

export type ParsedStepLogs = {
  byStepId: Record<StepId, any[]>;
};

export type ParsedMiniAppRun = {
  runId: RunId;
  name: string;
  order?: number;
  dependsOn: RunId[];
};

export type ParsedMiniApps = {
  byStepId: Record<StepId, ParsedMiniAppRun[]>;
};

export type ParsedRunLog = {
  kvps?: Record<string, any>;
  raw?: any;
  http?: any[];
};

export type ParsedRunLogs = {
  byRunId: Record<RunId, ParsedRunLog>;
};
