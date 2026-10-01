# Puzzle images must be present

**Status:** Implemented. Tests in `__tests__/unit/lib/game/questionImage.test.tsx`.

## Why

A player reported a question that showed only letter tiles. The seeded "Which building is this?" has `image_url = null`, so the prompt points at a picture that does not exist.

## Acceptance criteria

- **AC-1** `promptNeedsImage` is true for prompts that point at a picture (this, these, pictured, shown, logo, image, picture, photo).
- **AC-2** `hasMissingImage` is true when such a prompt has no image (null, empty or whitespace).
- **AC-3** The admin question form refuses to save a question that fails AC-2.
- **AC-4** When a question has an image, `GameScreen` renders an `<img>` with that URL.
- **AC-5** The known seeded offender is deactivated (`0012_hide_imageless_puzzle.sql`).

## Known limits

- Keyword heuristic; a prompt that points at a picture without those words is not caught.
- Questions already in the live database that fail AC-2 are not found automatically. Query: `select id, prompt from questions where image_url is null and prompt ~* '\m(this|these|pictured|shown|logo|image|picture|photo)\M';`
- An image that has a URL but fails to load (deleted file, network) is not handled yet; the player sees a broken image.
