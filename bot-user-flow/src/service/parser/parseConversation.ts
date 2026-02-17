import type { ConversationFile } from "../../types";
import type { ParsedConversation } from "./types";

/**
 * Parses `conversation.json` into a normalized structure.
 *
 * Output:
 * - `conversationId`: unique conversation identifier.
 * - `steps`: ordered list of steps with flattened dialogue text fields.
 */
export function parseConversationFile(conversation: ConversationFile): ParsedConversation {
  return {
    conversationId: conversation.conversation_id,
    steps: (conversation.steps ?? []).map((s) => ({
      stepId: s.step_id,
      ts: s.ts,
      userText: s.user?.text ?? "",
      botText: s.bot?.text ?? "",
    })),
  };
}
