import express from "express"
import { requireAuth } from "../middleware/auth.js"

export function meRoutes(db, jwtSecret) {
  const router = express.Router()

  // 取得自己的基本資料
  router.get("/", requireAuth(jwtSecret), async (req, res) => {
    try {
      const user = await db.get(
        `SELECT id, username, name, email, phone, created_at, avatar
         FROM users WHERE id = ?`,
        [req.user.id]
      )
      if (!user) return res.status(404).json({ error: "使用者不存在" })
      res.json(user)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "無法取得我的資料" })
    }
  })

  // 取得我加入的社團 & 公司
  router.get("/orgs", requireAuth(jwtSecret), async (req, res) => {
    try {
      const userId = req.user.id

      // 我加入的社團
      const clubs = await db.all(
        `
        SELECT c.username, c.name, c.school,
               (SELECT COUNT(*) FROM club_users cu WHERE cu.club_username = c.username) AS memberCount
        FROM clubs c
        JOIN club_users cu ON cu.club_username = c.username
        WHERE cu.user_id = ?
        ORDER BY c.name COLLATE NOCASE ASC
        `,
        [userId]
      )

      // 我加入的公司
      const companies = await db.all(
        `
        SELECT co.username, co.name, co.business_no AS businessNo,
               (SELECT COUNT(*) FROM company_users cpu WHERE cpu.company_username = co.username) AS memberCount
        FROM companies co
        JOIN company_users cpu ON cpu.company_username = co.username
        WHERE cpu.user_id = ?
        ORDER BY co.name COLLATE NOCASE ASC
        `,
        [userId]
      )

      res.json({ clubs, companies })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "無法取得我的組織清單" })
    }
  })

  return router
}
