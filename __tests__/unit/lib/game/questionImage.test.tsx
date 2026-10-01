// Spec: docs/specs/question-images.md (AC numbers in test names)
import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { hasMissingImage, promptNeedsImage } from "@/lib/game/questionImage";
import { GameScreen } from "@/components/game/GameScreen";

vi.mock("@/lib/game/actions", () => ({ submitGameAnswer: vi.fn() }));

const q = (prompt: string, image_url: string | null) => ({
  id: "q1",
  category_id: "c1",
  prompt,
  image_url,
  difficulty: 1,
  letter_tiles: ["K", "I", "C", "C", "X"],
  answer_length: 4,
});

describe("promptNeedsImage (AC-1)", () => {
  test.each(["Which building is this?", "Name the logo", "Who is pictured here?"])("%s", (p) =>
    expect(promptNeedsImage(p)).toBe(true),
  );
  test("text-only prompt does not", () => {
    expect(promptNeedsImage('Which brand uses the slogan "Twaweza"?')).toBe(false);
  });
});

describe("hasMissingImage (AC-2)", () => {
  test("flags a picture prompt with no image", () => {
    expect(hasMissingImage({ prompt: "Which building is this?", image_url: null })).toBe(true);
    expect(hasMissingImage({ prompt: "Which building is this?", image_url: "  " })).toBe(true);
  });
  test("ok with an image, or when the prompt is text-only", () => {
    expect(hasMissingImage({ prompt: "Which building is this?", image_url: "https://x/a.png" })).toBe(false);
    expect(hasMissingImage({ prompt: "Capital of Kenya?", image_url: null })).toBe(false);
  });
});

describe("GameScreen (AC-4)", () => {
  const render = (question: ReturnType<typeof q>) =>
    renderToStaticMarkup(
      <GameScreen gameId="g" categoryName="Cat" categorySlug="cat" questions={[question]} handle="h" />,
    );

  test("renders the question image when image_url is set", () => {
    expect(render(q("Which building is this?", "https://x/kicc.png"))).toContain('src="https://x/kicc.png"');
  });
  test("a picture prompt without image_url renders no <img> (the bug this guards against upstream)", () => {
    expect(render(q("Which building is this?", null))).not.toContain("<img");
  });
});
