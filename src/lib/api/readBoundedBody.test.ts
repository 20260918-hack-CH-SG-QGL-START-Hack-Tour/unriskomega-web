import { describe, expect, it } from "bun:test";
import { readBoundedBody } from "./readBoundedBody";

describe("bounded request bodies", () => {
  it("rejects declared oversized bodies", async () => {
    const request = new Request("https://example.org", {
      method: "POST",
      body: "test",
      headers: { "content-length": "100" },
    });
    await expect(readBoundedBody(request, 5)).rejects.toThrow();
  });
  it("rejects oversized content without a length header", async () => {
    const request = new Request("https://example.org", {
      method: "POST",
      body: "123456",
    });
    await expect(readBoundedBody(request, 5)).rejects.toThrow();
  });
  it("preserves utf8 bodies below the cap", async () => {
    const request = new Request("https://example.org", {
      method: "POST",
      body: "été",
    });
    expect(await readBoundedBody(request, 20)).toBe("été");
  });
});
