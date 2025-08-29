// routes/roster.js
import express from "express"

export function rosterRoutes(db) {
  const router = express.Router()

  router.get("/", async (req, res) => {
    try {
      // clubs + 成員數
      const clubs = await db.all(`
        SELECT c.id, c.school, c.name, c.info, c.activity, c.stars,
               COUNT(cu.user_id) as memberCount
        FROM clubs c
        LEFT JOIN club_users cu ON c.id = cu.club_id
        GROUP BY c.id
      `)

      // companies (暫時沒關聯表，只有 stars)
      const companies = await db.all(`
        SELECT id, business_no as businessNo, name, info, stars
        FROM companies
      `)

      res.json({ clubs, companies })
    } catch (err) {
      console.error("❌ roster query failed:", err)
      res.status(500).json({ error: "無法取得名錄" })
    }
  })

  return router
}
