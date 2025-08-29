import express from "express"
import { requireAuth } from "../middleware/auth.js"

export function usersRoutes(db, jwtSecret) {
  const router = express.Router()

  // 取得使用者資料
  router.get("/:username", async (req, res) => {
    try {
      const user = await db.get(
        "SELECT id, name, username, email, phone, created_at FROM users WHERE username = ?",
        [req.params.username]
      )
      if (!user) return res.status(404).json({ error: "使用者不存在" })
      res.json(user)
    } catch (err) {
      res.status(500).json({ error: "無法取得使用者資料" })
    }
  })

  // 取得使用者頭貼 (回傳 base64 data URL)
  router.get("/:username/avatar", async (req, res) => {
    try {
      const row = await db.get("SELECT avatar FROM users WHERE username = ?", [req.params.username])
      if (!row || !row.avatar) {
        return res.json({ avatar: null }) // 前端可 fallback 預設圖
      }
      res.json({ avatar: row.avatar.toString() })
    } catch (err) {
      res.status(500).json({ error: "無法取得頭貼" })
    }
  })

  // 更新頭貼 (直接存 Base64 Data URL)
  router.post(
    "/:username/avatar",
    requireAuth(jwtSecret),
    express.json({ limit: "5mb" }), // 限制 JSON 請求大小
    async (req, res) => {
      const { username } = req.params

      if (req.user.username !== username) {
        return res.status(403).json({ error: "不能修改別人的頭貼" })
      }

      const { avatar } = req.body
      if (!avatar) return res.status(400).json({ error: "缺少 avatar" })

      // 驗證輸入格式：必須是 data:image 開頭
      if (typeof avatar !== "string" || !avatar.startsWith("data:image/")) {
        return res.status(400).json({ error: "頭貼格式錯誤，必須是 data:image/*" })
      }

      // ✅ 允許的格式
      if (
        !(
          avatar.startsWith("data:image/png") ||
          avatar.startsWith("data:image/jpeg") ||
          avatar.startsWith("data:image/gif") ||
          avatar.startsWith("data:image/webp")
        )
      ) {
        return res.status(400).json({ error: "僅支援 PNG / JPEG / GIF / WebP" })
      }

      // ✅ 限制大小（2MB）
      const MAX_LENGTH = 2 * 1024 * 1024
      if (avatar.length > MAX_LENGTH * 1.37) {
        return res.status(413).json({ error: "頭貼太大，限制 2MB" })
      }

      try {
        await db.run("UPDATE users SET avatar = ? WHERE username = ?", [avatar, username])
        res.json({ ok: true })
      } catch (err) {
        res.status(500).json({ error: "更新頭貼失敗", detail: err.message })
      }
    }
  )

  // 取得使用者的組織（社團 & 公司）
  router.get("/:username/orgs", async (req, res) => {
    try {
      const { username } = req.params
      const user = await db.get("SELECT id FROM users WHERE username = ?", [username])
      if (!user) return res.status(404).json({ error: "使用者不存在" })

      const userId = user.id

      const clubs = await db.all(
        `
        SELECT c.username, c.name, c.school, c.avatar
        FROM clubs c
        JOIN club_users cu ON cu.club_username = c.username
        WHERE cu.user_id = ?
        ORDER BY c.name COLLATE NOCASE ASC
        `,
        [userId]
      )

      const companies = await db.all(
        `
        SELECT co.username, co.name, co.business_no AS businessNo, co.avatar
        FROM companies co
        JOIN company_users cu ON cu.company_username = co.username
        WHERE cu.user_id = ?
        ORDER BY co.name COLLATE NOCASE ASC
        `,
        [userId]
      )

      res.json({ clubs, companies })
    } catch (err) {
      res.status(500).json({ error: "無法取得使用者的組織資料" })
    }
  })

  return router
}
