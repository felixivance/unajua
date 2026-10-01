// A prompt that points at a picture is unsolvable without one (the player only sees tiles).
// ponytail: keyword heuristic; widen the list if a new puzzle style slips through.
const POINTS_AT_PICTURE = /\b(this|these|pictured|shown|logo|image|picture|photo)\b/i;

export function promptNeedsImage(prompt: string) {
  return POINTS_AT_PICTURE.test(prompt);
}

export function hasMissingImage(q: { prompt: string; image_url: string | null }) {
  return promptNeedsImage(q.prompt) && !q.image_url?.trim();
}
