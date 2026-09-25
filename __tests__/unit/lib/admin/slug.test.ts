import { describe, expect, test } from "vitest";
import { normalizeAnswer, slugify } from "@/lib/admin/slug";

describe("slugify", () => {
  test("lowercases and hyphenates", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  test("strips leading/trailing hyphens from punctuation", () => {
    expect(slugify("  ¡Hola!  ")).toBe("hola");
  });

  test("collapses repeated separators", () => {
    expect(slugify("a---b   c")).toBe("a-b-c");
  });
});

describe("normalizeAnswer", () => {
  test("uppercases and strips non-alphanumerics", () => {
    expect(normalizeAnswer("Nai'robi, Kenya!")).toBe("NAIROBIKENYA");
  });

  test("empty string stays empty", () => {
    expect(normalizeAnswer("   ")).toBe("");
  });
});
