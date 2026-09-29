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

/** Random handle the server has not seen. `isFree` should claim it as a side effect. */
export async function generateUniqueHandle(isFree: (handle: string) => Promise<boolean>) {
  for (let i = 0; i < 5; i++) {
    const handle = generateHandle();
    if (await isFree(handle)) return handle;
  }
  for (let i = 0; i < 5; i++) {
    const handle = `${generateHandle().slice(0, 19)} ${1000 + Math.floor(Math.random() * 9000)}`;
    if (await isFree(handle)) return handle;
  }
  throw new Error("Could not find a free nickname.");
}

const TOKEN_KEY = "unajua_player_token";

/** Random per-device id that owns this device's nickname claim. */
export function getOrCreateToken() {
  let token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    window.localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}
