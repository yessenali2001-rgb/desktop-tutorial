import assert from "node:assert/strict";
import { test } from "node:test";
import { allQuestions, topics } from "./faq.js";
import { searchFaq } from "./search.js";

test("ids are unique and fit Telegram callback_data (64 bytes)", () => {
  const ids = [...topics.map((t) => `topic:${t.id}`), ...allQuestions.map((q) => `q:${q.id}`)];
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(Buffer.byteLength(id) <= 64, id);
});

test("answers use only Telegram-supported HTML tags and fit one message", () => {
  for (const item of allQuestions) {
    const tags = item.answer.match(/<\/?[a-z]+>/g) ?? [];
    for (const tag of tags) assert.match(tag, /^<\/?(b|pre)>$/, `${item.id}: ${tag}`);
    assert.ok(!/<(?!\/?(b|pre)>)/.test(item.answer), `${item.id}: unescaped <`);
    assert.ok(item.answer.length < 3500, `${item.id} is too long`);
  }
});

test("search finds the expected answers", () => {
  const cases: Record<string, string> = {
    "Как подключить сервопривод к ардуино?": "servo-arduino",
    "как настроить ПИД регулятор": "pid",
    "робот по линии": "line-follow",
    "HC-SR04 как измерить расстояние": "ultrasonic",
    "какой аккумулятор взять": "battery",
    "с чего начать новичку": "where-start",
    "шаговый двигатель a4988": "stepper",
  };
  for (const [query, id] of Object.entries(cases)) {
    assert.equal(searchFaq(query)[0]?.id, id, query);
  }
});

test("search returns nothing for unrelated text", () => {
  assert.deepEqual(searchFaq("какая сегодня погода"), []);
  assert.deepEqual(searchFaq("first lego"), searchFaq("first lego").filter((i) => i.id !== "line-sensor"));
});
