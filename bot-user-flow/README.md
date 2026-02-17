# Metuur Flow Inspector

React + TypeScript app to visualize conversation steps and mini-app execution trees.

## Run

```bash
npm install
npm run dev
```

## Input JSON Structure

The uploader expects up to 4 files:

1. `conversation.json` (required)
2. `stepLogs.json` (optional)
3. `miniAppRuns.json` (optional)
4. `runLogs.json` (optional)

### 1) `conversation.json`

```json
{
  "conversation_id": "conv_123",
  "steps": [
    {
      "step_id": "s01",
      "ts": "2026-02-17T12:00:00Z",
      "user": { "text": "..." },
      "bot": { "text": "..." }
    }
  ]
}
```

### 2) `stepLogs.json`

```json
{
  "conversation_id": "conv_123",
  "step_logs": [
    {
      "step_id": "s01",
      "events": [{ "level": "info", "msg": "..." }]
    }
  ]
}
```

### 3) `miniAppRuns.json`

```json
{
  "conversation_id": "conv_123",
  "mini_app_runs": [
    {
      "step_id": "s01",
      "runs": [
        {
          "run_id": "r001",
          "name": "intent_classifier",
          "order": 1,
          "depends_on": []
        }
      ]
    }
  ]
}
```

### 4) `runLogs.json`

```json
{
  "run_logs": [
    {
      "run_id": "r001",
      "kvps": { "intent": "greeting" },
      "http": [],
      "raw": {}
    }
  ]
}
```

## Parser Layer

Parsers live in `src/service/parser` and normalize each file independently.

```text
src/service/parser/
  parseConversation.ts
  parseStepLogs.ts
  parseMiniApps.ts
  parseRunLogs.ts
  types.ts
  index.ts
```

### Parser outputs

`parseConversationFile` output:

```ts
{
  conversationId: string;
  steps: Array<{
    stepId: string;
    ts?: string;
    userText: string;
    botText: string;
  }>;
}
```

`parseStepLogsFile` output:

```ts
{
  byStepId: Record<string, any[]>;
}
```

`parseMiniAppsFile` output:

```ts
{
  byStepId: Record<string, Array<{
    runId: string;
    name: string;
    order?: number;
    dependsOn: string[];
  }>>;
}
```

`parseRunLogsFile` output:

```ts
{
  byRunId: Record<string, {
    kvps?: Record<string, any>;
    raw?: any;
    http?: any[];
  }>;
}
```

## Sample Data

Tree-based sample files:

`sample-data/tree-example/conversation.json`  
`sample-data/tree-example/stepLogs.json`  
`sample-data/tree-example/miniAppRuns.json`  
`sample-data/tree-example/runLogs.json`
