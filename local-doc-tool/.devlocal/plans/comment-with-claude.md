# Feature: Comment / discuss the result with Claude (threaded follow-up)

## Goal
After an AI Answer is produced, let the user send follow-up comments/questions to
Claude, grounded on the same session, and see the exchange as a threaded transcript
in the AI Answer pane.

## Key finding
The backend already supports this: `handleReply` resumes the Claude session
(`claude --resume <id> "<text>"`) with any text. The only missing pieces are (a) a
clean stream *reconnect* after a turn finishes, and (b) a user-facing follow-up
composer + transcript on the frontend. Existing clarification `ReplyInput` is
untouched.

## Changes

1. **web/backend/src/query.js — `handleStream`**  → verify: reconnecting to a
   `phase==='done'` session holds the SSE open (registers client, cleans up on
   close) instead of re-piping the dead child, so a follow-up `reply` streams there.
   Guarded by `phase==='done'`, so existing `phase==='running'` stream tests are
   unaffected.

2. **web/frontend/src/app.jsx**
   - New `turns` state: `[{ role:'user'|'assistant', markdown }]`.
   - Extract inline stream handlers into `buildHandlers(mode)` (reused by initial
     query and follow-up). `answer` handler also pushes an assistant turn.
   - Reset `turns` in `onSubmit`; set a single assistant turn in `restoreRun` and
     null `sessionId` there (restored history is view-only → no follow-up).
   - `onFollowUp(text)`: push user turn, reconnect stream, `postReply`; on failure
     reset running/done. → verify: sending a follow-up streams a new grounded answer.
   - Pass `turns`, `onFollowUp`, `canFollowUp` to `AnswerPanel`.
     `canFollowUp = ranMode==='ai' && !!sessionId && !running && has assistant turn`.

3. **web/frontend/src/components/AnswerPanel.jsx**  → verify: renders a transcript
   of turns (assistant=markdown, user=plain bubble) + working state + a follow-up
   composer; falls back to single `markdown` prop when no turns (keeps existing
   `answerPanel.test.jsx` green).

4. **web/frontend/src/components/AnswerPanel.css** — thread bubble + composer styles
   using existing CSS variables.

## Verify
- `npm test` (backend + frontend) stays green.
- Manual: run an AI query → answer appears → type a follow-up → new grounded answer
  stacks below → repeat.
