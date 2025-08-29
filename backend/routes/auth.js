import express from "express"
import bcrypt from "bcrypt"
import { signToken, requireAuth } from "../middleware/auth.js"
import { v4 as uuidv4 } from "uuid"
import { validateUsername } from "../utils/username.js"

export function authRoutes(db, jwtSecret) {
  const router = express.Router()

  // 註冊
  router.post("/register", express.json(), async (req, res) => {
    const { name, username, email, password, phone } = req.body || {}
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: "缺少必要欄位" })
    }
    if (!validateUsername(username)) {
      return res.status(400).json({ error: "username 僅能使用 a-z 0-9 -，長度 3~32" })
    }

    // 唯一性檢查
    const takenU = await db.get(`SELECT 1 FROM users WHERE username = ?`, [username.toLowerCase()])
    if (takenU) return res.status(409).json({ error: "username 已被使用" })
    const takenE = await db.get(`SELECT 1 FROM users WHERE email = ?`, [email.toLowerCase()])
    if (takenE) return res.status(409).json({ error: "email 已被使用" })

    const hash = await bcrypt.hash(password, 10)
    const id = uuidv4()
    await db.run(
      `INSERT INTO users (id, name, username, email, password_hash, phone) VALUES (?,?,?,?,?,?)`,
      [id, name, username.toLowerCase(), email.toLowerCase(), hash, phone || ""]
    )
    res.json({ ok: true })
  })

  // 登入
  router.post("/login", express.json(), async (req, res) => {
    try {
      let { email, password } = req.body || {}
      if (!email || !password) return res.status(400).json({ error: "缺少必要欄位" })
      email = String(email).trim().toLowerCase()

      const row = await db.get("SELECT * FROM users WHERE email = ?", [email])
      if (!row) return res.status(401).json({ error: "帳號不存在" })

      const ok = await bcrypt.compare(password, row.password_hash)
      if (!ok) return res.status(401).json({ error: "密碼錯誤" })

      const user = {
        id: row.id,
        email: row.email,
        username: row.username,
        name: row.name,
        phone: row.phone,
      }
      const token = signToken({ id: user.id }, jwtSecret)
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      res.json({ user })
    } catch (e) {
      res.status(500).json({ error: "登入失敗：" + e.message })
    }
  })

  // 登出
  router.post("/logout", (req, res) => {
    res.clearCookie("token")
    res.json({ ok: true })
  })

  return router
}
