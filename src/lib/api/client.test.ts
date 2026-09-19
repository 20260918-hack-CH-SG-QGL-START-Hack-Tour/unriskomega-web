import { expect, spyOn, test } from "bun:test";
import { ApiError, api } from "./client";

test("an unavailable chosen model preserves its explicit error without retrying a default", async () => {
  const request = spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(
      async () =>
        Response.json(
          {
            code: "MODEL_NOT_ALLOWED",
            detail: "Choose a model from the available model list.",
          },
          { status: 400 },
        ),
      { preconnect() {} },
    ),
  );
  try {
    let failure: unknown;
    try {
      await api("chat", {
        method: "POST",
        body: JSON.stringify({ model: "chosen-model" }),
      });
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ status: 400, code: "MODEL_NOT_ALLOWED" });
    expect(request).toHaveBeenCalledTimes(1);
  } finally {
    request.mockRestore();
  }
});
