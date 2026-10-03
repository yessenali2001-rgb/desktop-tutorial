import crypto from "node:crypto";
import { config } from "./config.js";

const { token, phoneNumberId, appSecret, graphApiVersion } = config.whatsapp;
const MESSAGES_URL = `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`;

// WhatsApp rejects text bodies longer than 4096 characters.
const MAX_TEXT_LENGTH = 4096;

async function callGraphApi(body: Record<string, unknown>): Promise<void> {
  const res = await fetch(MESSAGES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...body }),
  });
  if (!res.ok) {
    throw new Error(`WhatsApp API error ${res.status}: ${await res.text()}`);
  }
}

function splitText(text: string): string[] {
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > MAX_TEXT_LENGTH) {
    let cut = rest.lastIndexOf("\n", MAX_TEXT_LENGTH);
    if (cut <= 0) cut = rest.lastIndexOf(" ", MAX_TEXT_LENGTH);
    if (cut <= 0) cut = MAX_TEXT_LENGTH;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

export async function sendText(to: string, text: string): Promise<void> {
  for (const chunk of splitText(text)) {
    await callGraphApi({ to, type: "text", text: { body: chunk } });
  }
}

// Marks the message as read and shows the "typing…" indicator.
export async function markReadWithTyping(messageId: string): Promise<void> {
  await callGraphApi({
    status: "read",
    message_id: messageId,
    typing_indicator: { type: "text" },
  });
}

// Verifies the X-Hub-Signature-256 header Meta sends with every webhook call.
export function isValidSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
  if (!appSecret) return true; // verification disabled
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const received = signatureHeader.slice("sha256=".length);
  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  );
}
