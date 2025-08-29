// utils/username.js
export const USERNAME_RE = /^[a-z0-9-]{3,32}$/ // 僅小寫英數與連字號，3~32 字

export function validateUsername(u) {
  return typeof u === "string" && USERNAME_RE.test(u)
}
