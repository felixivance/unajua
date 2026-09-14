export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "");
}

export function isAnswerCorrect(
  submitted: string,
  accepted: string,
  alternatives: string[] = []
): boolean {
  const normalizedSubmitted = normalizeAnswer(submitted);
  const candidates = [accepted, ...alternatives].map(normalizeAnswer);
  return candidates.includes(normalizedSubmitted);
}

/** Letters required to spell the answer, used to build the tappable tile set. */
export function lettersForAnswer(answer: string): string[] {
  return normalizeAnswer(answer).replace(/ /g, "").split("");
}

/**
 * Builds a shuffled tile set: the answer's own letters plus decoy letters,
 * so the board doesn't trivially reveal the answer length via visible gaps only.
 */
export function buildLetterTiles(answer: string, decoyCount = 4): string[] {
  const answerLetters = lettersForAnswer(answer);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const decoys: string[] = [];
  while (decoys.length < decoyCount) {
    const candidate = alphabet[Math.floor(Math.random() * alphabet.length)];
    decoys.push(candidate);
  }
  return shuffle([...answerLetters, ...decoys]);
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function calculatePoints(isCorrect: boolean): number {
  return isCorrect ? 100 : 0;
}
