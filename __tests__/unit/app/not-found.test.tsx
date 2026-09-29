// Spec: docs/specs/not-found-page.md (AC numbers in test names)
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import NotFound, { metadata } from "@/app/not-found";

const html = renderToStaticMarkup(<NotFound />);

describe("not-found page", () => {
  test("AC-2 one h1, 404 hidden from screen readers", () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/aria-hidden="true"[^>]*>404</);
  });
  test("AC-3 says what happened", () => {
    expect(html).toContain("This page doesn&#x27;t exist");
  });
  test("AC-4 links: play (primary), home, leaderboard", () => {
    expect(html).toMatch(/href="\/play"[^>]*>Play now</);
    expect(html).toMatch(/href="\/"[^>]*>Home</);
    expect(html).toMatch(/href="\/leaderboard"[^>]*>Leaderboard</);
  });
  test("AC-5 title", () => {
    expect(metadata.title).toBe("Page not found | Unajua");
  });
});
