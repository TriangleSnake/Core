const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api"

export async function openDM({ peerUserId, postId, clubUsername, companyUsername }) {
  const res = await fetch("/api/chats/dm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ peerUserId, postId, clubUsername, companyUsername })
  })
  if (!res.ok) throw new Error("開啟對話失敗")
  return res.json() // { id }
}

export async function openOrgChat({ orgType, orgUsername }) {
  const res = await fetch(`/api/chats/open-org`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ orgType, orgUsername })
  })
  if (!res.ok) throw new Error("開啟聊天室失敗")
  return res.json() // { id }
}


export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include"   // ⭐ 必須帶 cookie
  })
  if (!res.ok) throw new Error("登入失敗")
  return res.json()
}

export async function logout() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include"
  })
  location = "/"
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/me`, {   // ✅ 改這裡
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
  })
  if (!res.ok) throw new Error("註冊失敗")
  return res.json()
}
