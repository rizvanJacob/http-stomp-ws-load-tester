// src/utils/usernameRotator.ts
let usernames: string[] = [];
let currentIndex = 0;

export function setUsernames(newUsernames: string[]) {
  usernames = newUsernames;
  currentIndex = 0;
}

export function getNextUsername(): string | null {
  if (usernames.length === 0) return null;
  const username = usernames[currentIndex];
  currentIndex = (currentIndex + 1) % usernames.length;
  return username;
}
