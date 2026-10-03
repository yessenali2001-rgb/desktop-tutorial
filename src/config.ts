import "dotenv/config";

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  throw new Error("Missing BOT_TOKEN environment variable (see .env.example)");
}

export const config = { botToken };
