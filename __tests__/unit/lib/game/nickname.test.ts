import { describe, expect, test } from "vitest";
import { generateHandle, generateUniqueHandle } from "@/lib/game/nickname";

describe("generateHandle", () => {
  test("returns a 'Place Mark' string within storage length", () => {
    for (let i = 0; i < 50; i++) {
      const handle = generateHandle();
      expect(handle.length).toBeLessThanOrEqual(24);
      expect(handle).toMatch(/^\S+ \S+$/);
    }
  });
});

describe("generateUniqueHandle (AC-11)", () => {
  test("returns the first free candidate", async () => {
    const handle = await generateUniqueHandle(async () => true);
    expect(handle).toMatch(/^\S+ \S+$/);
  });

  test("skips taken candidates", async () => {
    let calls = 0;
    const handle = await generateUniqueHandle(async () => ++calls === 4);
    expect(handle).toBeTruthy();
    expect(calls).toBe(4);
  });

  test("after 5 taken it appends a 4-digit suffix within 24 chars", async () => {
    let calls = 0;
    const handle = await generateUniqueHandle(async () => ++calls > 5);
    expect(calls).toBe(6);
    expect(handle).toMatch(/ \d{4}$/);
    expect(handle.length).toBeLessThanOrEqual(24);
  });

  test("throws when everything is taken", async () => {
    let calls = 0;
    await expect(
      generateUniqueHandle(async () => {
        calls++;
        return false;
      }),
    ).rejects.toThrow();
    expect(calls).toBe(10);
  });
});
