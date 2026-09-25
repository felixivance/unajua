import { describe, expect, test } from "vitest";
import { generateHandle } from "@/lib/game/nickname";

describe("generateHandle", () => {
  test("returns a 'Place Mark' string within storage length", () => {
    for (let i = 0; i < 50; i++) {
      const handle = generateHandle();
      expect(handle.length).toBeLessThanOrEqual(24);
      expect(handle).toMatch(/^\S+ \S+$/);
    }
  });
});
