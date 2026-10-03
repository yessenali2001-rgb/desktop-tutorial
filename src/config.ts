import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name} (see .env.example)`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  whatsapp: {
    token: required("WHATSAPP_TOKEN"),
    phoneNumberId: required("WHATSAPP_PHONE_NUMBER_ID"),
    verifyToken: required("WHATSAPP_VERIFY_TOKEN"),
    appSecret: process.env.WHATSAPP_APP_SECRET || undefined,
    graphApiVersion: process.env.GRAPH_API_VERSION ?? "v23.0",
  },
  historyLimit: Number(process.env.HISTORY_LIMIT ?? 20),
  systemPrompt:
    process.env.SYSTEM_PROMPT ??
    "Ты дружелюбный помощник в WhatsApp. Отвечай кратко и по делу, на языке собеседника. " +
      "Не используй Markdown-заголовки и таблицы — WhatsApp их не отображает.",
};
