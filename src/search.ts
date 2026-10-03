import { allQuestions, type FaqItem } from "./faq.js";

function normalize(text: string): string {
  return text.toLowerCase().replace(/ё/g, "е");
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A keyword is a word stem: it must start a word ("серв" matches "сервопривод",
// but "ir" does not match "first").
function matchesStem(text: string, stem: string): boolean {
  return new RegExp(`(^|[^a-zа-я0-9])${escapeRegExp(normalize(stem))}`).test(text);
}

// Returns the best-matching FAQ items for a free-text question, best first.
export function searchFaq(query: string, limit = 3): FaqItem[] {
  const text = normalize(query);
  return allQuestions
    .map((item) => ({
      item,
      score: item.keywords.filter((stem) => matchesStem(text, stem)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}
