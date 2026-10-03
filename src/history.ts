import type Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";

// In-memory conversation history per WhatsApp user. Only text is stored (no
// thinking blocks), so trimming old turns from the front is safe.
// Swap for Redis/DB if you need persistence across restarts.
const conversations = new Map<string, Anthropic.MessageParam[]>();

export function getHistory(userId: string): Anthropic.MessageParam[] {
  return conversations.get(userId) ?? [];
}

export function appendTurn(userId: string, userText: string, assistantText: string): void {
  const history = [
    ...getHistory(userId),
    { role: "user", content: userText } as const,
    { role: "assistant", content: assistantText } as const,
  ];
  // Keep the last N messages, starting on a user turn.
  let trimmed = history.slice(-config.historyLimit);
  if (trimmed[0]?.role === "assistant") trimmed = trimmed.slice(1);
  conversations.set(userId, trimmed);
}

export function resetHistory(userId: string): void {
  conversations.delete(userId);
}
