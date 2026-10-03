import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";
import { getHistory } from "./history.js";

const client = new Anthropic();

const FALLBACK_REPLY = "Извините, я не могу помочь с этим запросом.";

export async function generateReply(userId: string, userText: string): Promise<string> {
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...getHistory(userId),
    { role: "user", content: userText },
  ];

  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    system: config.systemPrompt,
    messages,
    // Chat is latency-sensitive: low effort keeps replies fast and cheap.
    output_config: { effort: "low" },
    // On a safety-classifier decline, the API retries on a recommended model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  if (response.stop_reason === "refusal") {
    return FALLBACK_REPLY;
  }

  const text = response.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  return text || FALLBACK_REPLY;
}
