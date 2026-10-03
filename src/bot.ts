import { Bot, type Context, GrammyError, HttpError, InlineKeyboard } from "grammy";
import { config } from "./config.js";
import { escapeHtml, findQuestion, findTopic, topics, type FaqItem } from "./faq.js";
import { searchFaq } from "./search.js";

const bot = new Bot(config.botToken);

const WELCOME_TEXT =
  "🤖 Привет! Я бот-помощник по робототехнике.\n\n" +
  "Выберите тему в меню или просто напишите вопрос, например: " +
  "«как подключить сервопривод» или «что такое ПИД».";

function topicsKeyboard(): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (const topic of topics) {
    keyboard.text(topic.title, `topic:${topic.id}`).row();
  }
  return keyboard;
}

function questionsKeyboard(items: FaqItem[]): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (const item of items) {
    keyboard.text(item.question, `q:${item.id}`).row();
  }
  return keyboard;
}

function answerKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text("📚 Все темы", "menu");
}

async function showMenu(ctx: Context) {
  await ctx.reply(WELCOME_TEXT, { reply_markup: topicsKeyboard() });
}

bot.command(["start", "help", "menu"], showMenu);

bot.callbackQuery("menu", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("Выберите тему:", { reply_markup: topicsKeyboard() });
});

bot.callbackQuery(/^topic:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const topic = findTopic(ctx.match[1]);
  if (!topic) return;
  const keyboard = questionsKeyboard(topic.questions).text("⬅️ Назад к темам", "menu");
  await ctx.reply(`${topic.title}\n\nВыберите вопрос:`, { reply_markup: keyboard });
});

bot.callbackQuery(/^q:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const item = findQuestion(ctx.match[1]);
  if (!item) return;
  await ctx.reply(`❓ <b>${escapeHtml(item.question)}</b>\n\n${item.answer}`, {
    parse_mode: "HTML",
    reply_markup: answerKeyboard(),
  });
});

bot.on("message:text", async (ctx) => {
  const results = searchFaq(ctx.message.text);
  if (results.length === 0) {
    await ctx.reply(
      "😕 Не нашёл ответа на этот вопрос. Попробуйте сформулировать иначе или выберите тему:",
      { reply_markup: topicsKeyboard() },
    );
    return;
  }
  const keyboard = questionsKeyboard(results).text("📚 Все темы", "menu");
  await ctx.reply("Вот что я нашёл по вашему вопросу:", { reply_markup: keyboard });
});

bot.on("message", async (ctx) => {
  await ctx.reply("Пожалуйста, напишите вопрос текстом или выберите тему:", {
    reply_markup: topicsKeyboard(),
  });
});

bot.catch((err) => {
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Telegram API error:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not reach Telegram:", e);
  } else {
    console.error("Unexpected error:", e);
  }
});

try {
  await bot.api.setMyCommands([
    { command: "start", description: "Главное меню" },
    { command: "menu", description: "Темы вопросов" },
  ]);
} catch (err) {
  console.error("Could not connect to Telegram — check BOT_TOKEN in .env:", err);
  process.exit(1);
}

console.log("Robotics bot started");
await bot.start();
