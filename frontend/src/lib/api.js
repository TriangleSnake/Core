const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api"

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include"   // ⭐ 這行很重要，會帶 cookie
  })
  if (!res.ok) throw new Error("登入失敗")
  return res.json()
}

export async function logout() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include"
  })
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include"
  })
  if (!res.ok) return null
  return res.json()
}

export async function register(req) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("註冊失敗");
  return res.json(); // 回傳 { token, user }
}
