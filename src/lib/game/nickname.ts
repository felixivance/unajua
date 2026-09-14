const STORAGE_KEY = "tambua_nickname";

export function getStoredNickname(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function storeNickname(nickname: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, nickname);
}
