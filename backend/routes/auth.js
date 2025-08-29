// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import { signToken, requireAuth } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid"

export function authRoutes(db, jwtSecret) {
  const router = express.Router();

  // 註冊：暱稱 / 姓名 / 手機 / email / password
  router.post("/register", async (req, res) => {
    try {
      let { username, fullName, phone, email, password } = req.body || {};
      if (!username || !fullName || !email || !password) {
        return res.status(400).json({ error: "缺少必要欄位" });
      }
      email = String(email).trim().toLowerCase();
      const exists = await db.get("SELECT id FROM users WHERE email = ?", [email]);
      if (exists) return res.status(409).json({ error: "Email 已被註冊" });

      const hash = await bcrypt.hash(password, 10);
      const result = await db.run(
        `INSERT INTO users (id, email, password_hash, username, name, phone)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), email, hash, username, fullName, phone || null]
      );

      const user = {
        id: result.lastID,
        email,
        username,
        fullName,
        phone: phone || null,
      };
      const token = signToken({ id: user.id }, jwtSecret);
      res.json({ token, user });
    } catch (e) {
      res.status(500).json({ error: "註冊失敗：" + e.message });
    }
  });

  // 登入：email + password
  router.post("/login", async (req, res) => {
    try {
      let { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: "缺少必要欄位" });
      email = String(email).trim().toLowerCase();

      const row = await db.get("SELECT * FROM users WHERE email = ?", [email]);
      if (!row) return res.status(401).json({ error: "帳號不存在" });

      const ok = await bcrypt.compare(password, row.password_hash);
      if (!ok) return res.status(401).json({ error: "密碼錯誤" });

      const user = {
        id: row.id,
        email: row.email,
        username: row.username,
        fullName: row.name,
        phone: row.phone,
      };
      const token = signToken({ id: user.id }, jwtSecret);
        res.cookie("token", token, {
        httpOnly: true,   // 前端 JS 不能存取
        secure: true,     // HTTPS 才能用
        sameSite: "lax",  // 防 CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7天
      })
      res.json({ user: { id: user.id, email: user.email, name: user.name } })

    } catch (e) {
      res.status(500).json({ error: "登入失敗：" + e.message });
    }
  });

  // 取得自己的使用者資料（需要帶 Bearer Token）
  router.get("/me", requireAuth(jwtSecret), async (req, res) => {
    const row = await db.get(
      "SELECT id, email, username, name as fullName, phone, created_at as createdAt FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!row) return res.status(403).json({ error: "使用者不存在" });
    res.json(row);
  });

  router.post("/logout", (req,res)=>{
    res.clearCookie("token")
    res.json({ ok:true })
  })
  return router;
}

