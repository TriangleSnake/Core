// routes/companies.js
import express from "express"
import { requireAuth } from "../middleware/auth.js"

export function companiesRoutes(db, jwtSecret) {
  const router = express.Router()

  // 取得所有公司（若已存在就略）
  router.get("/", async (req, res) => {
    try {
      const companies = await db.all(
        "SELECT id, business_no AS businessNo, name, info, stars FROM companies"
      )
      res.json(companies)
    } catch (err) {
      res.status(500).json({ error: "無法取得公司列表" })
    }
  })

  // ✅ 取得單一公司（給 /companies/:id 頁面）
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params
      const company = await db.get(
        "SELECT id, business_no AS businessNo, name, info, stars FROM companies WHERE id = ?",
        [id]
      )
      if (!company) return res.status(404).json({ error: "公司不存在" })

      const { count } = await db.get(
        "SELECT COUNT(*) AS count FROM company_users WHERE company_id = ?",
        [id]
      )

      res.json({ ...company, memberCount: count })
    } catch (err) {
      res.status(500).json({ error: "無法取得公司資料" })
    }
  })

  // ✅ 取得公司頭貼（Base64）
  router.get("/:id/avatar", async (req, res) => {
    try {
      const { id } = req.params
      const row = await db.get("SELECT avatar FROM companies WHERE id = ?", [id])
      if (!row || !row.avatar) return res.json({ avatar: null })
      res.json({ avatar: row.avatar })
    } catch (err) {
      res.status(500).json({ error: "無法取得公司頭貼" })
    }
  })

  // ✅ 更新公司頭貼（Base64，需權限）
  router.post(
    "/:id/avatar",
    requireAuth(jwtSecret),
    express.json({ limit: "5mb" }),
    async (req, res) => {
      const { id } = req.params
      const { avatar } = req.body

      if (typeof avatar !== "string" || !avatar.startsWith("data:image/")) {
        return res.status(400).json({ error: "頭貼格式錯誤，必須是 data:image/*" })
      }

      const MAX_BASE64_LEN = 3 * 1024 * 1024
      if (avatar.length > MAX_BASE64_LEN) {
        return res.status(413).json({ error: "頭貼太大（上限約 2MB 原始檔）" })
      }

      try {
        const co = await db.get("SELECT id FROM companies WHERE id = ?", [id])
        if (!co) return res.status(404).json({ error: "公司不存在" })

        await db.run("UPDATE companies SET avatar = ? WHERE id = ?", [avatar, id])
        res.json({ ok: true })
      } catch (err) {
        res.status(500).json({ error: "更新公司頭貼失敗", detail: err.message })
      }
    }
  )

  // 成員清單
  router.get("/:id/members", async (req, res) => {
    try {
      const members = await db.all(
        `SELECT u.id, u.name, u.username, u.email
         FROM users u
         JOIN company_users cu ON u.id = cu.user_id
         WHERE cu.company_id = ?
         ORDER BY cu.joined_at DESC`,
        [req.params.id]
      )
      res.json(members)
    } catch (err) {
      res.status(500).json({ error: "無法取得成員清單", detail: err.message })
    }
  })

  // 使用者加入公司
  router.post("/:id/join", requireAuth(jwtSecret), async (req, res) => {
    const companyId = req.params.id
    const userId = req.user.id
    try {
      const co = await db.get("SELECT id FROM companies WHERE id = ?", [companyId])
      if (!co) return res.status(404).json({ error: "公司不存在" })

      const result = await db.run(
        "INSERT OR IGNORE INTO company_users (company_id, user_id) VALUES (?, ?)",
        [companyId, userId]
      )
      if (result.changes === 0) {
        return res.status(200).json({ ok: true, joined: false, message: "已經是成員" })
      }
      res.status(201).json({ ok: true, joined: true, message: "加入成功" })
    } catch (err) {
      res.status(500).json({ error: "加入公司失敗", detail: err.message })
    }
  })

  // 使用者退出公司
  router.post("/:id/leave", requireAuth(jwtSecret), async (req, res) => {
    const companyId = req.params.id
    const userId = req.user.id
    try {
      await db.run("DELETE FROM company_users WHERE company_id = ? AND user_id = ?", [companyId, userId])
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: "退出公司失敗", detail: err.message })
    }
  })

  return router
}
