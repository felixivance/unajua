const STORAGE_KEY = "unajua_nickname";

const PLACES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Lamu",
  "Nyeri",
  "Malindi",
  "Kitale",
  "Thika",
  "Kericho",
  "Machakos",
  "Meru",
  "Naivasha",
  "Kakamega",
];

const MARKS = ["Simba", "Nyati", "Twiga", "Chui", "Ndovu", "Jogoo", "Tai", "Swara", "Kifaru"];

export function generateHandle() {
  const place = PLACES[Math.floor(Math.random() * PLACES.length)];
  const mark =
    Math.random() < 0.4
      ? String(1 + Math.floor(Math.random() * 99))
      : MARKS[Math.floor(Math.random() * MARKS.length)];
  return `${place} ${mark}`.slice(0, 24);
}

export function getStoredNickname(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY)?.trim() || null;
}

export function storeNickname(nickname: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, nickname.trim().slice(0, 24));
}

export function getOrCreateHandle() {
  const existing = getStoredNickname();
  if (existing) return existing;
  const next = generateHandle();
  storeNickname(next);
  return next;
}
