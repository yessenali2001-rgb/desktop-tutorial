import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";

const client = new Anthropic();

const FALLBACK_REPLY = "Извините, я не могу ответить на этот вопрос.";

// Each question is answered on its own — no conversation history.
export async function answerQuestion(question: string): Promise<string> {
  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    system: config.systemPrompt,
    messages: [{ role: "user", content: question }],
    // Q&A in a messenger is latency-sensitive: low effort keeps replies fast and cheap.
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
