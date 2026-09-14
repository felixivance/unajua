# Visual Rebus Puzzle Style Guide

Rebus puzzles are a picture-puzzle question format: two or more visual "clues" combine
(phonetically or literally) to spell the answer. Example: **Sodium** (chemical symbol "Na")
**+** a photo of a **rock** → **Na + Rock = Narok** (a Kenyan county).

This doc defines the visual style so every rebus puzzle feels like it belongs to the same
family, regardless of who creates it or which tool generates the artwork.

## Composition

- **Canvas:** 1280×720 (16:9), matches question card image aspect ratio used across Tambua.
- **Background:** flat white (`#FFFFFF`). No gradients, no scenery, no shadows on the canvas itself.
- **Layout:** clues arranged left-to-right in reading order, vertically centered.
- **Connector:** a bold black `+` between clue elements. Use `=` only if the final answer is
  briefly revealed for teaching/example purposes (never in an actual live question — the answer
  must stay hidden until the player submits).
- **Clue types**, mixed freely within one puzzle:
  - **Word/text clue** — large, clean black sans-serif label (e.g. "Sodium"). Used when the
    clue is itself a word, abbreviation, or symbol easier to read than to draw.
  - **Object/photo clue** — a single subject, isolated on white (product-photo or clean 3D
    render style), no background clutter, no props unrelated to the clue.
  - **Letter/number clue** — a single bold glyph (e.g. "Q", "A", roman numeral "VI") styled
    identically to the text clue treatment.

## Object clue art style

- Isolated subject on pure white, soft natural studio lighting, subtle contact shadow only if
  it reads as a real photograph (no drawn/cartoon shadow blobs).
- Photographic or clean 3D-render quality — not flat vector/cartoon icons. The goal is the same
  premium, slightly editorial look as a product photograph, not a clip-art sticker.
- Single subject per clue image, centered, filling roughly 70–80% of its allotted frame.
- No text, watermarks, or logos baked into object clue images.

## Text clue typography

- Font: a clean grotesque sans-serif (system default is fine — do not introduce a new
  webfont just for puzzle art).
- Color: pure black (`#000000`) on white, no color, no outline/stroke effects.
- Weight: regular to medium — legibility over decoration.

## Answer construction rules

- The concatenation of clue sounds/symbols must spell the accepted answer with **no more than
  one loose phonetic step** (e.g. "Night" + "Robe" → "Nairobi" is acceptable; anything requiring
  two stretchy leaps is not — it stops being satisfying to solve).
- Prefer clues that are unambiguous on sight. If an object could reasonably be misread (e.g. a
  bass fish vs. a generic fish), pick a more universally recognizable object instead, or fall
  back to a text clue.
- Every rebus question still carries the standard fields: `accepted_answer`,
  `alternative_answers`, `explanation`, `source_name` — the explanation should spell out the
  wordplay explicitly (e.g. "Na (sodium) + Rock = Narok!") since that's part of the reward.

## File & upload conventions

- Export as PNG, white background flattened (no transparency needed).
- Upload through `/admin` → question image picker (stored in the `question-images` Supabase
  Storage bucket) — do not hotlink external images.
- Keep file size reasonable (<500KB) since these load on mobile data in Kenya.

## Do

- Keep it to 2–3 clues max per puzzle.
- Reuse a consistent "photo-on-white" object style across every object clue so the whole
  category feels like one designed set, not a collage of found images.
- Make the pun genuinely satisfying — the target reaction is "I want to try another one," not
  "I guess that's technically right."

## Don't

- Don't use real brand logos or copyrighted photography as clue art — generate/illustrate
  original object clues instead.
- Don't add background scenery, borders, or decorative frames around the canvas.
- Don't reveal the answer text anywhere in the puzzle image itself.
