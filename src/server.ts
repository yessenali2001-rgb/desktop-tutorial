import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";
import { generateReply } from "./claude.js";
import { appendTurn, resetHistory } from "./history.js";
import { isValidSignature, markReadWithTyping, sendText } from "./whatsapp.js";

interface IncomingMessage {
  from: string;
  id: string;
  type: string;
  text?: { body: string };
}

const app = express();

// Keep the raw body around for signature verification.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);

app.get("/", (_req, res) => {
  res.send("WhatsApp Claude bot is running");
});

// Webhook verification handshake (Meta calls this once when you save the webhook URL).
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === config.whatsapp.verifyToken) {
    res.status(200).send(String(challenge));
  } else {
    res.sendStatus(403);
  }
});

// Meta retries deliveries, so remember recently handled message IDs.
const seenMessageIds = new Set<string>();
function alreadySeen(id: string): boolean {
  if (seenMessageIds.has(id)) return true;
  seenMessageIds.add(id);
  if (seenMessageIds.size > 5000) {
    const oldest = seenMessageIds.values().next().value;
    if (oldest) seenMessageIds.delete(oldest);
  }
  return false;
}

// Process one user's messages strictly in order.
const userQueues = new Map<string, Promise<void>>();
function enqueue(userId: string, task: () => Promise<void>): void {
  const previous = userQueues.get(userId) ?? Promise.resolve();
  const next = previous.then(task).catch((err) => console.error(`Error for ${userId}:`, err));
  userQueues.set(userId, next);
  void next.finally(() => {
    if (userQueues.get(userId) === next) userQueues.delete(userId);
  });
}

async function handleMessage(message: IncomingMessage): Promise<void> {
  const from = message.from;

  if (message.type !== "text" || !message.text) {
    await sendText(from, "Пока я понимаю только текстовые сообщения 🙂");
    return;
  }

  const text = message.text.body.trim();

  if (text.toLowerCase() === "/reset") {
    resetHistory(from);
    await sendText(from, "Начинаем разговор заново ✨");
    return;
  }

  await markReadWithTyping(message.id).catch((err) =>
    console.warn("Could not mark message as read:", err),
  );

  try {
    const reply = await generateReply(from, text);
    appendTurn(from, text, reply);
    await sendText(from, reply);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      await sendText(from, "Слишком много запросов, попробуйте через минуту.");
    } else if (err instanceof Anthropic.APIError) {
      console.error(`Claude API error ${err.status}:`, err.message);
      await sendText(from, "Произошла ошибка, попробуйте ещё раз позже.");
    } else {
      throw err;
    }
  }
}

app.post("/webhook", (req, res) => {
  const rawBody = (req as express.Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody || !isValidSignature(rawBody, req.get("x-hub-signature-256"))) {
    res.sendStatus(401);
    return;
  }

  // Acknowledge immediately; Meta expects a fast 200.
  res.sendStatus(200);

  if (req.body?.object !== "whatsapp_business_account") return;

  for (const entry of req.body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const messages: IncomingMessage[] = change.value?.messages ?? [];
      for (const message of messages) {
        if (alreadySeen(message.id)) continue;
        enqueue(message.from, () => handleMessage(message));
      }
    }
  }
});

app.listen(config.port, () => {
  console.log(`WhatsApp bot listening on port ${config.port}`);
});
