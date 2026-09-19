import { expect, test } from "bun:test";
import { conversationHistory } from "./conversation";

test("history retains the last twelve nonempty conversational turns", () => {
  const messages = Array.from({ length: 15 }, (_, index) => ({
    role: "user" as const,
    text: `Turn ${index}`,
  }));
  const result = conversationHistory([
    ...messages,
    { role: "assistant", text: " " },
  ]);
  expect(result).toHaveLength(12);
  expect(result[0].content).toBe("Turn 3");
  expect(result[11].content).toBe("Turn 14");
});

test("history obeys byte limits without corrupting multilingual characters", () => {
  const result = conversationHistory(
    Array.from({ length: 12 }, () => ({
      role: "assistant" as const,
      text: "€🙂".repeat(1000),
    })),
  );
  const sizes = result.map(
    ({ content }) => new TextEncoder().encode(content).length,
  );
  expect(sizes.every((size) => size <= 4000)).toBe(true);
  expect(sizes.reduce((sum, size) => sum + size, 0)).toBeLessThanOrEqual(16000);
  expect(result.every(({ content }) => !content.includes("\uFFFD"))).toBe(true);
});

test("history forwards text and roles without image bytes or runtime metadata", () => {
  const result = conversationHistory([
    { role: "assistant", text: "Image summary" },
  ]);
  expect(result).toEqual([{ role: "assistant", content: "Image summary" }]);
});
