import { accessSync, constants, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const HOOK = ".githooks/pre-commit";

describe("pre-commit wiring", () => {
  test("AC-1: precommit script runs typegen, tsc and vitest", () => {
    const s: string = pkg.scripts.precommit;
    expect(s).toContain("next typegen");
    expect(s).toContain("tsc --noEmit");
    expect(s).toContain("vitest run");
  });

  test("AC-1/AC-2: hook is executable, runs the script and aborts on failure", () => {
    expect(() => accessSync(HOOK, constants.X_OK)).not.toThrow();
    const body = readFileSync(HOOK, "utf8");
    expect(body).toContain("npm run precommit");
    expect(body).toMatch(/^set -e/m);
  });

  test("AC-3: prepare points git at .githooks", () => {
    expect(pkg.scripts.prepare).toContain("core.hooksPath .githooks");
  });
});
